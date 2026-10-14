package com.tripzy.service;

import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.errors.GenAiIOException;
import com.google.genai.errors.ServerException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.HttpRetryOptions;
import com.google.genai.types.Part;
import com.tripzy.dto.CommunityDtos.AiChatRequest;
import com.tripzy.dto.CommunityDtos.AiChatResponse;
import com.tripzy.dto.CommunityDtos.ChatTurn;
import com.tripzy.entity.Destination;
import com.tripzy.entity.Trip;
import com.tripzy.repository.DestinationRepository;
import com.tripzy.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);
    private static final int MAX_HISTORY_TURNS = 10;
    // Per Gemini call; a stuck call falls back instead of freezing the chat
    private static final int REQUEST_TIMEOUT_MS = 15_000;

    private static final String SYSTEM_PROMPT = """
            You are Tripzy AI, the travel assistant inside Tripzy, a platform where travelers discover \
            destinations, host group trips and find companions to join them.

            Answer any travel question helpfully: destinations, best seasons, budgets, itineraries, packing, \
            getting there, visas, safety and local culture. When the Tripzy data below is relevant, use it and \
            prefer it over general knowledge (budgets, live trips, spots left). Never invent Tripzy trips, \
            prices or users that are not in the data; for places not listed, use general knowledge and say \
            Tripzy has no listed trips there yet. Point users to app features when useful: Search Trips, \
            Create Trip, Explore Map, Budget Calculator, Itinerary Builder, Trip Planner and My Trips.

            Tripzy is an Indian platform: write every amount in Indian rupees with the ₹ symbol and Indian
            digit grouping (for example ₹2,500 or ₹1,25,000). Never use $, USD or any other currency; convert
            foreign prices to rupees.

            Keep replies concise and conversational, formatted with Markdown (bold, short bullet lists). \
            Use more length only when the user asks for an itinerary or a detailed plan.
            """;

    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;
    private final Client client;
    private final String model;
    private final List<String> fallbackModels;

    public AIService(DestinationRepository destinationRepository,
                     TripRepository tripRepository,
                     @Value("${app.ai.api-key:}") String apiKey,
                     @Value("${app.ai.model:gemini-3.8-flash}") String model,
                     @Value("${app.ai.fallback-models:gemini-3.1-flash-lite,gemini-3.5-flash-lite}") List<String> fallbackModels) {
        this.destinationRepository = destinationRepository;
        this.tripRepository = tripRepository;
        this.model = model;
        this.fallbackModels = fallbackModels.stream()
                .map(String::trim).filter(m -> !m.isEmpty() && !m.equals(model)).toList();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not set - Tripzy AI will use built-in keyword replies only.");
            this.client = null;
        } else {
            this.client = Client.builder()
                    .apiKey(apiKey)
                    .httpOptions(HttpOptions.builder()
                            .timeout(REQUEST_TIMEOUT_MS)
                            // No SDK-level retries: on overload we retry once on the fallback model ourselves
                            .retryOptions(HttpRetryOptions.builder().attempts(1).build())
                            .build())
                    .build();
            log.info("Tripzy AI enabled with Gemini model {} (fallbacks {})", model, fallbackModels);
        }
    }

    public AiChatResponse processMessage(AiChatRequest request) {
        AiChatResponse fallback = ruleBasedResponse(request.getMessage());
        if (client == null) {
            return markAsFallback(fallback);
        }
        try {
            String reply = askGemini(request);
            if (reply == null || reply.isBlank()) {
                return markAsFallback(fallback);
            }
            return new AiChatResponse(reply, fallback.getSuggestedFollowUps(), fallback.getReferencedData());
        } catch (RuntimeException e) {
            log.error("Gemini request failed ({}), using keyword reply instead", e.getClass().getSimpleName(), e);
            return markAsFallback(fallback);
        }
    }

    private AiChatResponse markAsFallback(AiChatResponse response) {
        response.setReply("_Tripzy AI is offline right now, so this is a built-in answer._\n\n" + response.getReply());
        return response;
    }

    private String askGemini(AiChatRequest request) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_PROMPT + "\n\n" + buildTripzyContext())))
                .maxOutputTokens(4096)
                .build();

        // Gemini needs alternating turns starting with the user, so skip the opening greeting
        // and merge consecutive turns from the same side.
        List<ChatTurn> turns = new ArrayList<>();
        List<ChatTurn> history = request.getHistory() != null ? request.getHistory() : List.of();
        for (ChatTurn t : history.subList(Math.max(0, history.size() - MAX_HISTORY_TURNS), history.size())) {
            if (t == null || t.getText() == null || t.getText().isBlank()) continue;
            boolean isUser = "user".equals(t.getRole());
            if (turns.isEmpty() && !isUser) continue;
            ChatTurn last = turns.isEmpty() ? null : turns.get(turns.size() - 1);
            if (last != null && "user".equals(last.getRole()) == isUser) {
                last.setText(last.getText() + "\n\n" + t.getText());
            } else {
                ChatTurn copy = new ChatTurn();
                copy.setRole(isUser ? "user" : "model");
                copy.setText(t.getText());
                turns.add(copy);
            }
        }
        if (!turns.isEmpty() && "user".equals(turns.get(turns.size() - 1).getRole())) {
            turns.get(turns.size() - 1).setText(turns.get(turns.size() - 1).getText() + "\n\n" + request.getMessage());
        } else {
            ChatTurn current = new ChatTurn();
            current.setRole("user");
            current.setText(request.getMessage());
            turns.add(current);
        }

        List<Content> contents = new ArrayList<>();
        for (ChatTurn t : turns) {
            contents.add(Content.builder().role(t.getRole()).parts(Part.fromText(t.getText())).build());
        }

        // Try the main model, then each fallback, moving on when one is rate-limited (429),
        // overloaded (5xx) or times out
        List<String> models = new ArrayList<>();
        models.add(model);
        models.addAll(fallbackModels);
        GenerateContentResponse response = null;
        for (int i = 0; i < models.size(); i++) {
            String m = models.get(i);
            boolean last = i == models.size() - 1;
            try {
                response = client.models.generateContent(m, contents, config);
                break;
            } catch (ApiException e) {
                boolean busy = e instanceof ServerException || e.code() == 429;
                if (!busy || last) throw e;
                log.warn("Gemini model {} unavailable ({}), trying {}", m, e.code(), models.get(i + 1));
            } catch (GenAiIOException e) {
                if (last) throw e;
                log.warn("Gemini model {} timed out, trying {}", m, models.get(i + 1));
            }
        }
        // text() is null when Gemini blocks the reply (e.g. safety filters); the caller then falls back
        return response.text();
    }

    // Formats an amount as rupees with Indian digit grouping, e.g. ₹1,25,000
    static String rupees(Double amount) {
        if (amount == null) return "₹0";
        String digits = String.valueOf(Math.round(amount));
        boolean negative = digits.startsWith("-");
        if (negative) digits = digits.substring(1);
        StringBuilder out = new StringBuilder();
        int len = digits.length();
        if (len <= 3) {
            out.append(digits);
        } else {
            String head = digits.substring(0, len - 3);
            for (int i = 0; i < head.length(); i++) {
                if (i > 0 && (head.length() - i) % 2 == 0) out.append(',');
                out.append(head.charAt(i));
            }
            out.append(',').append(digits.substring(len - 3));
        }
        return (negative ? "-₹" : "₹") + out;
    }

    // Live Tripzy data the model can ground its answers in
    private String buildTripzyContext() {
        StringBuilder ctx = new StringBuilder("## Tripzy destinations\n");
        for (Destination d : destinationRepository.findAll()) {
            ctx.append("- ").append(d.getName()).append(" (").append(d.getCity()).append(", ").append(d.getCountry()).append(")")
               .append(" | best time: ").append(d.getBestTimeToVisit())
               .append(" | avg budget/day: ").append(rupees(d.getAvgBudgetPerDay()))
               .append(" | rating: ").append(d.getRating())
               .append(" | tags: ").append(d.getTags())
               .append(" | attractions: ").append(d.getPopularAttractions())
               .append(" | cuisine: ").append(d.getCuisine())
               .append(" | getting there: ").append(d.getTransportGuide())
               .append("\n");
        }
        ctx.append("\n## Upcoming Tripzy group trips (users can request to join)\n");
        List<Trip> upcoming = tripRepository.findByStatus("UPCOMING");
        if (upcoming.isEmpty()) {
            ctx.append("None right now.\n");
        }
        for (Trip t : upcoming) {
            ctx.append("- ").append(t.getTitle()).append(" to ").append(t.getDestinationName())
               .append(" | ").append(t.getStartDate()).append(" to ").append(t.getEndDate())
               .append(" | category: ").append(t.getCategory())
               .append(" | style: ").append(t.getTravelStyle())
               .append(" | budget per person: ").append(rupees(t.getEstimatedBudget()))
               .append(" | spots left: ").append(t.getMaxParticipants() - t.getCurrentParticipants())
               .append(" | organizer: ").append(t.getOrganizerName())
               .append("\n");
        }
        return ctx.toString();
    }

    // Keyword-based engine: used as the fallback reply, and for follow-up chips / referenced cards
    private AiChatResponse ruleBasedResponse(String message) {
        String query = message.toLowerCase();
        List<String> followUps = new ArrayList<>();
        List<Object> referencedData = new ArrayList<>();
        StringBuilder reply = new StringBuilder();

        // 1. Check if user is asking about trips going to a destination
        if (query.contains("trip") || query.contains("group") || query.contains("join") || query.contains("companion")) {
            List<Trip> upcoming = tripRepository.findByStatus("UPCOMING");
            List<Trip> matched = new ArrayList<>();

            for (Trip t : upcoming) {
                if (query.contains(t.getDestinationName().toLowerCase()) || query.contains(t.getTitle().toLowerCase())) {
                    matched.add(t);
                }
            }

            if (!matched.isEmpty()) {
                reply.append("I found **").append(matched.size()).append(" live trips** on Tripzy matching your search:\n\n");
                for (Trip t : matched) {
                    int remaining = t.getMaxParticipants() - t.getCurrentParticipants();
                    reply.append("- **").append(t.getTitle()).append("** to *").append(t.getDestinationName()).append("*\n")
                         .append("  • Dates: ").append(t.getStartDate()).append(" to ").append(t.getEndDate()).append("\n")
                         .append("  • Budget: ").append(rupees(t.getEstimatedBudget())).append("\n")
                         .append("  • Available Spots: ").append(remaining).append(" remaining (Organizer: ").append(t.getOrganizerName()).append(")\n\n");
                    referencedData.add(t);
                }
                reply.append("You can click **Search Trips** or select a trip card directly to submit a join request!");
                followUps.add("What is the packing list for this trip?");
                followUps.add("Can you help me create an itinerary?");
                followUps.add("How do I request to join?");
                return new AiChatResponse(reply.toString(), followUps, referencedData);
            }
        }

        // 2. Check if user mentions a destination
        List<Destination> allDestinations = destinationRepository.findAll();
        Destination matchedDest = null;
        for (Destination d : allDestinations) {
            if (query.contains(d.getName().toLowerCase()) || (d.getCity() != null && query.contains(d.getCity().toLowerCase()))) {
                matchedDest = d;
                break;
            }
        }

        if (matchedDest != null) {
            referencedData.add(matchedDest);
            List<Trip> destTrips = tripRepository.findByDestinationId(matchedDest.getId());

            if (query.contains("best time") || query.contains("season") || query.contains("weather")) {
                reply.append("The best time to visit **").append(matchedDest.getName()).append("** is **")
                     .append(matchedDest.getBestTimeToVisit()).append("**.\n\n")
                     .append("During this period, weather conditions are optimal for sightseeing and outdoor exploration. ")
                     .append("Highlights include: ").append(matchedDest.getPopularAttractions()).append(".");
                followUps.add("What are the estimated costs for " + matchedDest.getName() + "?");
                followUps.add("Are there any active trips going to " + matchedDest.getName() + "?");
                followUps.add("Build a 5-day itinerary for " + matchedDest.getName());
            } else if (query.contains("cost") || query.contains("budget") || query.contains("price") || query.contains("expense")) {
                reply.append("Estimated travel costs for **").append(matchedDest.getName()).append("**:\n\n")
                     .append("- **Daily Average Budget:** approx. ").append(rupees(matchedDest.getAvgBudgetPerDay()))
                     .append(" per day.\n")
                     .append("- **Accommodation & Meals:** Includes local stays and regional culinary experiences (local specialties: ")
                     .append(matchedDest.getCuisine()).append(").\n\n")
                     .append("*Note: All amounts are estimates based on standard traveler benchmarks and vary by season.*");
                followUps.add("How can I reach " + matchedDest.getName() + "?");
                followUps.add("Find travel buddies for " + matchedDest.getName());
            } else if (query.contains("reach") || query.contains("transport") || query.contains("how to go") || query.contains("from hyderabad")) {
                reply.append("Getting to **").append(matchedDest.getName()).append("**:\n\n")
                     .append(matchedDest.getTransportGuide() != null ? matchedDest.getTransportGuide() :
                             "You can access the destination via regional airport, rail connections, or highway routes.\n\n")
                     .append("If traveling from major hubs like Hyderabad, Delhi, or Mumbai, the quickest transit is a domestic flight followed by private transfer or scenic state bus.");
                followUps.add("What should I pack for " + matchedDest.getName() + "?");
                followUps.add("Are there existing trips I can join?");
            } else {
                reply.append("Here is an overview of **").append(matchedDest.getName()).append("** (")
                     .append(matchedDest.getCity()).append(", ").append(matchedDest.getCountry()).append("):\n\n")
                     .append(matchedDest.getDescription()).append("\n\n")
                     .append("- **Best Season:** ").append(matchedDest.getBestTimeToVisit()).append("\n")
                     .append("- **Key Attractions:** ").append(matchedDest.getPopularAttractions()).append("\n")
                     .append("- **Current Trips on Tripzy:** ").append(destTrips.size()).append(" group(s) planned.\n");
                followUps.add("What is the best time to visit " + matchedDest.getName() + "?");
                followUps.add("Show me trips to " + matchedDest.getName());
                followUps.add("Create a trip to " + matchedDest.getName());
            }

            return new AiChatResponse(reply.toString(), followUps, referencedData);
        }

        // 3. General assistance
        if (query.contains("create a trip") || query.contains("how to create")) {
            reply.append("To organize your own adventure on Tripzy:\n\n")
                 .append("1. Navigate to **Create Trip** in the sidebar.\n")
                 .append("2. Step through the 6-step creation wizard (destination, dates, logistics, budget, rules).\n")
                 .append("3. Once published, your trip appears in **Search Trips** and on the **Explore Map**.\n")
                 .append("4. Fellow travelers can request to join, and you can review applicants in **My Trips**!");
            followUps.add("How do join requests work?");
            followUps.add("Help me build an itinerary first");
            return new AiChatResponse(reply.toString(), followUps, referencedData);
        }

        // Default greeting / travel guidance
        reply.append("Hello fellow traveler! I'm **Tripzy AI**, your intelligent travel companion.\n\n")
             .append("Here are some things I can assist you with right now:\n")
             .append("• **Find matching trips** from our real community database\n")
             .append("• **Discover destinations** by budget, climate, or travel style\n")
             .append("• **Build custom multi-day itineraries**\n\n")
             .append("What destination or adventure are you dreaming of today?");

        followUps.add("Show me upcoming adventure trips");
        followUps.add("What are the trending destinations?");
        followUps.add("Help me calculate a trip budget");

        return new AiChatResponse(reply.toString(), followUps, referencedData);
    }
}
