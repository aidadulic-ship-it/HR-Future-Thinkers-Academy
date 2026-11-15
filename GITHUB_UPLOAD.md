# Dieses Paket auf GitHub stellen

Das ZIP ist ein **Repository-Paket**. Im Stammverzeichnis liegen `index.html`, `app.css`, `app.js`, `theme.js`, `content.json` und `assets/` als GitHub-Pages-Demo. `assets/` enthält sechs anhand des Referenzscreenshots rekonstruierte PNG-Kartenbilder, sechs Navigationsicons und ein Hero-Motiv. `src/` enthält die Serverversion mit Anmeldung und Campus. Das Paket enthält Quellcode, Dokumentation, Tests, `.gitignore` und eine GitHub-Actions-Prüfung. Es enthält keine Kontodaten, Passwörter oder laufende Datenbank.

## Im Browser

1. Das bestehende Repository `The-HR-Future-Thinkers-Academy` öffnen. Für ein anderes Projekt gegebenenfalls ein neues Repository erstellen.
2. Dieses ZIP lokal entpacken.
3. **Die Dateien und Ordner aus dem entpackten Verzeichnis** in das Repository hochladen, insbesondere `index.html`, `app.css`, `app.js`, `theme.js`, `content.json`, `assets/`, `src/`, `tests/` und `.github/`. Der Inhalt gehört direkt in das Stammverzeichnis des Repositorys, nicht in einen zusätzlichen ZIP-Unterordner. Vorhandene alte Dateien mit gleichem Namen ersetzen. Für den Designwechsel sind insbesondere `index.html`, `app.css`, `theme.js`, `src/index.html` und `src/server.mjs` neu.
4. Unter **Settings → Pages** als Quelle den Branch `main` und den Ordner `/ (root)` wählen. Nach dem nächsten Build die Seite neu laden. Die URL unter `...github.io/REPOSITORYNAME/` zeigt nun die Demo mit Layout und Inhalten.
5. Unter **Actions** prüfen, ob „Academy checks“ erfolgreich ist.

Die Pages-Demo enthält die sechs Inhaltsbereiche und speichert eigene Übungsantworten ausschließlich im Browser des Besuchers; sie kann diese Daten exportieren und löschen. **GitHub Pages führt den Node.js-Server mit Anmeldung, Campusrollen und gemeinsamer Datenhaltung nicht aus.** Dafür ist ein separater Node.js-Host mit HTTPS und sicherer Datenhaltung nötig. Die Serverversion startet lokal gemäß `INSTALLATION.md`.

## Mit Git auf dem eigenen Rechner

Im entpackten Projektordner:

```text
git init
git add .
git commit -m "Initial HR Future Thinkers Academy package"
git branch -M main
git remote add origin URL_DES_NEUEN_REPOSITORYS
git push -u origin main
```

Vor dem Upload kontrollieren, dass `data/`, `.env` und lokale Sicherungen fehlen. `.env.example` ist ein Muster ohne echten Schlüssel. Keine echten Kontodaten oder geheimen Schlüssel in GitHub ablegen.
