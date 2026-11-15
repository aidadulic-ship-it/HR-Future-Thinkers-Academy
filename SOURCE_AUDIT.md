# Prüfung des importierten Work-Pakets

Stand: 15. November 2026. Historische Dateien sind Referenzen, keine vollständige Quellcodebasis. Angaben in der historischen README sind Behauptungen über damals andere, hier nicht vorhandene Dateien.

| Datei | Tatsächlich nachweisbar | Grenze |
|---|---|---|
| `02_Originaldateien/index.html` | Zwei Fälle mit je fünf Schritten, lokale Antworten, JSON-Export und Löschung, Lehrleitfaden und Rubrik; JavaScript verwendet `localStorage`. | Kein Account, keine Kursverwaltung, keine zentrale Einreichung; Link `academy.html` ohne mitgelieferte Zieldatei. |
| `HR_Future_Thinkers_Academy_Executive_2026.html` | Zwölf Profile, 20 beschreibende Skill-Karten, ein dreistufiger Entscheidungsimpuls, Filter und vier lokal gespeicherte Workshop-Notizen. | Keine ausführbare Skill-Didaktik, keine echte KI, keine geschützten Daten. |
| `HR_Future_Thinkers_Academy_Skills_v8.html` | Gleiche Oberfläche und JavaScript-Interaktionen wie Executive-Datei, ausführlichere Beschreibungen für 20 Skills. | Skill-Details sind Text und externe Notion-Links, keine durchlaufbaren Workflows. |
| `README.md` | Dokumentiert früheren Umfang und Befehle. | Die erwähnten `source/academy-core/`, Musterantworten, 105 Tests, 25 Fälle und Spiel-Dateien sind nicht im Paket. |
| `GITHUB-ANLEITUNG.md` | Dokumentiert Veröffentlichungsweg einer alten statischen Vorschau. | Keine produktionsfähige Campus-Installation. |
| `SKILL_INVENTAR.json` | Stabile IDs und Zuordnung von 20 geplanten Skills. | Sieben verdichtete Konzepte; 13 nur Rekonstruktionsvorschläge. |
| `QUELLENREGISTER.json` | Zehn Kandidaten für Originalquellen. | Keiner im Paket selbst verifiziert; EVD-010 nennt nur eine OECD-Startseite. |
| `SIEBEN_KONZIPIERTE_MODULE.md` | Sieben Szenarien mit methodischem Gerüst. | Keine vollständigen historischen Originaltexte. |

Die neue UX, Navigation und Datenstruktur folgen der Informationsarchitektur des Pakets. Altes HTML und CSS werden nicht als UI übernommen.

Zusätzlich lag im bisherigen Chat-Arbeitsverzeichnis der früher erarbeitete Academy-Projektstand `work/academy-core/index.html` vor. Er enthält tatsächlich 20 vollständige HR-Lerncoach-Prompts mit je sechs Aufgaben, zwölf vollständige Grill-me-Lehrprompts, acht ausgearbeitete Fallstudien und Lehrmaterial. Diese Inhalte wurden aus der Datei extrahiert und in `src/data/legacy-content.json` übernommen; das alte Interface und dessen CSS wurden nicht verwendet. Der ursprüngliche Spiel-Quellcode und die 120 Musterantworten sind auch dort nicht vorhanden.
