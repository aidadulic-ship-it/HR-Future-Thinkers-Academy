# Umsetzungsstand · 15. November 2026

Die sechs Hauptbereiche und das neue helle Design sind im GitHub-Pages-Einstieg vorhanden. Alle navigierenden Karten öffnen Inhalt. Der Node-Server ergänzt Konten, eine aktive Sitzung pro Konto, Campusrollen, Kurse, Einreichungen, Feedback, persönlichen Export und Löschung. Die GitHub-Pages-Fassung speichert Antworten nur im Browser und kennzeichnet diesen Modus als Demo.

Der erneute Inhaltsabgleich ist in [CONTENT_COVERAGE.md](CONTENT_COVERAGE.md) dokumentiert. 20 vollständige frühere Prompts, zwölf Grill-me-Perspektiven und die früher ausgearbeiteten Fall- und Lehrmaterialien sind in den neuen Ansichten integriert. Die 20 Skills und 25 Fälle haben stabile IDs und Verknüpfungen. 60 Spielfragen, drei Krisen und 24 Assessment-Fragen sind rekonstruierte Trainingsinhalte.

**Geprüft:** Syntax, Katalogbeziehungen, gerendertes HTML der Kernansichten, Speichern und Export von Übungen, serverseitige Rollen-/Sitzungsfunktionen; siehe [TESTBERICHT.md](TESTBERICHT.md).

**Noch nicht abgenommen:** visueller Echtbrowserlauf der neuen lokalen Version, 360px-/Tablet-/Desktop- und Screenreader-Prüfung, vollständige fachliche Quellenfreigabe, produktives Hosting unter `aidadulic.at/academy`. Die Browserumgebung konnte den erfolgreich gestarteten lokalen Server nicht erreichen. GitHub Pages führt den Node-Server für Konten und Campus nicht aus. Für öffentliches Hosting des Servers fehlen TLS, Betriebsüberwachung, Backups und Datenschutzfreigabe.
