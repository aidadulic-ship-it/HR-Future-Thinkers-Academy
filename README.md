# HR Future Thinkers Academy

> Die Website ist jetzt als **HR Future Thinkers Academy** aufgebaut. Die offene Einzeldatei führt in einen Entscheidungsfall mit Briefing und enthält einen eigenen Lehrbereich. Der Campus-Kern und seine Tests liegen als früherer Entwicklungsstand im Quellordner. Die Vorschau bindet den Campus-Kern nicht ein.



Dieser lokale JavaScript-Kern ist der erste testbare Teil der Umsetzung für aidadulic.at/academy.

## Ausführen

Mit Node.js im Ordner dieses Projekts:

```powershell
node --test campus.test.mjs
```

Getestet mit Node.js 24.20.0. Der Kern benötigt keine zusätzlichen Pakete.

## Entscheidungen und Umfang

- Entscheidung 42 bestätigt Campus-Anträge mit zentraler Freigabe und anschließender automatischer Einrichtung. Der Kern bildet Antrag, Freigabe und die Zuweisung der Campus-Administration ab.
- Entscheidung 43 bestätigt Academy-eigene Konten und den vollständigen Funktionsumfang beim ersten Release. Academy-Konten mit E-Mail und Passwort, eine aktive Sitzung je Konto und getrennte öffentliche und Campus-Zugriffe gehören in die weitere Umsetzung. Hochschul-SSO und Moodle-, Canvas- oder andere LMS-Integrationen sind ausgeschlossen.
- Frage 44 zum Enrollment ist unbestätigt. Die direkte Zuordnung eines bestehenden Testkontos im Kern dient der Prüfung von Rollen und Lizenzgrenzen. Einladungen, CSV-Import, Kurscodes und andere Aufnahmeregeln sind durch diesen Aufruf nicht festgelegt.
- Der verfügbare Chat-Abruf endet bei Entscheidung 42. Entscheidungen 1–41 müssen noch gegen den Originalverlauf abgeglichen werden.

## Technische Defaults für diesen Arbeitsstand

- Der Kern läuft lokal im Speicher und verliert Daten beim Neustart. Er hat keine HTTP-Schnittstelle und verarbeitet keine Echtdaten. Produktivdatenbank, Hosting, Datenstandort, Backups und Betrieb sind offen.
- Die aufrufende Schicht muss die Identität prüfen und die Konto-ID aus der Sitzung ableiten. Die Methode zur Anlage von Testkonten ist keine Registrierungs- oder Berechtigungs-API.
- Eine positive Ganzzahl begrenzt die aktiven Mitgliedschaften pro Campus. Die Campus-Administration belegt im aktuellen Modell einen Platz. Campusrollen gelten nur innerhalb der jeweiligen Organisation. Die Rollen Student und Lehrperson können lokal zugeordnet werden.
- Die einzige umgesetzte Funktion des persönlichen Kompetenzpasses ist eine private Reflexionsliste. Sie bleibt bei Wegfall einer Campus-Mitgliedschaft erhalten. Nachweisvergabe, Prüfung, Veröffentlichung und Export sind offen.
- Externe KI, E-Mail und andere externe Dienste sind in diesem Arbeitsstand deaktiviert beziehungsweise nicht angebunden. Anbieter, Datenverarbeitung, Berechtigungen und Limits bleiben offen.

## Offener Release-Umfang

Öffentliche Academy, vollständiger Campusbereich mit Kursen und Bewertungen, Academy-Anmeldung und Sitzungsverwaltung, 20 Skills, 12 wissenschaftliche Perspektiven, Evidence Engine, Human-AI Decision Trace, vollständiger Competence Passport, Teaching Intelligence und Improvement Lab, Innovation Network sowie vollständige Lizenz-, Rollen- und Sicherheitsverwaltung. Der Stand ist lokal und wurde nicht veröffentlicht.

## Testlauf

RED belegte den fehlenden Kern. GREEN bestätigte Campus-Freigabe, Organisationsgrenzen, Lizenzgrenzen und private Reflexionen nach dem Austritt. REFACTOR fasste den gemeinsamen Mitgliedschaftscheck zusammen. Die vier Tests wurden danach erneut ausgeführt.


## Offenen Testlauf ansehen

Öffne `index.html` direkt im Browser. Lernangebot, Werkzeugübersicht und Campus-Demo stehen in dieser Vorschau allen ohne Anmeldung oder E-Mail offen. Die Demo verwendet zwei simulierte Rollen. Eingaben bleiben im jeweiligen Tab und werden beim Neuladen zurückgesetzt.

Optional kann die Vorschau mit `node server.mjs` unter `http://127.0.0.1:4173/academy/` auf dem eigenen Computer gestartet werden.

Alle Tests einschließlich des offenen Campus-Ablaufs:

```powershell
node --test campus.test.mjs website.test.mjs open-test.test.mjs
```

## Einzeldatei für die Vorschau

`node build-preview.mjs` erzeugt `../Academy-Vorschau.html` mit eingebettetem Bild, Styles und Browserlogik. Die Datei lässt sich aus dem Explorer im Standardbrowser öffnen. `node --test *.test.mjs` prüft danach unter anderem den Campus-Ablauf in genau dieser Datei. Ein echter Browserlauf bleibt eine separate Prüfung.

## Abgleich mit Matt Pococks Entwicklungsansatz

- **Nachvollziehbare Produktentscheidungen:** Die Entscheidungen 42 und 43 und der offene Status von Frage 44 sind dokumentiert. Der Abgleich der Entscheidungen 1–41 und ihre Zuordnung zu Abnahmekriterien fehlen.
- **Durchgängige Funktionsschritte:** Der offene Testlauf deckt den Weg vom Campus-Testantrag bis zur sichtbaren Freigabe ab. Die Fachmodule sind in der Vorschau beschrieben. Nutzbare Funktionsschritte für Evidence Engine, Human-AI Decision Trace und die übrigen Module stehen aus.
- **Verhalten testen:** Der neue Regressionstest schlug vor Erstellung der Einzeldatei fehl und besteht jetzt zusammen mit den bisherigen Tests. Er führt die ausgelieferten Skripte mit nachgebildeten Browser-Eingaben aus. Rendering und echtes Browserverhalten sind damit noch nicht geprüft.
- **KI im Produkt:** Der Arbeitsstand enthält keinen Modellaufruf. Modellantworten, Quellenbezug und menschliche Prüfung sind daher noch nicht bewertbar.

Grundlage: [Matt Pocock, AI Skills for Real Engineers](https://www.aihero.dev/skills-post).



## Masterbriefing · aktueller Lieferstand

Die eigenständige `Academy-Vorschau.html` enthält die 20 Skill-Slugs aus dem Briefing mit je sechs ausfüllbaren Schritten und lokalem Textexport, acht synthetische Fallstudien sowie zwölf Einstiegsprofile mit verlinkten Quellen. Die früheren generischen Kataloge waren redaktionelle Entwürfe und wurden durch die im Briefing benannten Taxonomien ersetzt. Die Campus Edition ist gemäß dem neueren Masterbriefing wieder als Zielbereich sichtbar. Die Vorschau bleibt öffentlich zugänglich ohne Konto und speichert keine Nutzerdaten serverseitig.

Die Profile enthalten je einen belegten Ausgangspunkt, Grenzen, zwei Fallbezüge und einen Vergleich. Vertiefte Biografien und drei bis fünf belegte Modelle pro Person stehen aus. Die Workflows erzeugen ein Protokoll aus menschlichen Eingaben. Vollständige Skill-Didaktik, Musterantworten, integrierte KI-Assistenten, persistente Speicherung und Kompetenzmodell-Zuordnung stehen aus.

Für den ersten produktiven Release bleiben insbesondere die separaten Seitenrouten, die geschützte Campus-Plattform mit Rollen und Kursen, Evidence Engine und Perspektiven-Labor, Decision Trace und signierter Kompetenzpass, Learning Coach, Teaching Intelligence, Innovation Network, Kontingente sowie Sicherheits-, Datenschutz- und fachliche Abnahme offen. Bestehende Produktionsquellen für aidadulic.at wurden im lokalen Arbeitsbereich bislang nicht identifiziert. Die Vorschau wurde nicht produktiv veröffentlicht.

Prüfen im Ordner `academy-core`:

```powershell
node build-preview.mjs
node --test *.test.mjs
```


