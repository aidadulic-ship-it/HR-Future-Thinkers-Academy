# Installation und erster Start

## Voraussetzungen

Node.js 22 oder neuer. Keine Paketinstallation und keine externe Datenbank nötig. Die Anwendung bindet standardmäßig nur an `127.0.0.1`.

1. ZIP entpacken und im Projektordner ein Terminal öffnen.
2. Einen langen zufälligen Setup-Schlüssel festlegen. Unter PowerShell:

   ```powershell
   $env:ACADEMY_SETUP_KEY = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   Write-Output $env:ACADEMY_SETUP_KEY  # Wert für Schritt 3 kopieren
   $env:ACADEMY_DATA_FILE = (Join-Path (Get-Location) 'data/academy-state.json')
   npm start
   ```

3. In einem zweiten PowerShell-Fenster die erste Administration anlegen. Den im ersten Fenster gesetzten Schlüssel als Wert einsetzen:

   ```powershell
   $setupKey = 'HIER_DEN_ERZEUGTEN_SCHLUESSEL_EINSETZEN'
   $body = @{ email = 'admin@beispiel.at'; password = 'HIER_EIN_PASSWORT_MIT_MINDESTENS_12_ZEICHEN' } | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/setup' -Method Post -ContentType 'application/json' -Headers @{ 'x-setup-key' = $setupKey } -Body $body
   ```

4. `http://127.0.0.1:3000` öffnen und anmelden. Weitere Konten entstehen über „Registrieren“. Die Administration kann Campus-Anfragen im Teaching Studio freigeben.

5. Tests ausführen: `npm test`.

## Betrieb

Die Datei `data/academy-state.json` enthält personenbezogene Lernantworten, Rollen und Passwort-Hashes. Sie wird beim Schreiben ersetzt. Regelmäßig sichern und Zugriffsrechte auf das Verzeichnis begrenzen. Nicht in ein öffentliches Repository hochladen. Für einen öffentlichen Betrieb sind HTTPS, sichere Cookies (`ACADEMY_SECURE_COOKIE=1`), ein vorgeschalteter Server, Backups, Monitoring, Rate Limiting, Passwort-Reset und eine Datenschutzprüfung erforderlich. Diese lokalen Betriebsfunktionen sind im Paket nicht vorkonfiguriert.

Das Setup-API akzeptiert nur den Schlüssel aus `ACADEMY_SETUP_KEY` und nur die erste Administratorin oder den ersten Administrator. Für den späteren Betrieb den Schlüssel aus der Serverumgebung entfernen und den Server neu starten. Die Sitzung ist 12 Stunden gültig und liegt nur im Serverspeicher; ein Neustart meldet alle ab.

## Projektstruktur

- `index.html`, `app.css`, `app.js`, `theme.js`: GitHub-Pages-Oberfläche mit zwei Designs; die Serverversion nutzt dieselben CSS-, JS- und Bilddateien.
- `src/index.html`: Server-Einstieg mit Anmeldung; `src/app.js` ist die identische App-Quelle für die Inhalts- und Render-Tests.
- `src/content.mjs`, `src/research-reference.mjs`, `src/data/`: kanonischer Inhaltskatalog.
- `src/server.mjs`, `src/platform.mjs`: lokaler Server und Rollen-/Lerndatenlogik.
- `tests/`: automatisierte Inhalts-, Rollen- und API-Tests.
- `SOURCE_AUDIT.md`, `INHALTSSTATUS.md`, `TESTBERICHT.md`: Nachweise und Grenzen.
