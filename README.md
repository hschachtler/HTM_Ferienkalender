# HTM Ferienkalender

Team-Ferienkalender mit direkter Abacus ERP Integration.

## Architektur

```
ferienkalender/
├── backend/          # Node.js + Express + TypeScript
│   └── src/
│       ├── abacusClient.ts   # Abacus OAuth2 + OData API
│       ├── server.ts         # Express Server
│       └── routes/           # REST Endpoints
└── frontend/         # React + Vite + Tailwind + TanStack Query
    └── src/
        ├── components/       # UI Komponenten
        ├── hooks/            # React Query Hooks
        ├── lib/              # API Client + Kalender Utils
        └── types/            # TypeScript Types
```

## Voraussetzungen

- Node.js 20+
- Abacus ERP mit konfiguriertem Service-User (Q910)

## Setup

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Backend konfigurieren
cp backend/.env.example backend/.env
# → Abacus-Zugangsdaten in backend/.env eintragen

# 3. Starten (Backend + Frontend)
npm run dev
```

Öffne http://localhost:5173

## Abacus Konfiguration

In `backend/.env`:

```
ABACUS_SERVER_URL=https://abacus.ihre-firma.ch:40000
ABACUS_MANDANT=7777
ABACUS_CLIENT_ID=<aus Q910>
ABACUS_CLIENT_SECRET=<aus Q910>
```

## API Endpoints

| Method | Pfad | Beschreibung |
|--------|------|--------------|
| GET | `/api/health` | Health Check + Abacus Status |
| GET | `/api/employees` | Alle aktiven Mitarbeitenden |
| GET | `/api/absence-types` | Alle Absenztypen |
| GET | `/api/absences?from=&to=` | Absenzen im Zeitraum |
| POST | `/api/absences` | Neue Absenz → Abacus |
| PATCH | `/api/absences/:id` | Absenz aktualisieren |
| DELETE | `/api/absences/:id` | Absenz löschen |

## GitHub Secrets

| Secret | Beschreibung |
|--------|-------------|
| `ABACUS_SERVER_URL` | Abacus Server URL |
| `ABACUS_MANDANT` | Mandanten-Nummer |
| `ABACUS_CLIENT_ID` | OAuth Client-ID (Q910) |
| `ABACUS_CLIENT_SECRET` | OAuth Client-Secret (Q910) |
