# Testbericht · 15. November 2026

Ausgeführt mit Node.js und `npm test` im Projektordner. Ergebnis: **22 Tests bestanden, 0 fehlgeschlagen**.

Geprüft wurden Katalogmengen und eindeutige IDs; sechs unterschiedliche Arbeitsschritte und zwei Niveaus je Skill; Kennzeichnung synthetischer Fälle; getrennte Kontodaten, Export und Löschung; Passwort-Hashing und Sitzungsende; Campusrollen, Sitzplatzgrenze, Kurs, Aufgabe, Einreichung und Lehrendenfeedback; API-Setup, Login, CSRF-Schutz, ID-Validierung und persistierte Lernantwort; Handler für alle deklarierten UI-Aktionen; relative Assets, vorhandene Bilddateien und Katalog der GitHub-Pages-Demo. Der Startseitentest prüft, dass konkrete Lerninhalte vor den Kennzahlen stehen. Die sechs PNG-Kartenbilder wurden auf Existenz geprüft, und ein PNG wurde über den Server-Handler binär ausgeliefert.

`node --check app.js`, `node --check src/app.js` und `node --check src/server.mjs` bestanden. Die HTTP-Routen wurden direkt am echten Server-Handler geprüft. Auf der zuvor veröffentlichten Seite wurde der Fehler reproduziert: Ein Klick auf den Titel der vorgestellten Skill-Karte ließ die Ansicht unverändert; erst die kleine Schaltfläche öffnete den Workflow. Im korrigierten Quellcode sind Inhaltskarten und die beiden navigierenden Kennzahlen jeweils ein einzelner semantischer Button. Ein zusätzlicher Test prüft die vollständige Kartenfläche und verhindert verschachtelte Buttons. Ein weiterer Test prüft, dass die aktive Practice-Übung vor den Auswahlkarten steht. **Der neue Stand wurde noch nicht auf GitHub Pages veröffentlicht und deshalb dort nicht visuell abgenommen.** Responsive Darstellung und Screenreader-Verhalten bleiben zusätzlich manuell zu prüfen.

Zusätzlich geprüft: 20 übernommene vollständige Prompt-Vorlagen mit je sechs Schritten und eindeutigen IDs, zwölf Grill-me-Profile, acht übernommene Fallstudien, 14 Workbench-Felder, Lehrplan, Rubrik und Rollenspiele. Jeder der 20 Skills verweist auf mindestens einen vorhandenen Prompt und einen vorhandenen Fall. Der statische GitHub-Katalog ist mit dem Server-Katalog identisch. Gerenderte HTML-Ansichten zeigen die übernommene Prompt-Vorlage, Workbench, Grill-me, Lehrmaterial, Fallstudie und Skill-Verknüpfung; die jeweils sichtbaren Aktionen besitzen Handler. Die kopierbaren Texte wurden nicht mit einer KI ausgeführt.

Ein weiterer Test prüft serverseitige Speicherung und persönlichen Export von Prompt-Antworten, Grill-me-Antworten und Workshop-Protokollen. Der lokale Server startete erfolgreich unter `127.0.0.1`; die Browserumgebung erreichte diese lokale Adresse jedoch nicht (`ERR_CONNECTION_TIMED_OUT`). Deshalb wird die neue Fassung nicht als visuell im Browser abgenommen ausgewiesen. Der veröffentlichte GitHub-Pages-Stand ist unverändert, bis dieses Paket hochgeladen wird.

Die `.gitignore`-Regel wurde auf den Laufzeitordner `/data/` begrenzt. `git check-ignore` bestätigt, dass `src/data/legacy-content.json`, `src/data/skill-inventory.json` und `src/data/source-candidates.json` beim Git-Upload nicht ausgeschlossen werden.

Ein zusätzlicher Render-Test prüft die direkten Einstiegskarten **Grill-me** und **Für Lehrende** auf der Startseite, den Grill-me-Einstieg im Practice Studio und den sichtbar beschrifteten Lehrendenbereich.
Ein weiterer Test prüft den direkten Spieleinstieg auf der Startseite und die erste von 60 Fragen mit fünf wählbaren Leveln, Speichern und Weiterblättern.

Die sichtbaren Texte wurden auf missverständliche Aussagen zu Herkunft und KI-Funktion geprüft. Das Practice Studio unterscheidet übernommene Prompt-Vorlagen, neu erstellte Spielfragen, synthetische Krisen und Selbsteinschätzung. Die erste Spielfrage zeigt jetzt den fiktiven Fall mit 12 von durchschnittlich 80 Austritten, Vergleichsgruppe, Zeitraum und Ausgangsdaten direkt vor der Aufgabe. Der Render-Test prüft diese Angaben und die Kennzeichnung, dass keine automatische Bewertung erfolgt.

Bekannte Grenzen: kein Passwort-Reset, kein Rate Limiting, keine externe KI, keine adaptive Verzweigung der Krisen, keine automatische Benotung, keine produktionsfertige Hosting-Konfiguration. Die Lerninhalte sind dort als rekonstruiert markiert, wo die Originale nicht geliefert wurden.

Das neue Hero-Bild auf weißem Hintergrund ist als PNG eingebunden. Die GitHub-Pages-Ansicht referenziert die relative Bilddatei; der Server liefert sie als image/png aus. Syntaxprüfung und Tests bestanden nach dem Austausch erneut.

Der sichtbare Schriftzug „Future HR Lab“ liegt als responsiver Seitentext über dem Hero-Bild. Der Einstiegstest prüft Wortlaut und Stilregel.

Für die zweite Gestaltung wurden ein gespeicherter Designschalter und ein klassisches CSS-Thema ergänzt. Ein Test prüft den Wechsel zwischen Modern und Klassisch, den aktiven Zustand der Schaltflächen und die Speicherung der Auswahl. Ein weiterer Test prüft, dass GitHub Pages und Server denselben Schalter und dieselben App-Inhalte nutzen. Der HTTP-Test prüft die Auslieferung von `theme.js`. Die Browserumgebung erreichte den lokalen Testserver erneut nicht (`ERR_CONNECTION_TIMED_OUT`); deshalb liegt keine visuelle Browserabnahme der klassischen Ansicht vor.

Nach dem zweiten Referenzscreenshot wurde die klassische Gestaltung auf eine weiße linke Navigation, große Serifentitel, eine helle Startbühne und ein neu erzeugtes blaues Architekturbild umgestellt. Der HTTP-Test prüft, dass dieses Bild in der Serverversion als PNG ausgeliefert wird. Die Katalog- und Funktionslogik blieb unverändert.

Ein Paritätstest rendert alle sechs Academy-Bereiche einmal mit `modern` und einmal mit `classic` und vergleicht ihre HTML-Inhalte vollständig. Ergebnis: identisch. Die klassische CSS-Ansicht blendet nur das moderne Hero-Bild und die moderne Markenvariante aus; der Text „Future HR Lab“ ist in beiden Ansichten sichtbar. Die unterschiedlichen Bilder sind rein gestalterisch.
