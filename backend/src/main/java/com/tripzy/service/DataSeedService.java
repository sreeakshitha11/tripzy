package com.tripzy.service;

import com.tripzy.entity.*;
import com.tripzy.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataSeedService implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationImageRepository imageRepository;
    private final TripRepository tripRepository;
    private final TripParticipantRepository participantRepository;
    private final TravelGroupRepository groupRepository;
    private final GroupMessageRepository messageRepository;
    private final GroupAnnouncementRepository announcementRepository;
    private final GroupPollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final ItineraryRepository itineraryRepository;
    private final ItineraryItemRepository itineraryItemRepository;
    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final DestinationReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeedService(UserRepository userRepository,
                           UserPreferenceRepository preferenceRepository,
                           DestinationRepository destinationRepository,
                           DestinationImageRepository imageRepository,
                           TripRepository tripRepository,
                           TripParticipantRepository participantRepository,
                           TravelGroupRepository groupRepository,
                           GroupMessageRepository messageRepository,
                           GroupAnnouncementRepository announcementRepository,
                           GroupPollRepository pollRepository,
                           PollOptionRepository pollOptionRepository,
                           ItineraryRepository itineraryRepository,
                           ItineraryItemRepository itineraryItemRepository,
                           CommunityPostRepository postRepository,
                           CommunityCommentRepository commentRepository,
                           DestinationReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.destinationRepository = destinationRepository;
        this.imageRepository = imageRepository;
        this.tripRepository = tripRepository;
        this.participantRepository = participantRepository;
        this.groupRepository = groupRepository;
        this.messageRepository = messageRepository;
        this.announcementRepository = announcementRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.itineraryRepository = itineraryRepository;
        this.itineraryItemRepository = itineraryItemRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println(">>> SEEDING TRIPZY DATABASE WITH REALISTIC SAMPLE DATA...");

        // 1. Users
        User admin = createUser("admin@tripzy.com", "Admin@123", "Tripzy Admin", "ROLE_ADMIN",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
                "Platform Administrator & Safety Lead.", "Explorer", 100);

        User alex = createUser("alex@tripzy.com", "Travel@123", "Alex Rivers", "ROLE_USER",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
                "Solo backpacker and landscape photographer looking for adventure buddies.", "Backpacker", 96);

        User sarah = createUser("sarah@tripzy.com", "Travel@123", "Sarah Jenkins", "ROLE_USER",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
                "Certified mountain trek lead and outdoor photographer based in Himachal.", "Adventurer", 98);

        User rahul = createUser("rahul@tripzy.com", "Travel@123", "Rahul Sharma", "ROLE_USER",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                "Culture enthusiast, foodie, and motorcycle explorer.", "Cultural Traveler", 94);

        User elena = createUser("elena@tripzy.com", "Travel@123", "Elena Rostova", "ROLE_USER",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                "Scuba diver, beach lover, and yoga retreat traveler.", "Leisure", 92);

        // 2. Destinations
        Destination manali = createDestination("Manali", "Kullu Valley", "Himachal Pradesh", "India",
                32.2396, 77.1887,
                "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
                "High-altitude Himalayan wonderland surrounded by pine forests, snow-clad peaks, and thrilling passes.",
                "Manali is nestled in the Beas River Valley, serving as the gateway to Rohtang Pass, Solang Valley, and Spiti.",
                "October to June (Snow season: Dec-Feb)", "Siddu, Trout fish, Thukpa, Himachali Dham", 45.0, "USD",
                "Mountains,Snow,Adventure,Trekking", 4.9, 128,
                "Solang Valley, Rohtang Pass, Old Manali Cafes, Hadimba Temple, Jogini Waterfall",
                "Fly to Bhuntar Airport (50km) or take overnight Volvo bus from Delhi / Chandigarh.");

        Destination ladakh = createDestination("Ladakh", "Leh", "Ladakh", "India",
                34.1526, 77.5771,
                "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
                "The Land of High Passes featuring surreal lunar landscapes, turquoise high-altitude lakes, and ancient Buddhist monasteries.",
                "Perched at over 11,000 feet, Ladakh offers dramatic vistas from Pangong Tso to the sand dunes of Nubra Valley.",
                "May to September (Roads open)", "Skyu, Chhurpi yak cheese, Butter tea, Momos", 60.0, "USD",
                "Mountains,HighPasses,Stargazing,Monasteries,Biking", 4.9, 210,
                "Pangong Tso, Khardung La, Nubra Valley Hunder Dunes, Thiksey Monastery, Magnetic Hill",
                "Direct flights to Kushok Bakula Rimpochee Airport (Leh) or Manali-Leh Highway roadtrip.");

        Destination goa = createDestination("Goa", "Panaji", "Goa", "India",
                15.2993, 74.1240,
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                "Sun-soaked golden beaches, vibrant Portuguese heritage, bohemian night markets, and thrilling water sports.",
                "A paradise for travelers who love ocean sunsets, beach shack dining, and coastal camaraderie.",
                "November to March", "Fish Curry Rice, Bebinca, Prawn Balchão, Goan Poi", 40.0, "USD",
                "Beaches,Nightlife,Surfing,Heritage,Coastal", 4.8, 340,
                "Baga & Palolem Beaches, Fort Aguada, Chapora Fort, Dudhsagar Falls, Fontainhas Latin Quarter",
                "Fly into Dabolim or Mopa Airport, or Madgaon railway junction.");

        Destination kyoto = createDestination("Kyoto", "Kyoto", "Kansai", "Japan",
                35.0116, 135.7681,
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
                "Japan's cultural capital known for thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden machiya houses.",
                "Experience the ethereal Arashiyama Bamboo Grove and vermilion torii gates of Fushimi Inari Taisha.",
                "March to May (Cherry Blossoms) & Oct to Nov (Autumn Foliage)", "Kaiseki, Matcha sweets, Ramen, Yudofu", 85.0, "USD",
                "Culture,Temples,Heritage,Photography,Zen", 4.9, 412,
                "Fushimi Inari Taisha, Kinkaku-ji (Golden Pavilion), Arashiyama Bamboo Forest, Gion Geisha District",
                "Shinkansen bullet train from Tokyo (2 hours 15 mins) or Kansai Airport Express from Osaka.");

        Destination santorini = createDestination("Santorini", "Thira", "Cyclades", "Greece",
                36.3932, 25.4615,
                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
                "Spectacular volcanic island crowned by whitewashed villages, blue-domed churches, and world-famous caldera sunsets.",
                "Perched along sheer Aegean cliffs, Santorini is legendary for its romantic panoramas, volcanic wine, and cliff paths.",
                "April to October", "Fava me Koukia, Tomato Gefthedes, Fresh Grilled Octopus, Assyrtiko Wine", 110.0, "USD",
                "Islands,Romantic,Beaches,Sunsets,Sailing", 4.9, 520,
                "Oia Sunset Point, Fira to Oia Cliff Walk, Red Beach, Akrotiri Archaeological Site, Ammoudi Bay",
                "Direct flights from Athens or ferry from Piraeus / Heraklion.");

        Destination swissAlps = createDestination("Swiss Alps (Zermatt)", "Zermatt", "Valais", "Switzerland",
                45.9765, 7.7491,
                "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
                "Iconic alpine wonderland framed by the pyramid-shaped Matterhorn peak, pristine glacier lakes, and scenic cogwheel railways.",
                "A car-free paradise offering world-class skiing, summer ridge hiking, and traditional alpine chalets.",
                "Dec to April (Skiing) & July to Sept (Hiking)", "Swiss Cheese Fondue, Raclette, Rösti, Alpine Chocolate", 140.0, "USD",
                "Mountains,Skiing,Luxury,Hiking,Glaciers", 4.9, 185,
                "Matterhorn Glacier Paradise, Gornergrat Railway, 5 Lakes Trail, Sunnegga, Alpine Village",
                "Train from Zurich or Geneva Airport via Visp to Zermatt.");

        // 3. Trips
        Trip tripManali = createTrip("Himalayan Snow Peaks Expedition", manali.getId(), manali.getName(),
                sarah.getId(), sarah.getFullName(), sarah.getAvatarUrl(),
                "Join our small group adventure through Solang Valley, Rohtang Pass, and rustic Old Manali cafes. Suitable for all fitness levels.",
                "Adventure", LocalDate.now().plusDays(14), LocalDate.now().plusDays(19), 6,
                "Shared 4x4 SUV & Volvo Transfer", "Alpine Cottages & Stargazing Dome Camps",
                "Chandigarh Airport / Manali Mall Road", 380.0, "USD", 3, 6, 2,
                "Moderate Adventurer", "Punctual departures, leave no trace, zero littering.",
                "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80");

        Trip tripLadakh = createTrip("High-Pass Motorcycle & Stargazing Adventure", ladakh.getId(), ladakh.getName(),
                rahul.getId(), rahul.getFullName(), rahul.getAvatarUrl(),
                "Epic expedition across Khardung La, Nubra Valley sand dunes, and overnight camping beside crystal blue Pangong Lake.",
                "Biking & Roadtrip", LocalDate.now().plusDays(25), LocalDate.now().plusDays(33), 9,
                "Royal Enfield Himalayan 450 + Support Vehicle", "Eco Huts & Lakeside Glamping",
                "Leh Main Market, near Shanti Stupa", 680.0, "USD", 4, 8, 3,
                "Active Adventurer", "Valid motorcycle permit required, mandatory acclimatization day.",
                "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80");

        Trip tripGoa = createTrip("Coastal Sunset Surf & Reggae Retreat", goa.getId(), goa.getName(),
                elena.getId(), elena.getFullName(), elena.getAvatarUrl(),
                "Relaxed seaside journey covering Morjim surf lessons, Palolem kayaking, Latin Quarter heritage walks, and beach shacks.",
                "Leisure & Beach", LocalDate.now().plusDays(10), LocalDate.now().plusDays(15), 5,
                "Rented Scooters & Coastal Cabs", "Boutique Beachfront Villas",
                "Dabolim Airport Arrivals Terminal", 290.0, "USD", 2, 6, 2,
                "Chill Beachgoer", "Good vibes only, eco-friendly beach habits.",
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80");

        Trip tripSantorini = createTrip("Aegean Caldera Sailing & Sunset Chasing", santorini.getId(), santorini.getName(),
                sarah.getId(), sarah.getFullName(), sarah.getAvatarUrl(),
                "Cliffside walking trails, volcanic hot springs catamaran cruise, and wine tasting under the legendary Oia twilight.",
                "Culture & Leisure", LocalDate.now().plusDays(30), LocalDate.now().plusDays(36), 6,
                "Private Minivan & Luxury Catamaran", "Cliffside Cave Suites in Imerovigli",
                "Fira Central Bus Station", 950.0, "USD", 3, 6, 3,
                "Explorer", "Sunscreen mandatory, bring walking shoes for cobblestones.",
                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80");

        Trip tripKyoto = createTrip("Ancient Shrines & Zen Tea Gardens", kyoto.getId(), kyoto.getName(),
                alex.getId(), alex.getFullName(), alex.getAvatarUrl(),
                "Immersion in Japanese heritage: early morning bamboo forest strolls, kimono photography, and authentic matcha tea ceremonies.",
                "Culture", LocalDate.now().plusDays(40), LocalDate.now().plusDays(46), 7,
                "Kyoto City Bus & JR Rail Pass", "Traditional Ryokan with Onsen",
                "Kyoto Central Station North Exit", 820.0, "USD", 2, 5, 1,
                "Mindful Explorer", "Respect shrine decorum, quiet hours after 10 PM.",
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80");

        // 4. Participants & Travel Groups for Manali
        participantRepository.save(new TripParticipant(tripManali.getId(), sarah.getId(), sarah.getFullName(), sarah.getAvatarUrl(), "ORGANIZER"));
        participantRepository.save(new TripParticipant(tripManali.getId(), alex.getId(), alex.getFullName(), alex.getAvatarUrl(), "MEMBER"));

        TravelGroup groupManali = new TravelGroup();
        groupManali.setTripId(tripManali.getId());
        groupManali.setName("Manali Snow Peaks Crew");
        groupManali.setDescription("Group coordination for our upcoming Himalayan adventure.");
        groupManali.setOrganizerId(sarah.getId());
        groupManali.setCoverImageUrl(tripManali.getCoverImageUrl());
        TravelGroup savedGroup = groupRepository.save(groupManali);

        // Group messages
        messageRepository.save(new GroupMessage(savedGroup.getId(), sarah.getId(), sarah.getFullName(), sarah.getAvatarUrl(),
                "Welcome to the trip, Alex! Really thrilled to explore Solang Valley and Rohtang together.", "TEXT"));
        messageRepository.save(new GroupMessage(savedGroup.getId(), alex.getId(), alex.getFullName(), alex.getAvatarUrl(),
                "Thanks Sarah! Packing my camera gear and thermals. Looking forward to the snow slopes!", "TEXT"));

        // Group announcement
        GroupAnnouncement ann = new GroupAnnouncement();
        ann.setGroupId(savedGroup.getId());
        ann.setAuthorId(sarah.getId());
        ann.setAuthorName(sarah.getFullName());
        ann.setTitle("Meeting Point & Luggage Advice");
        ann.setContent("Please pack lightweight waterproof layers. We meet at 10 AM sharp near Mall Road bus bay on Day 1.");
        ann.setPriority("IMPORTANT");
        announcementRepository.save(ann);

        // Group poll
        GroupPoll poll = new GroupPoll();
        poll.setGroupId(savedGroup.getId());
        poll.setCreatorId(sarah.getId());
        poll.setCreatorName(sarah.getFullName());
        poll.setQuestion("Should we do paragliding at Solang Valley or river rafting in Beas?");
        GroupPoll savedPoll = pollRepository.save(poll);
        pollOptionRepository.save(new PollOption(savedPoll.getId(), "Paragliding in Solang Valley"));
        pollOptionRepository.save(new PollOption(savedPoll.getId(), "White Water Rafting in Beas"));

        // Itinerary for Manali trip
        Itinerary itin = new Itinerary();
        itin.setTripId(tripManali.getId());
        itin.setUserId(sarah.getId());
        itin.setTitle("Manali Expedition Official Timeline");
        itin.setDestinationName(manali.getName());
        itin.setTotalDays(6);
        Itinerary savedItin = itineraryRepository.save(itin);

        ItineraryItem item1 = new ItineraryItem();
        item1.setItineraryId(savedItin.getId());
        item1.setDayNumber(1);
        item1.setTimeSlot("11:00 AM");
        item1.setTitle("Old Manali Check-in & Cedar Forest Walk");
        item1.setDescription("Settle into mountain cottages, meet group companions, and explore Hadimba Temple.");
        item1.setLocationName("Hadimba Temple, Old Manali");
        item1.setLatitude(32.2483);
        item1.setLongitude(77.1805);
        item1.setEstimatedCost(15.0);
        item1.setSortOrder(1);
        itineraryItemRepository.save(item1);

        ItineraryItem item2 = new ItineraryItem();
        item2.setItineraryId(savedItin.getId());
        item2.setDayNumber(2);
        item2.setTimeSlot("08:30 AM");
        item2.setTitle("Solang Valley Snow Activities & Cable Car");
        item2.setDescription("Full day skiing, snow tube rides, and scenic gondola to the mountain ridge.");
        item2.setLocationName("Solang Valley");
        item2.setLatitude(32.3166);
        item2.setLongitude(77.1575);
        item2.setEstimatedCost(45.0);
        item2.setSortOrder(2);
        itineraryItemRepository.save(item2);

        // Community posts
        CommunityPost post1 = new CommunityPost();
        post1.setAuthorId(alex.getId());
        post1.setAuthorName(alex.getFullName());
        post1.setAuthorAvatar(alex.getAvatarUrl());
        post1.setTitle("5 Things I Learned Solo-Traveling across Himachal Pradesh");
        post1.setContent("Traveling solo pushed me out of my comfort zone, but apps like Tripzy made finding reliable companions effortless. Always carry cash for local dhabas and keep offline maps downloaded!");
        post1.setCategory("STORY");
        post1.setDestinationName("Manali");
        post1.setImageUrl("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80");
        post1.setLikesCount(14);
        post1.setCommentsCount(2);
        CommunityPost savedPost = postRepository.save(post1);

        commentRepository.save(new CommunityComment(savedPost.getId(), rahul.getId(), rahul.getFullName(), rahul.getAvatarUrl(),
                "Spot on regarding offline maps! Rohtang Pass frequently loses cell coverage."));

        // Destination review
        DestinationReview rev = new DestinationReview();
        rev.setDestinationId(manali.getId());
        rev.setTripId(tripManali.getId());
        rev.setUserId(alex.getId());
        rev.setUserName(alex.getFullName());
        rev.setUserAvatar(alex.getAvatarUrl());
        rev.setRating(5);
        rev.setComment("Incredible mountain scenery and very welcoming locals. Our group hike to Jogini falls was unforgettable.");
        rev.setIsVerifiedTraveler(true);
        rev.setHelpfulVotes(9);
        reviewRepository.save(rev);

        System.out.println(">>> TRIPZY SEEDING COMPLETED SUCCESSFULLY!");
    }

    private User createUser(String email, String pass, String name, String role, String avatar, String bio, String style, int trust) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(pass));
        u.setFullName(name);
        u.setRole(role);
        u.setAvatarUrl(avatar);
        u.setBio(bio);
        u.setTravelStyle(style);
        u.setTrustScore(trust);
        u.setIsVerified(true);
        u.setOpenToTravel(true);
        User saved = userRepository.save(u);

        UserPreference p = new UserPreference(saved.getId(), "Adventure, Mountains, Culture", "Himachal, Ladakh, Greece", "Moderate", "1-2 Weeks", style);
        preferenceRepository.save(p);
        return saved;
    }

    private Destination createDestination(String name, String city, String state, String country,
                                          Double lat, Double lng, String hero, String desc, String overview,
                                          String bestTime, String cuisine, Double budget, String currency,
                                          String tags, Double rating, Integer reviews, String attractions, String transport) {
        Destination d = new Destination();
        d.setName(name);
        d.setCity(city);
        d.setStateOrCountry(state);
        d.setCountry(country);
        d.setLatitude(lat);
        d.setLongitude(lng);
        d.setHeroImageUrl(hero);
        d.setDescription(desc);
        d.setOverview(overview);
        d.setBestTimeToVisit(bestTime);
        d.setCuisine(cuisine);
        d.setAvgBudgetPerDay(budget);
        d.setCurrency(currency);
        d.setTags(tags);
        d.setRating(rating);
        d.setReviewCount(reviews);
        d.setPopularAttractions(attractions);
        d.setTransportGuide(transport);
        return destinationRepository.save(d);
    }

    private Trip createTrip(String title, Long destId, String destName, Long orgId, String orgName, String orgAvatar,
                            String desc, String cat, LocalDate start, LocalDate end, int duration,
                            String transport, String stay, String meeting, Double budget, String curr,
                            int min, int max, int current, String style, String rules, String cover) {
        Trip t = new Trip();
        t.setTitle(title);
        t.setDestinationId(destId);
        t.setDestinationName(destName);
        t.setOrganizerId(orgId);
        t.setOrganizerName(orgName);
        t.setOrganizerAvatar(orgAvatar);
        t.setDescription(desc);
        t.setCategory(cat);
        t.setStartDate(start);
        t.setEndDate(end);
        t.setDurationDays(duration);
        t.setTransportType(transport);
        t.setAccommodationPlan(stay);
        t.setMeetingPoint(meeting);
        t.setEstimatedBudget(budget);
        t.setCurrency(curr);
        t.setMinParticipants(min);
        t.setMaxParticipants(max);
        t.setCurrentParticipants(current);
        t.setTravelStyle(style);
        t.setTripRules(rules);
        t.setCoverImageUrl(cover);
        t.setStatus("UPCOMING");
        return tripRepository.save(t);
    }
}
