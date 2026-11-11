# HR Future Thinkers Academy

Statische Academy-Seite für **aidadulic.at/academy**. Eine unabhängige Initiative von Aida Đulić, B.A.

> **Status: Vorschau, nicht für den Produktivbetrieb freigegeben.** Vor einer Veröffentlichung stehen Funktions-, Sicherheits-, Datenschutz- und Qualitätsprüfung sowie die fachliche Freigabe der Inhalte aus (siehe Checkliste unten). Bis dahin das Repository **privat** halten.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `academy/index.html` | Die fertige Seite als eine einzige Datei (Styles, Skripte, Bild, Schriften eingebettet). Das ist der Ordner, der später unter `/academy/` veröffentlicht wird. |
| `source/academy-core/` | Bearbeitbare Quellen: `index.html`, `site.css`, `site.js`, Build, Tests, Schriften, Musterantworten |
| `source/academy-core/musterantworten.json` | 120 Musterantworten (20 Skills × 6 Schritte), Entwurf zur fachlichen Freigabe |
| `testdaten/zeitkapsel-testdaten.json` | Synthetische Kapseln zum Testen der Entscheidungs-Zeitkapsel |
| `docs/briefing/` | Arbeitsauftrag und Content-Masterbriefing |
| `.github/workflows/tests.yml` | Automatische Tests bei jedem Push |

## Was die Seite kann

- Einstiegsweiche für HR, Lehrende, Workshop und Zeitkapsel
- Decision Lab mit Beispiel-Decision-Trace und eigenem Executive Briefing
- 20 HR-AI-Skills: sechs Schritte, Prüffrage, Human-First-Sperre für den KI-Prompt, Musterantworten nach eigener Antwort, Selbstbewertung, Transfer bis Tag 30, Wiederholungstermine (.ics), Gegenrede per E-Mail, Textexport
- Prompt-Bibliothek mit allen 20 Prompts (kopieren, einzeln oder gesammelt speichern)
- „Welcher Skill passt?“ mit sechs gemischten Fällen
- 12 wissenschaftliche Perspektiven mit Quellen und Perspektiven-Duell
- 8 synthetische Fallstudien
- Reality Check (Workshop) mit Workbench und Protokoll-Export
- Entscheidungs-Zeitkapsel mit Urteilsprofil
- Lehrendenbereich mit Kursarbeitsplatz, 30-Tage-Lernpfad, Lehrpraxis und Grill-me (12 Perspektiven)
- Campus Edition (geplant) mit drei Lernmodi
- Spiel „HR-Mastermind“ direkt auf der Seite (#spiel): fünf Level, Fallakten finden, Prompt-Joker, Feuerwerk und Urkunde
- Profi-Stufe mit Sicherheitsangabe vor jeder Antwort, 60 Spielfragen
- Krisenmodus: drei frei erfundene, verzweigte Unternehmenskrisen in je vier Phasen mit Anzeigen für Vertrauen und Risiko, Rückblick und Vertiefung in der Academy (`#spiel-krise`)
- Ohne Konto, ohne Anmeldung, ohne Datenübertragung, ohne Tracking, ohne externe Abrufe beim Laden

## Lokal ansehen

`academy/index.html` per Doppelklick im Browser öffnen.

## Ändern, bauen, testen

Voraussetzung: Node.js 24 oder neuer.

```bash
cd source/academy-core
node build-preview.mjs        # erzeugt source/Academy-Vorschau.html
node --test "*.test.mjs"      # 87 Tests
```

Danach die gebaute Datei übernehmen:

```bash
cp ../Academy-Vorschau.html ../../academy/index.html      # macOS/Linux
copy ..\Academy-Vorschau.html ..\..\academy\index.html    # Windows
```

Die GitHub-Action prüft bei jedem Push, ob Build und Tests grün sind und ob `academy/index.html` dem aktuellen Build entspricht.

## Veröffentlichen (erst nach Freigabe)

- **Im bestehenden Website-Repository von aidadulic.at:** nur den Ordner `academy/` in dessen Veröffentlichungsverzeichnis kopieren. Repository und Veröffentlichungsquelle sind noch zu klären.
- **Als eigene GitHub-Pages-Seite:** In den Repository-Einstellungen unter *Pages* den Branch `main` und den Ordner `/ (root)` wählen. Die Seite liegt dann unter `…github.io/<repo>/academy/`. Achtung: Bei einem öffentlichen Repository sind auch Briefing und Quellen öffentlich.

## Checkliste vor dem Livegang

- [ ] Fachliche Freigabe: Musterantworten, Skill-Zuordnung zu den fünf Tätigkeiten, Kurzziele, Text „Über die Academy“
- [ ] USP-Satz gegen Wettbewerb geprüft
- [ ] Quellenlinks der zwölf Profile geprüft und erreichbar
- [ ] Bildrechte für das Hero-Bild geklärt
- [ ] Impressum und Datenschutzerklärung von aidadulic.at verlinkt
- [ ] Rechtliche Prüfung (DSGVO, EU AI Act) für die konkreten Anwendungsfälle
- [ ] Sicherheitsprüfung (u. a. Content-Security-Policy beim Hosting, Datei-Upload der Zeitkapsel)
- [ ] Barrierefreiheitsprüfung mit Screenreader und Tastatur
- [ ] Test auf echten Geräten (iPhone, Android, Windows, Mac)

## Offen (bewusst nicht umgesetzt)

Geschützter Campus-Betrieb mit Konten und Rollen, echte KI-Integration, serverseitige Speicherung, Evidence Engine, signierter Kompetenzpass, skill-spezifische Zeitangaben und Rubriken, Wirkungsmessung mit echten Lernenden. Details und Verlauf: `source/academy-core/README.md`.

## Lizenzen

- Schriften DM Sans und Instrument Serif: SIL Open Font License 1.1 (`source/academy-core/fonts/`)
- Inhalte und Code: alle Rechte bei Aida Đulić, sofern nicht anders angegeben. Eine Lizenz für die Weiterverwendung ist noch nicht festgelegt.
