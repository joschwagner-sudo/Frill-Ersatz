# Frill-Ersatz — Produkt-Spezifikation

## Warum
- Kosten sparen (Frill zu teuer)
- Frontend soll zum Finanzfluss-Design passen
- Bessere Trennung von Bugs vs. Feature Requests

## Zielgruppe
- Finanzfluss-User die Feedback geben wollen
- Finanzfluss-Team (Admins) die das Feedback verwalten

---

## Seitenstruktur

### 🌐 Öffentlich (User)

#### `/` — Landing
- Übersicht/Einstieg
- Stats (Anzahl Ideen, Votes, etc.)

#### `/ideas` — Ideen / Feature Requests
- Liste aller **freigegebenen** Feature Requests
- Filtern nach Topic (⚙️ Daten Import, ⭐ Neues Feature, 👌 Verbesserung, 📱 App)
- Sortieren: Meiste Votes, Neueste, Trending
- Suche
- Pro Idee: Titel, Beschreibung, Vote-Count, Kommentar-Count, Status-Badge, Topic-Badge
- Voten (1x pro User pro Idee)
- **Nur freigegebene Ideas sichtbar** (APPROVED)

#### `/ideas/[id]` — Idee Detail
- Voller Beschreibungstext
- Vote-Button
- Kommentare lesen + schreiben
- Status anzeigen (In Prüfung, To Do, In Arbeit, Erledigt)
- Verwandte Ideen (optional, später)

#### `/ideas/new` — Neue Idee einreichen
- Titel + Beschreibung
- Topic auswählen (Pflicht)
- **Kein Bug-Feld** — Bugs gehen über separaten Report
- Nach Einreichen: Status "Prüfung ausstehend" → wird erst nach Admin-Freigabe öffentlich

#### `/roadmap` — Roadmap
- Gruppiert nach Quartal (Q1 2026, Q2 2026, ...)
- Zeigt Ideas mit Status: To Do, In Arbeit, Erledigt
- Farbige Status-Badges (Frill-Farben)

#### `/announcements` — Neuigkeiten / Changelog
- Chronologische Liste der Announcements
- Kategorien: 👌 Verbesserung, New Feature, Bugfix, Announcement
- Emoji-Reactions (🔥❤️👍)
- Nur publizierte Announcements sichtbar

#### `/report` — Bug melden
- Formular: Titel, Beschreibung, Screenshot (optional)
- Wird **direkt an Intercom** weitergeleitet
- **Nicht öffentlich** sichtbar auf der Seite
- User bekommt Bestätigung: "Danke, dein Report wurde an unser Support-Team weitergeleitet"

#### `/account` — Mein Bereich (eingeloggt)
- **Meine Ideen**: Liste meiner eingereichten Vorschläge mit aktuellem Status
- **Meine Votes**: Welche Ideen hab ich gevoted
- **Notifications**: Status-Updates zu meinen Ideen
- Account-Einstellungen (Email, ggf. Name)

#### `/login` — Anmelden
- Magic Link (Email → 6-Digit Code)
- Prototyp: Code wird direkt angezeigt (Dev-Modus)
- Später: Integration mit Finanzfluss-Account

---

### 🔒 Admin (versteckt, nur `/admin`)

#### `/admin` — Dashboard
- **Stats**: Gesamt Ideen, Prüfung ausstehend, Freigegeben, User, Votes, Comments
- **Tabs**: Ideen | Announcements | User

#### Admin → Ideen
- Alle Ideen (inkl. nicht freigegebene)
- Filter: Alle | Prüfung ausstehend | Freigegeben | Abgelehnt
- Quick-Actions:
  - ✅ Freigeben / ❌ Ablehnen
  - Status ändern (In Prüfung 🔎 → To Do 📋 → In Arbeit 🧑‍💻 → Erledigt 🎉)
  - 📌 Pinnen
  - 🔒 Privat setzen
  - ⭐ Shortlisten
  - 🗃️ Archivieren
  - Topics zuweisen
- Idee bearbeiten (Titel, Beschreibung)

#### Admin → Announcements
- Alle Announcements (Drafts + Publizierte)
- Erstellen + Bearbeiten
- Publishen
- Kategorien zuweisen

#### Admin → User
- User-Liste mit Email, Admin-Status, Datum
- Anzahl Ideen + Votes pro User

---

## Statuses (wie Frill)
| Status | Farbe | Emoji |
|--------|-------|-------|
| In Prüfung | #ff6b4a | 🔎 |
| To Do | #ffd749 | 📋 |
| In Arbeit | #4d6bdd | 🧑‍💻 |
| Erledigt | #14c57e | 🎉 |

## Topics (wie Frill)
| Topic | Emoji |
|-------|-------|
| Daten Import | ⚙️ |
| Neues Feature | ⭐ |
| Verbesserung | 👌 |
| App | 📱 |

## Announcement Categories (wie Frill)
| Kategorie | Farbe |
|-----------|-------|
| Verbesserung | #63C8D9 |
| New Feature | #6392D9 |
| Bugfix | #87eb5e |
| Announcement | #FF3C3C |

---

## Voting
- **1 Vote pro User pro Feature** (max)
- Toggle: nochmal klicken → Vote zurücknehmen
- Ohne Login kein Vote → redirect zu Login
- Vote-Count live aktualisieren nach Klick (kein Page-Reload)
- Klickbarer Vote-Button auf der Liste UND auf der Detail-Seite
- Visuelles Feedback: voted = hervorgehoben (blau/aktiv), nicht voted = grau

## Notifications
- User wird benachrichtigt wenn:
  - Eigene Idee freigegeben wird
  - Status der eigenen Idee sich ändert
  - Jemand die eigene Idee kommentiert
- Anzeige im `/account` Bereich
- Später: auch per Email

---

## Design (Finanzfluss CI)
- **Font**: Outfit (haben wir schon)
- **Primärfarbe**: Finanzfluss-Blau (#1a56db / #4D6BDD)
- **Background**: Weiß (#FFFFFF), nicht Navy — wie finanzfluss.de
- **Cards**: Weiß mit leichtem Border + Schatten, abgerundet (12px)
- **Viel Whitespace** — clean, luftig, nicht gedrängt
- **Navigation**: Finanzfluss-Logo oben links, Nav-Links mittig, Login/Account rechts
- **Responsive**: Mobile-first
- **Dark Mode**: Optional (Finanzfluss selbst hat keinen Dark Mode)
- **Stil-Referenz**: finanzfluss.de Hauptseite — modern, vertrauenswürdig, professionell

## Fehlende Features (über Frill hinaus)

### 🔍 Duplikat-Erkennung
- Beim Einreichen einer neuen Idee: Ähnliche bestehende Ideen anzeigen
- "Meinst du vielleicht...?" → verhindert doppelte Feature Requests
- Reduziert Admin-Aufwand massiv

### 📊 Admin Analytics
- Trends: Welche Topics bekommen die meisten Votes?
- Aktivität über Zeit (neue Ideen/Votes pro Woche)
- Top-Voter / aktivste User

### 🏷️ Merging von Ideen (Admin)
- Doppelte/ähnliche Ideas zusammenführen
- Votes werden kombiniert
- Wichtig bei 3.000+ Ideen

### 📧 Email-Digest (optional, später)
- Wöchentliche Zusammenfassung: Neue Top-Ideen, Status-Updates
- Opt-in für User

### 🔗 Sharing
- Einzelne Ideen per Link teilen
- Social Share Buttons (optional)
- Open Graph Meta Tags für schöne Previews

### 💬 Admin-Kommentare
- Offizielle Antworten vom Team hervorheben
- Visuell abgesetzt (z.B. blaue Border, "Finanzfluss Team" Badge)
- User sieht: "Das Team hat geantwortet"

### 🗳️ Sortierung & Trending
- "Im Trend": Ideas die in den letzten 7 Tagen die meisten Votes bekommen haben
- Nicht nur absolute Vote-Zahl, sondern Momentum

---

## Priorität / Phasen

### Phase 1 — MVP (Frill-Parität)
- [x] Ideas: Liste, Detail, Einreichen
- [ ] **Voting funktioniert** (Toggle, 1x pro User, live Update)
- [ ] Topics als eigenes Model
- [ ] Status-Model mit Farben
- [ ] Approval-Workflow
- [ ] Roadmap nach Quartal
- [ ] Announcements mit Kategorien + Emoji-Reactions
- [ ] Bug Report → Intercom
- [ ] `/account` — Meine Ideen, Meine Votes
- [ ] Admin Dashboard (Approve/Reject, Status, Flags)
- [ ] Design: Finanzfluss CI (weiß + blau, kein Dark Mode)

### Phase 2 — Besser als Frill
- [ ] Duplikat-Erkennung beim Einreichen
- [ ] Admin-Kommentare (Team-Badge)
- [ ] Merging von Ideen (Admin)
- [ ] Trending-Sortierung (Momentum)
- [ ] Notifications bei Status-Änderungen
- [ ] Sharing + Open Graph Meta Tags

### Phase 3 — Polish
- [ ] Admin Analytics (Trends, Top-Topics, Aktivität)
- [ ] Email-Digest (wöchentlich, opt-in)
- [ ] Datenmigration aus Frill (3.227 Ideas, 85.642 Votes, 36.541 User)
- [ ] Integration mit Finanzfluss-Account (SSO)

## Auth
- Prototyp: Magic Link (Email → Code)
- Produktion: Integration mit Finanzfluss-Account

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (Neon)
- Resend (Email)
- Vercel (Hosting)

---

## Datenmigration (optional, später)
- 3.227 Ideas aus Frill importieren
- 85.642 Votes migrieren
- 36.541 Follower/User übernehmen
- 54 Announcements importieren
