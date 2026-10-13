# Tripzy — See a Place. Find Your People. Travel Together.

Tripzy is a travel companion and destination-discovery platform for solo travellers.

Discover destinations, join or host group trips, plan itineraries and budgets, and ask an AI travel assistant for help along the way.

- **Live site:** [tripzy-m91o.vercel.app](https://tripzy-m91o.vercel.app)
- **Repository:** [github.com/sreeakshitha11/tripzy](https://github.com/sreeakshitha11/tripzy)

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Run Locally](#-run-locally)
- [Deployment](#-deployment)
- [Security and Privacy](#-security-and-privacy)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Project Goals](#-project-goals)
- [Repository Links](#-repository-links)

---

## 🌍 Project Overview

Many people skip trips because they have no one to travel with. Tripzy connects travellers who want to go to the same places.

Travellers can browse destinations, find upcoming group trips, request to join them, and coordinate with the group. Organisers can publish their own trips and review join requests.

The app is split into two parts:

- A **React** single-page frontend.
- A **Spring Boot** REST API backed by **MySQL**.

---

## ✨ Features

### Discover

- **Destination discovery:** browse destinations with descriptions, best season, cuisine, attractions and average daily budget.
- **Interactive map:** explore destinations and drop custom pins on an OpenStreetMap-based map.
- **Trip search:** filter upcoming group trips by destination, category and budget.
- **Destination comparison:** compare two destinations side by side.

### Travel

- **Group trips:** create a trip through a step-by-step wizard, or request to join someone else's.
- **My Trips:** track trips you created, trips you joined and pending join requests.
- **Travel groups:** a space for confirmed trip members.
- **Open-to-Travel:** find companions with flexible plans and similar travel styles.

### Plan

- **Tripzy AI assistant:** a chat assistant powered by Google Gemini that uses Tripzy's destination and trip data in its answers.
- **Budget calculator:** estimate trip costs by category, in Indian rupees (₹).
- **Itinerary builder and trip planner:** organise trips day by day.
- **Wishlist and packing checklist:** save destinations and prepare for a trip.

### Community and Safety

- **Community posts, travel diary and reviews:** share stories, tips and ratings.
- **Safety and support:** safety guidelines, incident reporting and support requests.
- **Notifications, profile and settings:** manage your account and alerts.
- **Admin dashboard:** platform metrics and moderation for admin users.

> **Note:** The AI assistant needs a Gemini API key. Without one, or when Gemini is unavailable, it falls back to built-in answers, and those are clearly labelled in the chat.

---

## 🛠 Technology Stack

### Frontend

- React 18
- Vite 5
- React Router 6
- Tailwind CSS 3, with the "Forest Trails" colour theme defined in `tailwind.config.js` and `src/index.css`
- Lucide React icons

### Backend

- Java 17
- Spring Boot 3.2: Web, Data JPA, Validation
- Spring Security with JWT authentication (jjwt)
- Spring WebSocket: STOMP endpoint at `/ws`

### API Communication

- REST endpoints under `/api/*`
- Axios on the frontend, with the JWT sent as a `Bearer` token
- In development, Vite proxies `/api` to the backend on port `8080`

### Database

- MySQL 8, accessed through Spring Data JPA and Hibernate
- Tables are created automatically (`ddl-auto: update`)
- Demo data is seeded on first start

### Maps and Location

- Leaflet with React Leaflet
- OpenStreetMap tiles

### AI Integration

- Google Gen AI Java SDK (`google-genai`)
- Gemini models with an automatic fallback chain and request timeouts

### Deployment

- **Frontend:** Vercel
- **Backend:** Render, using a Docker image
- **Database:** any MySQL host. This project uses Aiven.

---

## 📁 Project Structure

```text
tripzy/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tripzy/
│   │   │   │   ├── config/          # Security, WebSocket, database URL handling
│   │   │   │   ├── controller/      # REST controllers (/api/...)
│   │   │   │   ├── dto/             # Request and response objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── exception/       # Global error handling
│   │   │   │   ├── repository/      # Spring Data repositories
│   │   │   │   ├── security/        # JWT provider and filter
│   │   │   │   ├── service/         # Business logic, AI service, demo data seeding
│   │   │   │   └── TripzyApplication.java
│   │   │   └── resources/
│   │   │       ├── META-INF/spring.factories
│   │   │       ├── application.yml
│   │   │       └── application-example.yml
│   │   └── test/java/com/tripzy/
│   │       └── TripzyApplicationTests.java
│   ├── .env.example
│   ├── Dockerfile
│   ├── maven-settings.xml
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # Axios client
│   │   ├── components/              # Navbar, Sidebar, FloatingAiChat
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Login state
│   │   ├── pages/                   # One file per route (Home, CreateTrip, TripzyAiPage, ...)
│   │   ├── App.jsx                  # Routes and layout
│   │   ├── index.css                # Theme tokens and global styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── .gitignore
├── ISSUES.md
├── README.md
└── vercel.json                      # Vercel build settings (builds from frontend/)
```

---

## 💻 Run Locally

### 1. Prerequisites

Install the following:

- **Java 17** (JDK)
- **Maven 3.9+**. The project has no Maven wrapper, so `mvn` must be installed.
- **Node.js 18+** and **npm**
- **MySQL 8**, running on `localhost:3306`

### 2. Clone the repository

```bash
git clone https://github.com/sreeakshitha11/tripzy.git
```

```bash
cd tripzy
```

### 3. Configure environment variables

Copy the example file:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your own values:

```dotenv
GEMINI_API_KEY=<your-gemini-api-key>
```

You can create a Gemini key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

By default, the backend connects to MySQL as `root` with an empty password and creates a database called `tripzy_db`. To use different credentials, add these lines to `backend/.env`:

```dotenv
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/tripzy_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=<your-mysql-user>
SPRING_DATASOURCE_PASSWORD=<your-mysql-password>
```

### 4. Start the Spring Boot backend

```bash
cd backend
```

```bash
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

On a successful start, the log shows:

```text
Tripzy AI enabled with Gemini model ...
Started TripzyApplication ...
```

### 5. Start the React frontend

Open a second terminal in the project folder.

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

The app opens on **http://localhost:5173**. Vite forwards `/api` requests to the backend.

### 6. Verify the application

1. Open http://localhost:5173.
2. Sign in with a demo account, for example `alex@tripzy.com` with the password `Travel@123`. You can also use the one-click demo buttons on the login page.
3. Open a trip, then ask **Tripzy AI** a question.

Demo accounts created on first start:

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| Alex Rivers | `alex@tripzy.com` | `Travel@123` | User |
| Sarah Jenkins | `sarah@tripzy.com` | `Travel@123` | User |
| Rahul Sharma | `rahul@tripzy.com` | `Travel@123` | User |
| Tripzy Admin | `admin@tripzy.com` | `Admin@123` | Admin |

> These are demo credentials for testing only. Change or remove them before real users join.

---

## 🚀 Deployment

The current setup is:

- The **frontend** runs on Vercel.
- The **backend** runs on Render.
- The **database** is MySQL hosted on Aiven.

Every push to `main` triggers a new deploy on both Vercel and Render.

### Backend on Render

1. Create a **Web Service** from this repository.
2. Use these settings:

   | Setting | Value |
   | --- | --- |
   | Root Directory | `backend` |
   | Runtime | `Docker` |
   | Health Check Path | `/api/destinations` |

3. Add the environment variables listed below, then deploy.

The Docker build downloads Maven dependencies from Google's Maven Central mirror (`maven-settings.xml`) and retries failed downloads. This avoids `429 Too Many Requests` errors on shared build machines.

### Frontend on Vercel

1. Import this repository as a Vercel project.
2. The root `vercel.json` tells Vercel to install and build from `frontend/`. It also makes page refreshes on routes such as `/trips/1` work.
3. Add the `VITE_API_URL` environment variable described below, then deploy.

### Environment variable configuration

Set these in the **Render** dashboard (backend):

| Variable | Required | Description |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Yes | Database URL. See [Database connectivity](#database-connectivity). |
| `SPRING_DATASOURCE_USERNAME` | If not in the URL | Database user |
| `SPRING_DATASOURCE_PASSWORD` | If not in the URL | Database password |
| `JWT_SECRET` | Yes | At least 32 characters. Generate one with `openssl rand -base64 64`. |
| `GEMINI_API_KEY` | For AI chat | Google Gemini API key |
| `CORS_ALLOWED_ORIGINS` | Yes | Your frontend URL. See [CORS configuration](#cors-configuration). |
| `AI_MODEL` | No | Main Gemini model. Default: `gemini-3.8-flash` |
| `AI_FALLBACK_MODELS` | No | Comma-separated backup models. Default: `gemini-3.1-flash-lite,gemini-3.5-flash-lite` |
| `JWT_EXPIRATION_MS` | No | Login session length in milliseconds. Default: `86400000` (24 hours) |

Render provides `PORT` automatically, and the backend listens on it.

Set this in the **Vercel** dashboard (frontend):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend address, for example `https://<your-render-service>.onrender.com`, with no trailing slash |

> `VITE_API_URL` is built into the frontend when it is compiled. After changing it, redeploy on Vercel.

### Database connectivity

`SPRING_DATASOURCE_URL` accepts either of two formats.

**JDBC format**, with the username and password set separately:

```text
jdbc:mysql://<host>:<port>/<database>?sslMode=REQUIRED
```

**Service URI format**, as shown by hosts such as Aiven. The username and password are read from the URI:

```text
mysql://<user>:<password>@<host>:<port>/<database>?ssl-mode=REQUIRED
```

Tables and demo data are created automatically on the first start.

### CORS configuration

The backend only accepts browser requests from the origins listed in `CORS_ALLOWED_ORIGINS`.

Set it to your frontend's exact URL:

```text
CORS_ALLOWED_ORIGINS=https://tripzy-m91o.vercel.app
```

To allow several origins, separate them with commas. Without this setting, the deployed site cannot log in or load data.

### Persistent file storage

Not applicable. Tripzy stores no uploaded files: images are referenced by URL and all data lives in MySQL. Render's temporary disk storage therefore doesn't affect the app.

### Notes on the free tiers

- Render's free web service sleeps after about 15 minutes without traffic. The first request after that can take 30–60 seconds.
- The Gemini free tier has usage limits. When the main model is rate-limited, the backend tries the fallback models automatically.

---

## 🔒 Security and Privacy

- **Never commit secrets.** `backend/.env` is listed in `.gitignore`. Keep API keys, database passwords and `JWT_SECRET` in `.env` locally and in the hosting dashboards in production.
- **The Gemini key stays on the backend.** The frontend never sees it. It only calls `/api/ai/chat`.
- **Use a strong `JWT_SECRET` in production.** The default in `application.yml` is for local development only. The backend refuses to start if the secret is shorter than 32 characters.
- **Passwords are hashed** before they are stored.
- **Rotate exposed credentials.** If a password or key appears in logs, screenshots or chat messages, reset it at the provider and update the dashboards.
- **Demo accounts are public.** Change or remove them for a real launch.

---

## 🧪 Testing

The backend has a Spring Boot test class, `TripzyApplicationTests`, with three tests:

- The application context loads.
- Passwords are hashed and verified correctly.
- JWT tokens are generated and validated.

The tests start the full application, so MySQL must be running with the same settings as in [Run Locally](#-run-locally).

```bash
cd backend
```

```bash
mvn test
```

The frontend has no automated tests. To check that it compiles, run:

```bash
cd frontend
```

```bash
npm run build
```

---

## 🧰 Troubleshooting

### `vite: command not found` on Vercel

Vercel built from the repository root, where there is no `package.json`. The root `vercel.json` fixes this by building from `frontend/`. Make sure that file is committed.

### `429 Too Many Requests` during the Render build

Maven Central rate-limited the build machine. The Dockerfile already uses Google's mirror and retries. Redeploy with **Manual Deploy → Clear build cache & deploy**.

### `Driver claims to not accept jdbcUrl`

`SPRING_DATASOURCE_URL` is in a format the backend can't read. Use one of the two formats under [Database connectivity](#database-connectivity).

### `JWT_SECRET is too short`

Generate a new secret and paste the command's **output** into Render, not the command itself:

```bash
openssl rand -base64 64
```

### Login or data fails on the deployed site

Check these two settings:

- `CORS_ALLOWED_ORIGINS` on Render matches the Vercel URL exactly.
- `VITE_API_URL` on Vercel points to the Render backend. After changing it, redeploy.

### Typed text or headings are hard to read

Restart the Vite dev server after changing `tailwind.config.js`. It doesn't always reload theme changes automatically.

### AI replies start with "Tripzy AI is offline right now"

The built-in fallback answered because Gemini was unavailable. Check these:

- `GEMINI_API_KEY` is set.
- The backend log shows `Tripzy AI enabled`.
- Your Gemini quota hasn't run out. Watch for `429` messages in the log.

### `Invalid email or password`

Use one of the demo accounts listed in [Verify the application](#6-verify-the-application), or create a new account from the **Register** page.

---

## 🎯 Project Goals

- Make it easy for solo travellers to find trustworthy travel companions.
- Turn travel inspiration into real, joinable group trips.
- Keep planning in one place: itineraries, budgets, packing and group coordination.
- Put safety first, with verified profiles, clear guidelines and incident reporting.
- Offer a calm, accessible interface, built to WCAG AA contrast.

---

## 🔗 Repository Links

- **Live site:** [tripzy-m91o.vercel.app](https://tripzy-m91o.vercel.app)
- **Source code:** [github.com/sreeakshitha11/tripzy](https://github.com/sreeakshitha11/tripzy)
- **Known issues and fixes:** [ISSUES.md](ISSUES.md)
- **Report a problem:** [GitHub Issues](https://github.com/sreeakshitha11/tripzy/issues)
