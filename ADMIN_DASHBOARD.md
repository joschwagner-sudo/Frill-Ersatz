# Admin Dashboard

Umfassendes Admin Dashboard für frill-ersatz.

## Features

### ✅ Prisma Schema Updates

- **FeatureRequest Erweiterungen:**
  - `number` — Sequentielle ID für Anzeige (#1, #2, #3...)
  - `approvalStatus` — NEEDS_APPROVAL (default), APPROVED, REJECTED
  - `isPinned` — Feature anpinnen
  - `isPrivate` — Privat halten
  - `isShortlisted` — Shortlist markieren
  - `status` — Jetzt nullable (Ideen starten ohne Status bis zur Freigabe)

- **Neue Models:**
  - `Topic` — Kategorien mit Emoji (⚙️ Daten Import, ⭐ Neues Feature, etc.)
  - `IdeaTopics` — Many-to-Many Relation zwischen Ideas und Topics

### 🛠️ Admin API Routes

Alle Routes unter `/api/admin/` mit Admin-Session-Check:

- **`POST /api/admin/ideas/[id]/approve`** — Idee freigeben
- **`POST /api/admin/ideas/[id]/reject`** — Idee ablehnen
- **`PATCH /api/admin/ideas/[id]/status`** — Status ändern (UNDER_REVIEW, PLANNED, IN_PROGRESS, DONE, NOT_PLANNED)
- **`PATCH /api/admin/ideas/[id]/flags`** — Flags togglen (isPinned, isPrivate, isShortlisted, archived)
- **`PUT /api/admin/ideas/[id]/topics`** — Topics zuweisen
- **`GET /api/admin/topics`** — Alle Topics abrufen
- **`POST /api/admin/topics`** — Neues Topic erstellen
- **`POST /api/admin/announcements/[id]/publish`** — Ankündigung veröffentlichen
- **`GET /api/admin/stats`** — Dashboard Stats

### 🎨 Admin Dashboard UI

**Zugriff:** `/admin` (nur für Admins)

**Features:**

#### 📊 Stats Overview
- Gesamt Ideen
- Prüfung ausstehend
- Freigegeben
- Nutzer, Votes, Kommentare

#### 📝 Ideas Tab (Standard)
**Filter:**
- Alle
- Prüfung ausstehend
- Freigegeben
- Abgelehnt

**Tabelle mit:**
- Sequentielle Nummer (#1234)
- Titel (Link zur Detail-Seite)
- Autor
- Freigabe-Status Badge (farblich)
- Status Dropdown (nur für freigegebene Ideen)
- Vote/Comment Counts
- Flags: 📌 Pin, 🔒 Privat, ⭐ Shortlist, 🗃️ Archiv
- Quick Actions: ✅ Freigeben / ❌ Ablehnen

**Frill Status Colors:**
- In Prüfung 🔎: `#ff6b4a`
- To Do 📋: `#ffd749`
- In Arbeit 🧑‍💻: `#4d6bdd`
- Erledigt 🎉: `#14c57e`

#### 📢 Announcements Tab
- Liste aller Ankündigungen (published + drafts)
- Status Badge (Veröffentlicht / Entwurf)
- Publish Button für Drafts
- Erstellt von, Datum

#### 👥 Users Tab
- E-Mail
- Admin Status
- Anzahl Requests
- Anzahl Votes
- Registriert / Letzter Login

### 🎯 Design System

- **Finanzfluss Colors:** Dunkles Navy + Blau-Akzente
- **CSS Classes:** Alle aus `globals.css` (card, btn-primary, btn-secondary, btn-ghost, badge-*, input)
- **Responsive Grid Layouts**
- **Smooth Transitions**
- **German Labels** (user-facing)

## Setup

### 1. Prisma Migration

Falls DB-Zugriff verfügbar:

```bash
npx prisma migrate dev --name admin-dashboard
```

### 2. Prisma Generate

```bash
npx prisma generate
```

### 3. Topics Seeden

```bash
npx tsx prisma/seed-topics.ts
```

## Usage

1. Als Admin einloggen
2. `/admin` aufrufen
3. Tabs durchklicken: Ideas | Announcements | Users
4. Ideas filtern nach Approval-Status
5. Quick Actions:
   - ✅ Freigeben → setzt Status auf "In Prüfung"
   - ❌ Ablehnen → Idee wird abgelehnt
   - Status Dropdown → Status ändern (nur bei freigegebenen Ideen)
   - Flags togglen → Pin, Privat, Shortlist, Archiv

## Technical Details

- **Server Component:** `/src/app/admin/page.tsx` (Auth-Check, Data-Fetching)
- **Client Component:** `/src/app/admin/AdminDashboard.tsx` (Interaktive UI)
- **Tab-Navigation:** Via `searchParams` (`?tab=ideas&filter=needs-approval`)
- **Real-time Updates:** Optimistic UI updates + Stats refresh nach Aktionen

## Sicherheit

Alle Admin-Routen prüfen die Session:

```ts
async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(session.value, "base64").toString("utf-8"));
    return parsed?.isAdmin ? parsed : null;
  } catch {
    return null;
  }
}
```

403 Unauthorized, falls nicht Admin.

## Nächste Schritte

- [ ] Topic-Zuweisung UI in der Ideas-Tabelle
- [ ] Bulk-Actions (mehrere Ideen gleichzeitig freigeben)
- [ ] Export-Funktion (CSV)
- [ ] User-Verwaltung (Admin-Status togglen)
- [ ] Aktivitäts-Log

---

**Build Status:** ✅ Alle TypeScript-Checks erfolgreich, Next.js Build läuft durch.
