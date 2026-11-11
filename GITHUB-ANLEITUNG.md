# HR Future Thinkers Academy

## In die bestehende Website übernehmen

1. ZIP entpacken.
2. Den Ordner academy in das Veröffentlichungsverzeichnis des bestehenden Website-Repositorys kopieren. Dort muss anschließend academy/index.html liegen. Je nach Projekt ist das die Repository-Wurzel oder zum Beispiel docs/.
3. Eine Änderung in einem Branch anlegen und die Vorschau unter /academy/ prüfen.

Nur der Ordner academy gehört ins Veröffentlichungsverzeichnis. Die HTML-Datei enthält das Design, das Bild, die Lerninhalte und die Browserlogik. Sie lässt sich auch per Doppelklick im Browser öffnen. Es sind keine Installation, Zugangsdaten oder Servereinstellungen für diese Vorschau erforderlich.

## Quellcode und Tests

Der Ordner source/academy-core enthält den Entwicklungsstand. Er kann außerhalb des veröffentlichten Verzeichnisses versioniert werden. Mit Node.js 24 dort ausführen:

```powershell
node build-preview.mjs
node --test *.test.mjs
```

Anschließend die erzeugte Datei source/Academy-Vorschau.html als academy/index.html übernehmen.

## Umfang

Offene Lernvorschau mit 20 Skill-Workflows, acht synthetischen Fällen, zwölf Forschungsprofilen, Workshops und Lehrmaterial. Geschützte Campus-Funktionen und echte KI-Anbindungen gehören nicht zu dieser statischen Vorschau. Der lokale Entwicklungsserver und seine Demo-Endpunkte sind ausschließlich für lokale Tests vorgesehen.
