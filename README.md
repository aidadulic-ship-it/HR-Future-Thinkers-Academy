# HR Future Thinkers Academy

Eigenständige lokale Lernplattform mit neuer UX nach dem gelieferten Work-Paket. Die alten HTML-Dateien dienten als Inhalts- und Funktionsreferenz. Die Anwendung nutzt Node.js ohne externe Laufzeitpakete.

**Start:** [INSTALLATION.md](INSTALLATION.md) lesen, dann `npm start`. **Tests:** `npm test`.

**GitHub-Upload:** [GITHUB_UPLOAD.md](GITHUB_UPLOAD.md). Das Repository allein veröffentlicht die laufende Academy nicht.

Die Dateien im Repository-Stammverzeichnis bilden eine **GitHub-Pages-Demo**. Sie zeigt das Layout und die Lerninhalte, speichert Übungsantworten lokal im Browser und braucht keine API. Die Mehrpersonen-Plattform mit Konten und Campus liegt unter `src/` und benötigt einen Node.js-Host.

Auf der Startseite führen konkrete Einstiege direkt zu einem sechsstufigen Skill, einem synthetischen Executive Case und einer gekennzeichneten Originalquelle. Die Kennzahlen stehen darunter.

Die Illustrationen liegen unter [`assets/`](assets/): sechs hochauflösende PNG-Kartenbilder, sechs SVG-Navigationsicons und ein neues, 3D-Hero-Motiv auf weißem Hintergrund. Die Kartenbilder wurden anhand des von der Nutzerin gezeigten Screenshots visuell rekonstruiert. Die Original-Bilddateien waren im Importpaket nicht enthalten. Pages und Serverversion laden dieselben Assets.

Über **Modern / Klassisch** in der Kopfzeile kann jede Person das Design wechseln. Beide Ansichten verwenden dieselben Seiten, Inhalte, Aktionen und gespeicherten Antworten. Die Auswahl wird nur in diesem Browser gespeichert. Ein Wechsel lädt die Seite nicht neu und lässt begonnene Eingaben stehen. Die klassische Variante folgt dem nachgereichten Screenshot: weiße linke Navigation, helle Bühne, große Serifentitel, Magenta-Akzente und ein blau getöntes Architekturmotiv. Das Motiv wurde für diese Fassung neu erzeugt.

Die sechs Bereiche sind My Future Path, Competency Worlds, Decision Lab, Knowledge Hub, Practice Studio und Teaching Studio. Lernantworten werden serverseitig einem Konto zugeordnet. Campusrollen begrenzen Kursverwaltung, Einreichungen und Feedback. Persönliche Daten lassen sich exportieren und ein Konto löschen; wenn eine Person die letzte Campusadministration ist, muss die Verwaltung vorher übertragen werden.

Der im früheren Chat erarbeitete Academy-Projektstand wurde erneut ausgewertet. Seine 20 vollständigen Prompts und je sechs Arbeitsschritte liegen in `src/data/legacy-content.json`, ebenso zwölf vollständige Grill-me-Lehrprompts, acht ausgearbeitete synthetische Fallstudien, ein 14-Felder-Workshop und Lehrmaterialien. Der Katalog in `src/content.mjs` verknüpft diese Datensätze mit Skills, Fällen, Perspektiven und Teaching Studio. Die GitHub-Pages-Demo erhält denselben Katalog als `content.json`. In der Prompt Library lassen sich Texte lesen, kopieren und exportieren; eigene Antworten lassen sich im Browser speichern. Auf dem Node-Host werden sie dem angemeldeten Konto zugeordnet.

**Direkte Einstiege:** Auf `My Future Path` führen eigene Karten zu **Grill-me**, **Für Lehrende** und **HR Mastermind**. Ein Button „HR Mastermind spielen“ steht zusätzlich im Startbereich. Das Spiel ist auch im `Practice Studio` erreichbar; Grill-me ebenfalls. Im `Teaching Studio` steht oben „Für Lehrende“, unmittelbar danach die zwölf Grill-me-Perspektiven und das weitere Lehrmaterial.

Der Katalog enthält redaktionell rekonstruierte Inhalte. Quellenstatus, synthetische Fälle, nicht verfügbare Originale und Funktionsgrenzen stehen in [INHALTSSTATUS.md](INHALTSSTATUS.md). Der Teststand steht in [TESTBERICHT.md](TESTBERICHT.md).
