# Inhaltsabgleich · Executive Edition

| Bereich | Kanonische IDs | Umfang | Herkunft | Im neuen Design erreichbar über |
| --- | --- | ---: | --- | --- |
| Kompetenzwelten | CW-01–06 | 6 | neues UX-Briefing | Competency Worlds |
| Skills | SKILL-001–020 | 20 × 6 Phasen × 2 Niveaus | 7 verdichtete Module, 13 gekennzeichnete Rekonstruktionen | Competency Worlds; verknüpfte Prompts und Fälle |
| Vollständige Academy-Prompts | PROMPT-01–20 | 20 × 6 Schritte | früherer Academy-Projektstand `academy-core/index.html` aus diesem Chat | Practice Studio; Links in Skill-Workflows |
| Executive-Fälle | CASE-001–025 | 25 | synthetische Redaktion; die ersten 8 enthalten zusätzlich die früher ausgearbeiteten Fallstudien | Decision Lab; Links aus Prompt/Skill/Perspektive |
| Expertenperspektiven | P-01–12 | 12 | früherer Research-Projektstand, Original-/Herausgeberseiten | Knowledge Hub |
| Grill-me für Lehrende | GRILL-01–12 | 12 vollständige Prompts | früherer Academy-Projektstand | Teaching Studio; Links aus Knowledge Hub |
| Workshop-Workbench | WORKSHOP-01 | 14 Felder | früherer HR-UNLEARN-Workshop im Academy-Projektstand | Practice Studio; Speicherung und Export |
| HR Mastermind | GAME-001–060 | 60 Fragen, 5 Level | aus den 20 Skill-Schritten rekonstruiert | Practice Studio |
| Crisis Simulator | CRISIS-01–03 | 3 × 4 Phasen | synthetische Rekonstruktion | Practice Studio |
| Assessment | ASM-01–24 | 24 Aufgaben | redaktionell rekonstruiert | Practice Studio |
| Lehrmaterial | `teaching` im Katalog | 5 Transfertermine, 4-Punkte-Lehrplan, 4 Rubrikkriterien, 3 Abruffragen, 2 Erklärfragen, durchgearbeitetes Beispiel, 48-Stunden-Check, 2 Unterrichtsbeispiele, 3 Lehrenden-Skills, 2 Rollenspiele | früherer Academy-Projektstand | Teaching Studio |

Die vollständigen Prompt-Texte, Grill-me-Texte und Lehrmaterialien liegen einmalig in `src/data/legacy-content.json`. `src/content.mjs` verknüpft sie über IDs. `content.json` ist ein Build-Artefakt für GitHub Pages mit denselben Datensätzen.

## Nicht als Originalbestand verfügbar

Das importierte Claude-Work-Paket enthielt die in seiner README genannten 120 Musterantworten und die ursprünglichen Spiel-Quelldateien nicht. Es enthält auch keine vollständige separate HR-Literacy-Datenbank. Diese Bestandteile sind nicht als importiert oder fachlich freigegeben gekennzeichnet. Das aktuelle Mastermind ist ein nutzbarer, offener Übungsmodus ohne automatische Benotung; die Krisen sind nicht adaptiv. Die Quellen und Rechtsbezüge benötigen vor einem öffentlichen Produktivbetrieb eine erneute Fachprüfung.
