# Frill vs. Prototyp — Gap-Analyse

## Frill Ecosystem (Live-Daten)

| Bereich | Anzahl |
|---------|--------|
| Ideas (Feature Requests) | 3.227 |
| Votes | 85.642 |
| Followers (User) | 36.541 |
| Announcements | 54 |
| Statuses | 4 |
| Topics | 4 |
| Announcement Categories | 4 |

---

## Frill Statuses
1. **In Prüfung 🔎** (#ff6b4a)
2. **To Do 📋** (#ffd749)
3. **In Arbeit 🧑‍💻** (#4d6bdd)
4. **Erledigt 🎉** (#14c57e) ← is_completed=true

## Frill Topics (Idea-Kategorien)
1. ⚙️ Daten Import
2. ⭐ Neues Feature
3. 👌 Verbesserung
4. 📱 App

## Frill Announcement Categories
1. 👌 Verbesserung
2. New Feature
3. Bugfix
4. Announcement

---

## Frill Features die dem Prototyp FEHLEN

### 🔴 Kritisch (Core-Funktionalität)

| Feature | Frill | Prototyp | Aufwand |
|---------|-------|----------|---------|
| **Topics/Kategorien für Ideas** | ✅ Eigenes Model, mehrere pro Idea | ❌ Nur `tags` String | Mittel |
| **Approval-Workflow** | ✅ `needs-approval` / `approved` | ❌ Fehlt komplett | Mittel |
| **Status als eigenes Model** | ✅ Mit Farbe, Name, is_completed | ⚠️ Nur String-Enum | Klein |
| **Announcement Categories** | ✅ 4 Kategorien mit Farben | ❌ Fehlt | Klein |
| **Announcement Reactions** | ✅ 🔥❤️👍 Emoji-Reactions | ❌ Fehlt | Mittel |
| **Attachments auf Ideas** | ✅ Datei-Uploads | ❌ Fehlt | Groß |
| **Cover Images** | ✅ Pro Idea | ❌ Fehlt | Mittel |

### 🟡 Wichtig (UX/Admin)

| Feature | Frill | Prototyp | Aufwand |
|---------|-------|----------|---------|
| **Idea-Flags** | ✅ pinned, private, shortlisted, archived | ⚠️ Nur archived | Klein |
| **Idea Nummern** | ✅ Fortlaufend (#5435) | ❌ Nur CUIDs | Klein |
| **Anonyme User** | ✅ "Anonymous Chipmunk" etc. | ❌ Nur registrierte User | Mittel |
| **Follower-Konzept** | ✅ Separates Model, Follower != Voter | ❌ Fehlt | Mittel |
| **Translations/i18n** | ✅ Mehrsprachig (DE/EN) | ❌ Nur DE | Groß |
| **Comment Count auf Ideas** | ✅ Direkt im Objekt | ⚠️ Muss gezählt werden | Klein |
| **Vote Count auf Ideas** | ✅ Direkt im Objekt | ⚠️ Muss gezählt werden | Klein |

### 🟢 Nice-to-Have

| Feature | Frill | Prototyp |
|---------|-------|----------|
| **show_in_roadmap Flag** | ✅ Pro Idea | ❌ Nur über RoadmapItem Relation |
| **is_bug Flag** | ✅ Separates Boolean | ⚠️ Über `type` String |
| **Announcement published_at** | ✅ | ✅ |
| **Announcement Bilder** | ✅ S3-hosted | ❌ |
| **Companies auf Followern** | ✅ | ❌ |

---

## Was der Prototyp RICHTIG macht

- ✅ Magic Link Auth
- ✅ Feature Requests mit Voting
- ✅ Roadmap nach Quartal
- ✅ Announcements mit publish/draft
- ✅ Admin Dashboard
- ✅ Kommentare auf Ideas
- ✅ Report to Intercom
- ✅ Rate Limiting

---

## Empfohlene Priorität für Optimierung

### Phase 1 — Sofort (Frill-Parität Basics)
1. Topics/Kategorien als eigenes Model (Many-to-Many mit Ideas)
2. Status als eigenes Model mit Farben (statt String-Enum)
3. Approval-Workflow (`needs-approval` → `approved`)
4. Idea-Flags: pinned, private, shortlisted
5. Fortlaufende Idea-Nummern

### Phase 2 — Admin-Parität
6. Announcement Categories mit Farben
7. Announcement Reactions (Emoji)
8. Vote/Comment Count als Feld (Performance)
9. Anonyme User Support

### Phase 3 — Polish
10. Attachments/Cover Images
11. Translations (i18n)
12. Follower-Konzept (separate von Voters)
