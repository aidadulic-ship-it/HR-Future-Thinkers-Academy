import { readFileSync } from 'node:fs';
import { profiles as referenceProfiles } from './research-reference.mjs';

const inventory = JSON.parse(readFileSync(new URL('./data/skill-inventory.json', import.meta.url), 'utf8'));
const sourceCandidates = JSON.parse(readFileSync(new URL('./data/source-candidates.json', import.meta.url), 'utf8'));
const inherited = JSON.parse(readFileSync(new URL('./data/legacy-content.json', import.meta.url), 'utf8'));
export const phases = ['Explore', 'Challenge', 'Decide', 'Apply', 'Reflect', 'Demonstrate'];

const worldSeeds = [
  ['CW-01', 'Future Foresight', 'Veränderte Arbeitsmärkte und Fähigkeiten in nachvollziehbare Szenarien übersetzen.', 'horizon'],
  ['CW-02', 'AI & Human Collaboration', 'Aufgaben, Aufsicht und Verantwortung zwischen Menschen und KI bewusst gestalten.', 'orbit'],
  ['CW-03', 'Strategic HR & Organization', 'Skills, Talent und Organisationsdaten an realen Entscheidungen ausrichten.', 'grid'],
  ['CW-04', 'Critical Thinking & Unlearning', 'Annahmen prüfen, Evidenz bewerten und veraltete Routinen hinterfragen.', 'prism'],
  ['CW-05', 'Transformation & Influence', 'Veränderung durch Interessenklärung, Experimente und Wirkungsmessung führen.', 'signal'],
  ['CW-06', 'Future Decision Intelligence', 'Unsichere HR-Entscheidungen begründen, überprüfen und revidieren.', 'compass'],
];
const worlds = worldSeeds.map(([id, title, description, visual]) => ({ id, title, description, visual }));

const competencySeeds = [
  ['COMP-01', 'Zukunftssignale erkennen', 'benennt ein überprüfbares Signal'],
  ['COMP-02', 'Szenarien entwickeln', 'vergleicht mindestens zwei plausible Zukünfte'],
  ['COMP-03', 'KI-Risiken verstehen', 'erkennt einen relevanten Fehlermodus'],
  ['COMP-04', 'Menschliche Aufsicht gestalten', 'weist Entscheidung und Eingriffsmöglichkeit zu'],
  ['COMP-05', 'Skills strategisch planen', 'verbindet Aufgaben mit nachgewiesenen Kompetenzen'],
  ['COMP-06', 'Organisation diagnostizieren', 'prüft konkurrierende Ursachen'],
  ['COMP-07', 'HR-Daten interpretieren', 'nennt Nenner, Vergleich und Verzerrungsrisiko'],
  ['COMP-08', 'Evidenz bewerten', 'prüft Quelle, Design und Übertragbarkeit'],
  ['COMP-09', 'Annahmen hinterfragen', 'formuliert eine falsifizierbare Gegenhypothese'],
  ['COMP-10', 'Wirkung experimentell prüfen', 'definiert Vergleich, Messung und Stoppregel'],
  ['COMP-11', 'Stakeholder einbinden', 'macht Interessen und Zielkonflikte sichtbar'],
  ['COMP-12', 'Veränderung führen', 'plant beobachtbare Verhaltensänderung'],
  ['COMP-13', 'Entscheidungen dokumentieren', 'trennt Optionen, Gründe und Verantwortung'],
  ['COMP-14', 'Entscheidungen revidieren', 'definiert eine Auslöseschwelle für Kurswechsel'],
];
const competencies = competencySeeds.map(([id, title, indicator]) => ({
  id, title, indicator, worldId: ['CW-01','CW-01','CW-02','CW-02','CW-03','CW-03','CW-03','CW-04','CW-04','CW-05','CW-05','CW-05','CW-06','CW-06'][Number(id.slice(-2))-1],
  levels: [
    `Erkennt unter Anleitung, woran man sieht, dass jemand ${indicator}.`,
    `Beschreibt an einem Fall, wie man ${indicator}.`,
    `Zeigt selbstständig anhand einer Arbeitsprobe, dass sie oder er ${indicator}.`,
    `Überträgt die Arbeitsprobe auf einen neuen Kontext und begründet, wie man ${indicator}.`,
    `Prüft andere Arbeiten kritisch, verbessert die Methode und belegt, wie man ${indicator}.`,
  ],
}));

const sourceStatus = {
  'EVD-001': ['metadata_checked', 'CIPD-Factsheet; Veröffentlichungsdatum auf der Seite nicht eindeutig.', 'Praxisleitfaden, keine einzelne Wirksamkeitsstudie.'],
  'EVD-002': ['metadata_checked', 'NIST AI RMF 1.0, veröffentlicht 2023.', 'Freiwilliges Rahmenwerk; keine lokale Wirksamkeitsgarantie.'],
  'EVD-003': ['link_only', 'EUR-Lex-Seite war beim Abruf zugangsbeschränkt.', 'Rechtsanwendung und Stand fachjuristisch prüfen.'],
  'EVD-004': ['link_only', 'FAQ war beim Abruf nicht zugänglich.', 'FAQ ersetzt weder Gesetzestext noch rechtliche Prüfung.'],
  'EVD-005': ['metadata_checked', 'OECD-Publikationsseite mit DOI erreichbar.', 'Arbeitsmarktvergleich ist nicht automatisch lokale Prognose.'],
  'EVD-006': ['metadata_checked', 'OECD-Publikationsseite mit DOI erreichbar.', 'Kontext und Stichprobe vor Übertragung prüfen.'],
  'EVD-007': ['metadata_checked', 'WEF-Bericht vom 7. Januar 2025.', 'Befragung von Arbeitgebern; keine deterministische Prognose.'],
  'EVD-008': ['metadata_checked', 'OECD-Bericht vom 9. Juli 2025.', 'Länderbefunde müssen lokal eingeordnet werden.'],
  'EVD-009': ['metadata_checked', 'CIPD-Factsheet erreichbar; Datum nicht eindeutig.', 'Praxisleitfaden, keine kausale Wirkungsaussage.'],
  'EVD-010': ['unusable', 'Nur OECD-Startseite angegeben; kein identifizierbares Originalwerk.', 'Nicht als Beleg verwenden.'],
};
const evidence = sourceCandidates.map(item => ({
  id: item.id, publisher: item.publisher, title: item.title, url: item.candidate_original_url,
  date: null, type: 'Original- oder Herausgeberseite', status: sourceStatus[item.id][0],
  verification: sourceStatus[item.id][1], limitations: sourceStatus[item.id][2],
}));

const perspectiveSourceIds = new Map();
const perspectives = referenceProfiles.map((profile, index) => {
  let sourceId = perspectiveSourceIds.get(profile.source.url);
  if (!sourceId) {
    sourceId = `EVD-P${String(index + 1).padStart(2, '0')}`;
    perspectiveSourceIds.set(profile.source.url, sourceId);
    evidence.push({ id: sourceId, publisher: profile.source.type, title: profile.source.title, url: profile.source.url,
      date: String(profile.source.year), type: profile.source.type, status: 'metadata_checked',
      verification: `Bibliografische Angaben am 15.11.2026 auf Original- oder Herausgeberseite geprüft. Zugang: ${profile.source.access}`,
      limitations: profile.counterpoint });
  }
  return { id: `P-${String(index + 1).padStart(2, '0')}`, person: profile.name, topic: profile.topic,
    learningGoal: profile.learningGoal, counterposition: profile.counterpoint, sourceIds: [sourceId],
    video: profile.video, skillId: profile.skill, caseId: profile.caseId, caseQuestion: profile.caseQuestion,
    grillId: inherited.grills.find(item => item.person === profile.name || (profile.name === 'John W. Boudreau' && item.person === 'John Boudreau'))?.id ?? null };
});

// Sieben Skills basieren auf den verdichteten Modulen des Importpakets; 8–20 sind redaktionell rekonstruiert.
const skillDesigns = [
  ['Fluktuation steigt in einer fiktiven Abteilung; die Geschäftsführung fordert ein Bonusmodell.', ['Präzisiere die zu treffende Entscheidung und berechne die Fluktuation mit korrektem Nenner.', 'Prüfe Bonus, Führung, Schichtplan und Arbeitsmarkt als konkurrierende Erklärungen.', 'Wähle zwischen Bonuspilot, Prozessänderung und zusätzlicher Diagnose.', 'Definiere eine Vergleichsgruppe und einen 30-Tage-Indikator.', 'Nenne die stärkste Gegenposition zu deiner Empfehlung.', 'Formuliere ein Memo mit Quelle, Unsicherheit, Owner und Review.'], ['EVD-001']],
  ['Für 240 Beschäftigte ist eine pauschale zweistündige KI-Schulung vorgesehen.', ['Erfasse Rollen, genutzte KI-Systeme und mögliche Auswirkungen.', 'Prüfe, warum dieselbe Schulung für alle Rollen unzureichend sein könnte.', 'Wähle rollenspezifische Lernziele und menschliche Kontrollpunkte.', 'Plane eine Praxisaufgabe mit sicherem, synthetischem Material.', 'Prüfe Fehlanreize, Zugänglichkeit und Grenzen der Wirksamkeitsmessung.', 'Dokumentiere Verantwortlichkeiten und einen Transfercheck.'], ['EVD-003', 'EVD-004']],
  ['Ein fiktives Unternehmen mit 220 Beschäftigten besetzt nur 12 % seiner 18 offenen Rollen intern.', ['Definiere, welche Aufgaben und Skills tatsächlich knapp sind.', 'Prüfe, ob die interne Quote ein Skill- oder ein Mobilitätsproblem zeigt.', 'Vergleiche Skills-Pilot, Taxonomie und externe Suche.', 'Teste einen begrenzten internen Matching-Prozess.', 'Nenne Fairnessrisiken und eine alternative Erklärung.', 'Berichte Besetzungsqualität, Teilnahme und Stop-Kriterien.'], ['EVD-005', 'EVD-006']],
  ['Ein fiktives Unternehmen mit 480 Beschäftigten erwartet 65 Pensionierungen bis 2030.', ['Trenne bekannte Altersstruktur von unsicherem zukünftigen Bedarf.', 'Entwirf Automatisierungs-, Engpass- und Disruptionsszenario.', 'Wähle robuste Maßnahmen über mindestens zwei Szenarien.', 'Definiere Frühindikatoren und Verantwortliche.', 'Suche das Signal, das deine bevorzugte Prognose widerlegt.', 'Erstelle Szenariokarte mit Review-Termin.'], ['EVD-007', 'EVD-008']],
  ['Ein Anbieter verspricht 60 % Zeitersparnis durch KI-Ranking von Bewerbungen; die Zahl ist fiktiv.', ['Beschreibe Entscheidung, Systemgrenze und betroffene Personen.', 'Prüfe Anbieterbehauptung, Rechtsklassifikation und Auswahlfehler.', 'Wähle Freigabe, begrenzten Test oder Verzicht.', 'Definiere menschliche Aufsicht, Beschwerdeweg und Stop-Regel.', 'Prüfe Fairness, Datenschutz und nicht gemessene Schäden.', 'Dokumentiere Verantwortliche und Nachweise für eine erneute Prüfung.'], ['EVD-002', 'EVD-003']],
  ['Ein fiktives Mitarbeitergesprächssystem erzeugt 840 Stunden Aufwand, aber nur 31 % positive Bewertungen.', ['Bestimme das Ziel des Gesprächssystems und die Qualität der Kennzahlen.', 'Vergleiche Abschaffung, Beibehaltung und experimentelle Anpassung.', 'Wähle eine reversible 90-Tage-Option.', 'Plane Vergleich, Nebenwirkungsmessung und Schutz von Beschäftigten.', 'Nenne den Befund, der deine Entscheidung umkehrt.', 'Formuliere einen Decision-Reversal-Plan mit Owner.'], ['EVD-001']],
  ['In einem fiktiven Betrieb mit 600 Beschäftigten blockieren Führungskräfte interne Mobilität.', ['Kartiere Interessen von Führung, Mitarbeitenden und Finance.', 'Prüfe Engpass, Anreiz und Macht als konkurrierende Ursachen.', 'Vergleiche Mandat, Kampagne und Interessenanalyse.', 'Führe einen begrenzten Test mit zwei Bereichen durch.', 'Prüfe unbeabsichtigten Talentverlust und Fairness.', 'Miss tatsächliche Mobilitätsentscheidungen nach 90 Tagen.'], ['EVD-009']],
  ['Eine HR-Leitung muss auf zwei plausible Technologiewechsel reagieren.', ['Sammle drei belastbare Signale mit Datum und Quelle.', 'Trenne Trend, Hype und lokales Frühzeichen.', 'Entwirf zwei unterschiedliche, aber plausible Szenarien.', 'Wähle eine heute sinnvolle No-Regret-Maßnahme.', 'Prüfe den Einfluss einer gegenteiligen Entwicklung.', 'Setze einen Termin zur Aktualisierung der Szenarien.'], ['EVD-007']],
  ['Eine fiktive Lernabteilung erwägt KI für Feedback zu Führungstrainings.', ['Beschreibe Lernziel und beobachtbares Zielverhalten.', 'Prüfe, wo KI-Feedback den Lernprozess verzerren könnte.', 'Wähle eine Aufgabe mit menschlichem Erstversuch.', 'Erstelle eine Feedbackrubrik und einen geschützten Testfall.', 'Prüfe 48-Stunden-Transfer statt nur Zufriedenheit.', 'Dokumentiere Lernprodukt, Verbesserung und Review.'], ['EVD-002']],
  ['Ein People-Analytics-Team will Fluktuation vorhersagen.', ['Bestimme die konkrete Entscheidung und minimal nötige Daten.', 'Prüfe Selektionsbias, Datenqualität und Alternativerklärungen.', 'Vergleiche Vorhersage, Ursachenanalyse und Prozessänderung.', 'Plane einen Test mit klarer Berechtigungsgrenze.', 'Prüfe Datenschutz- und Fairnessfolgen.', 'Berichte nur begrenzte, nachvollziehbare Schlussfolgerungen.'], ['EVD-001']],
  ['Eine Organisation möchte eine Skills-Taxonomie für 90 Rollen erstellen.', ['Definiere die Entscheidungen, die eine Taxonomie unterstützen soll.', 'Prüfe, ob Rollenbeschreibungen reale Aufgaben abbilden.', 'Wähle eine kleine Taxonomie für drei Rollenfamilien.', 'Validiere Begriffe mit Beschäftigten und Führung.', 'Suche fehlende oder irreführende Kategorien.', 'Dokumentiere Version, Verantwortliche und Aktualisierung.'], ['EVD-005']],
  ['Ein fiktiver interner Talentmarkt erhält nur wenige Bewerbungen.', ['Ermittle Sichtbarkeit, Zugang und bisherige interne Wechsel.', 'Prüfe Hürden durch Führung, Kriterien und Zeitfenster.', 'Vergleiche Matching, offene Projekte und direkte Ansprache.', 'Teste einen transparenten Zugang für zwei Teams.', 'Prüfe Fairness und mögliche Benachteiligung.', 'Miss sinnvolle Matches und tatsächliche Entwicklung.'], ['EVD-006']],
  ['Ein HR-Team will informelle Zusammenarbeit zwischen Abteilungen sichtbar machen.', ['Definiere eine zulässige Entscheidungsfrage ohne Personenscoring.', 'Prüfe, welche Netzwerkdaten wirklich benötigt werden.', 'Vergleiche Befragung, Prozessbeobachtung und vorhandene Metadaten.', 'Plane einen freiwilligen, datensparsamen Pilot.', 'Prüfe Re-Identifikation und Machtfolgen.', 'Berichte Muster nur auf geeigneter Aggregationsebene.'], ['EVD-001']],
  ['Die Geschäftsführung verlangt einen Business Case für eine HR-Maßnahme.', ['Formuliere Entscheidung, Zielgruppe und Kosten des Nichtstuns.', 'Prüfe Baseline, Wirkungsannahmen und Unsicherheiten.', 'Vergleiche drei Optionen einschließlich eines kleinen Tests.', 'Schätze Szenarien ohne Scheingenauigkeit.', 'Prüfe Gegenargumente von Finance und Betroffenen.', 'Erstelle eine beschlussfähige Vorlage mit Review.'], ['EVD-001']],
  ['Ein fiktives Team nutzt eine neue Feedbackroutine, aber Verhalten ändert sich kaum.', ['Bestimme das gewünschte Verhalten und die Ausgangslage.', 'Prüfe Führung, Arbeitslast und Messfehler als Alternativen.', 'Wähle einen reversiblen Verhaltenstest.', 'Plane Vergleich und Beobachtung ohne Überwachung.', 'Suche Nebenwirkungen und fehlende Stimmen.', 'Berichte nach 30 Tagen: fortsetzen, ändern oder stoppen.'], ['EVD-009']],
  ['Eine Transformation scheitert trotz positiver Vorstandsbeschlüsse.', ['Kartiere formale und informelle Entscheidungsrechte.', 'Prüfe Interessen, Verluste und unklare Anreize.', 'Wähle zwei Stakeholder-Gespräche vor einer Kampagne.', 'Teste eine gemeinsame Maßnahme mit sichtbarem Nutzen.', 'Prüfe, wer durch die Veränderung Nachteile trägt.', 'Dokumentiere Zugeständnisse, Owner und Review.'], ['EVD-009']],
  ['Ein fiktives Auswahlverfahren bewertet selbstsichere Auftritte besonders hoch.', ['Definiere tätigkeitsbezogene Anforderungen und Belege.', 'Prüfe, ob Eindruckskriterien systematisch verzerren.', 'Wähle strukturierte Fragen und ein Bewertungsraster.', 'Teste Inter-Rater-Übereinstimmung mit synthetischen Profilen.', 'Prüfe Fairness und alternative Erklärungen.', 'Dokumentiere Entscheidung und Korrekturweg.'], ['EVD-001']],
  ['Zwei Veröffentlichungen kommen zu unterschiedlichen Aussagen über hybride Arbeit.', ['Formuliere die konkrete Forschungsfrage.', 'Vergleiche Population, Methode, Zeitpunkt und Messgröße.', 'Wähle, welche Aussage für den lokalen Fall tragfähig ist.', 'Schreibe eine Evidence Card mit Gegenbefund.', 'Prüfe den Geltungsbereich beider Quellen.', 'Formuliere ein Urteil mit Unsicherheit und nächster Prüfung.'], ['EVD-001']],
  ['Ein Pilot wirkt erfolgreich, aber neue Daten widersprechen der ursprünglichen Empfehlung.', ['Rekonstruiere Ausgangsannahmen und Entscheidung.', 'Prüfe Datenqualität und mögliche Verzögerungseffekte.', 'Definiere eine Schwelle für Kurswechsel.', 'Vergleiche Fortsetzung, Anpassung und Stopp.', 'Prüfe Sunk-Cost-Druck und Stakeholder-Folgen.', 'Schreibe ein Reversal-Memo mit 30/90-Tage-Review.'], ['EVD-001']],
  ['Ein HR-Gremium muss zwischen drei Investitionen wählen.', ['Definiere Entscheidung und Adressat:innen in einem Satz.', 'Prüfe die tragenden Zahlen und ihre Herkunft.', 'Vergleiche die Optionen anhand gewichteter Kriterien.', 'Erstelle eine klare Empfehlung mit Trade-offs.', 'Prüfe die stärkste Gegenrede und ihre Bedingung.', 'Präsentiere eine Ein-Seiten-Entscheidungsvorlage.'], ['EVD-001']],
];

const skills = inventory.map((item, index) => {
  const [scenario, steps, evidenceIds] = skillDesigns[index];
  const constructed = index >= 7;
  const caseLinks = ['CASE-002','CASE-009','CASE-007','CASE-025','CASE-010','CASE-019','CASE-016','CASE-025','CASE-006','CASE-002','CASE-011','CASE-012','CASE-013','CASE-014','CASE-015','CASE-016','CASE-017','CASE-018','CASE-019','CASE-020'];
  const promptLinks = [
    ['evidence-check','hr-decision-lab'],['safe-ai-hr','human-ai-work-design'],['workforce-skills-planning','strategic-hr-value'],
    ['workforce-skills-planning'],['safe-ai-hr','fair-selection'],['grill-me','hr-experiment'],['stakeholder-negotiation','change-in-practice'],
    ['workforce-skills-planning'],['learning-design','learning-review'],['hr-data-reasoning','organization-diagnosis'],
    ['workforce-skills-planning'],['strategic-hr-value'],['organization-diagnosis'],['executive-hr-brief'],
    ['learning-review'],['stakeholder-negotiation'],['fair-selection'],['evidence-check'],['executive-hr-brief'],['hr-decision-lab','executive-hr-brief'],
  ];
  return {
    id: item.id, title: item.title, worldId: item.world_id, status: constructed ? 'redaktionell rekonstruiert' : 'aus verdichtetem Konzept rekonstruiert',
    scenario, steps, evidenceIds, caseId: caseLinks[index],
    relatedPromptIds: promptLinks[index].map(slug => inherited.prompts.find(prompt => prompt.slug === slug)?.id).filter(Boolean),
    competencyId: competencies.find(x => x.worldId === item.world_id).id,
    rubric: `Eine starke Arbeit zu ${item.title} trennt Fakt und Annahme, begründet eine Alternative, nennt ein Risiko und definiert ein beobachtbares Review.`,
    levels: {
      foundation: { task: `Bearbeite den synthetischen Fall unter Anleitung: ${scenario}`, feedback: `Prüfe zunächst die korrekte Problemdefinition und eine nachvollziehbare Quelle für ${item.title}.` },
      executive: { task: `Entscheide als verantwortliche HR-Leitung unter Unsicherheit: ${scenario} Gewichte drei Optionen und formuliere ein umkehrbares Mandat.`, feedback: `Prüfe den stärksten Gegenbefund, Folgen für Betroffene und eine verbindliche 90-Tage-Entscheidungsregel.` },
    },
  };
});

const caseSeeds = [
  ['Weiterbildungsbudget', 'Ein fiktives Unternehmen mit 180 Beschäftigten hat 120.000 € für Weiterbildung. 50 Personen melden eine Datenkompetenzlücke, 24 übernehmen neue Führungsrollen.', '120.000 € Budget · 50 Datenrollen · 24 neue Führungskräfte', ['Datenprogramm priorisieren', 'Führung zuerst entwickeln', 'Budget gestaffelt mit Pilot verteilen'], 'Meldungen über Bedarf sind keine Messung des Lerntransfers.', 'Falsche Priorität bindet Mittel ohne Verhaltensänderung.', 'Beobachtete Anwendung nach 30 Tagen', 'Umschichten, wenn Transfer unter vorab vereinbarter Schwelle bleibt'],
  ['Fluktuation im Schichtteam', 'In einer fiktiven Abteilung verlassen 12 von durchschnittlich 80 Personen das Unternehmen; in der Vergleichsabteilung sind es 5 von 70. Schichtplan und Führung änderten sich zugleich.', '12/80 vs. 5/70 · sechs Monate · 7 Austrittsinterviews', ['Bonus testen', 'Schichtplanbarkeit testen', 'Erst Ursachen und Daten prüfen'], 'Wer antwortet, könnte sich systematisch von Nichtantwortenden unterscheiden.', 'Eine Bonuslösung verdeckt möglicherweise Arbeitsbedingungen.', 'Fluktuationsquote und Planbarkeit nach 90 Tagen', 'Abbrechen, wenn Belastung trotz Bonus steigt'],
  ['Lange Besetzungszeit', 'Ein fiktives Recruiting-Team misst 74 Tage bis zur Zusage. Freigabe, Erstkontakt und Interviewkoordination haben unterschiedliche Fallzahlen und dürfen nicht blind addiert werden.', 'Median 74 Tage · Koordination 23 Tage', ['Interviewfenster bündeln', 'Freigabekette verkürzen', 'Zuerst saubere Phasendaten erheben'], 'Die längste Phase ist nicht zwingend der größte steuerbare Hebel.', 'Beschleunigung kann Auswahlqualität senken.', 'Gesamtzeit plus Qualitäts- und Fairnessindikator', 'Zurücknehmen, falls Auslassungen oder Beschwerden zunehmen'],
  ['KI im HR-Service', 'Ein fiktiver HR-Service bearbeitet 800 Anfragen monatlich. 45 % betreffen Standardauskünfte, 15 % sensible Einzelfälle; vier von 60 synthetischen KI-Antworten enthalten falsche Richtlinien.', '800 Anfragen/Monat · 4/60 Fehler im Test', ['Nur Entwürfe mit menschlicher Freigabe', 'Suche und Vorlagen verbessern', 'Automatische Antwort für Standardfälle'], 'Gute Durchschnittsleistung schützt nicht vor kritischen Einzelfehlern.', 'Falsche Richtlinie kann Beschäftigte direkt schädigen.', 'Kritische Fehler pro 100 geprüfte Antworten', 'Pilot stoppen bei einem nicht abgefangenen kritischen Fehler'],
  ['Speak-up und Führung', 'In einem fiktiven Team melden 8 von 25 Personen Bedenken früh. Führung hält Meetings für offen; Mitarbeitende berichten über abwertende Reaktionen auf Fehler.', '8/25 frühe Meldungen · 56 % Rücklauf', ['Moderierte Fehlerrückschau', 'Anonyme Kanäle und Gesprächsregeln', 'Erst Schutz und Erhebung verbessern'], 'Rücklauf und Hierarchie können das Bild verzerren.', 'Eine Sichtbarkeitsmaßnahme kann Sprechende gefährden.', 'Frühe Meldungen und beobachtbare Reaktion', 'Stoppen, wenn Repressalien oder Rückzug sichtbar werden'],
  ['Transfer nach Führungstraining', 'Von 24 Teilnehmenden antworten 18; 14 berichten mehr Feedbackgespräche. Im Vergleichsteam ändern sich gleichzeitig Ziele und Personal.', '18/24 Antworten · 14 Selbstberichte', ['Praxisaufgaben nachschärfen', 'Beobachtung einführen', 'Training zunächst unverändert fortsetzen'], 'Selbstberichte motivierter Personen beweisen keinen Transfer.', 'Wirkung wird behauptet, ohne Verhalten zu beobachten.', 'Beobachtete Feedbackqualität nach 30 Tagen', 'Ändern, wenn Beobachtung und Selbstbericht auseinanderfallen'],
  ['Skills-basierte Planung', 'Ein fiktives Unternehmen braucht je nach Szenario 4, 8 oder 12 zusätzliche Fachkräfte für Automatisierung. Vier interne Kandidat:innen könnten in sechs Monaten qualifiziert werden.', 'Bedarf 4/8/12 · 4 interne Kandidat:innen', ['Vier intern entwickeln', 'Gezielt extern einstellen', 'Entwicklung mit externer Reserve kombinieren'], 'Bedarfsschätzungen können durch Automatisierung selbst verändert werden.', 'Zu frühe Rekrutierung oder zu späte Entwicklung.', 'Besetzte Aufgaben statt bloße Stellenzahl', 'Strategie wechseln, wenn Frühindikator den Hochbedarf zeigt'],
  ['HR-Technologieauswahl', 'Ein fiktives Unternehmen vergleicht drei People-Analytics-Produkte. Anbieter zeigen Demos, aber keine überprüften Nachweise für den eigenen Datenbestand.', '3 Anbieter · 2 Wochen Pilotfenster', ['Datensparsame Teststellung', 'Beschaffung vertagen', 'Prozess ohne neues Tool verbessern'], 'Marktpräsenz ist kein Wirksamkeitsbeleg.', 'Lock-in und Datenschutzrisiken.', 'Nutzbare Entscheidungen und Fehler im Pilot', 'Nicht beschaffen, wenn Nachweise oder Exit-Plan fehlen'],
  ['KI-Schulung nach Rolle', 'Für 240 fiktive Beschäftigte ist eine gemeinsame zweistündige KI-Schulung geplant. Tätigkeiten, Systeme und Risiken unterscheiden sich deutlich.', '240 Personen · 2 Stunden geplant', ['Rollenpfade entwickeln', 'Basisschulung plus Praxis', 'Einheitsschulung beibehalten'], 'Teilnahme sagt wenig über sichere Anwendung.', 'Kritische Rollen werden unterversorgt.', 'Rollenspezifische Anwendung im 30-Tage-Test', 'Pfad ändern, wenn Fehler trotz Teilnahme bleiben'],
  ['Bewerberranking', 'Ein Anbieter verspricht einem fiktiven Recruiting-Team 60 % Zeitersparnis durch KI-Ranking. Eigene Validierungsdaten und Rechtsbewertung fehlen.', '60 % Anbieterbehauptung · keine lokale Validierung', ['Ranking zurückstellen', 'Synthetischen Prüftest starten', 'Zusammenfassungen mit Prüfung erproben'], 'Zeitersparnis allein misst keine Auswahlqualität.', 'Fehlerhafte oder unfaire Auswahl.', 'Auslassungen, Beschwerden, Gesamtzeit', 'Kein Live-Einsatz ohne Freigabe und belastbare Prüfung'],
  ['Skill-Taxonomie', 'Eine fiktive Organisation will 90 Rollen mit einer neuen Skill-Taxonomie beschreiben. Die Tätigkeitsprofile sind unterschiedlich aktuell.', '90 Rollen · drei Bereiche als Pilot', ['Gesamttaxonomie sofort', 'Drei Rollenfamilien validieren', 'Bestehende Stellenprofile zuerst korrigieren'], 'Beschreibungen können tatsächliche Arbeit verfehlen.', 'Falsche Kategorien beeinflussen Chancen.', 'Übereinstimmung mit beobachteter Arbeit', 'Taxonomie zurückziehen, wenn Rollen nicht passen'],
  ['Interner Talentmarkt', 'Ein interner Talentmarkt wird in einem fiktiven Unternehmen kaum genutzt. Führungskräfte halten Beschäftigte zurück, und Projekte sind nicht offen ausgeschrieben.', 'Nur 12 % interne Besetzungen', ['Transparente Projektbörse', 'Führungskräfteanreize ändern', 'Erst Ursacheninterviews führen'], 'Niedrige Nutzung kann am Angebot statt am Matching liegen.', 'Zugang wird für einzelne Gruppen unfair.', 'Reale interne Wechsel und Zufriedenheit', 'Anpassung bei ungleicher Teilnahme'],
  ['Organisationsnetzwerk', 'Ein fiktives HR-Team möchte Zusammenarbeit zwischen fünf Abteilungen analysieren. Ein Anbieter schlägt Kommunikationsmetadaten aller Beschäftigten vor.', '5 Abteilungen · keine Einwilligung', ['Freiwillige Befragung', 'Aggregierte Prozessdaten', 'Metadatensammlung vertagen'], 'Sichtbare Kontakte sind nicht gleich hilfreiche Zusammenarbeit.', 'Re-Identifikation und Überwachung.', 'Verbesserte Übergaben ohne personenbezogenes Scoring', 'Abbruch bei Re-Identifikationsrisiko'],
  ['HR Business Case', 'Die Geschäftsführung erwartet von einem fiktiven HR-Team einen Business Case für ein Lernprogramm. Bisher liegen nur Teilnahmezahlen vor.', '400 Teilnahmen · keine Baseline', ['Kleinen Wirkungstest finanzieren', 'Programm sofort skalieren', 'Alternativen im Arbeitsprozess prüfen'], 'Teilnahme ist kein Wirkungsnachweis.', 'Mittel werden durch Scheingenauigkeit gebunden.', 'Beobachtbares Zielverhalten und Kosten', 'Skalierung stoppen ohne belastbare Wirkung'],
  ['Feedbackroutine', 'Ein fiktives Team führt eine neue Feedbackroutine ein. Nach sechs Wochen berichten viele Teilnehmende Zufriedenheit, aber Arbeitsverhalten bleibt unklar.', '6 Wochen · keine Verhaltensbeobachtung', ['Beobachtbare Praxisaufgabe', 'Format unverändert lassen', 'Führung und Arbeitslast prüfen'], 'Zufriedenheit kann steigen ohne Transfer.', 'Weitere Trainings statt Ursachenlösung.', 'Anwendung im Arbeitsalltag nach 30 Tagen', 'Routine ändern, falls Verhalten ausbleibt'],
  ['Mobilität ohne Mandat', 'In einem fiktiven Unternehmen unterstützen Vorstände interne Mobilität, aber Bereichsleitungen verweigern Freigaben aus Sorge um Schlüsselpersonen.', '600 Beschäftigte · wenige Freigaben', ['Zentrales Mandat', 'Interessenanalyse', 'Kommunikationskampagne'], 'Ein Mandat löst Ressourcenkonflikte nicht automatisch.', 'Talentverlust in einzelnen Teams.', 'Tatsächliche Freigaben und Nachbesetzung', 'Ansatz revidieren bei blockierten Übergängen'],
  ['Fairness im Interview', 'Eine fiktive Auswahlkommission bewertet Selbstsicherheit hoch. Tätigkeitsbezogene Kriterien wurden noch nicht operationalisiert.', '5 Interviews · 3 Bewertende', ['Strukturiertes Raster', 'Unstrukturierte Interviews', 'Arbeitsprobe ergänzen'], 'Selbstsicherheit kann mit Kompetenz verwechselt werden.', 'Benachteiligung geeigneter Kandidat:innen.', 'Übereinstimmung und Tätigkeitsbezug', 'Raster ändern, wenn es relevante Leistung nicht erfasst'],
  ['Widersprüchliche Forschung', 'Zwei fiktiv ausgewählte Publikationen zu hybrider Arbeit berichten unterschiedliche Wirkungen. Zielgruppen und Messzeiträume unterscheiden sich.', '2 Studien · unterschiedliche Populationen', ['Eine Studie bevorzugen', 'Kontextabhängige Synthese', 'Lokalen Test planen'], 'Ein Mittelwert kann Unterschiede verdecken.', 'Übertragung auf ungeeignete Tätigkeiten.', 'Passung von Population und Outcome', 'Urteil revidieren bei neuem Gegenbefund'],
  ['Entscheidungsumkehr', 'Ein fiktiver KI-Pilot senkt Bearbeitungszeit, doch im zweiten Monat steigen übersehene Qualifikationen. Die ursprüngliche Freigabe war an eine Stoppregel gebunden.', 'Zeit −20 % · Auslassungen +5 Fälle', ['Pilot stoppen', 'Prüfung verschärfen', 'Unverändert fortsetzen'], 'Eine Zeitersparnis kann den Qualitätsverlust verdecken.', 'Fehler werden nach Freigabe normalisiert.', 'Kritische Auslassungen und Gesamtzeit', 'Sofort stoppen bei überschrittener Schwelle'],
  ['Executive Storytelling', 'Ein fiktives HR-Gremium muss zwischen drei Investitionen entscheiden. Die Präsentation enthält viele Folien, aber keine klare Entscheidungsbitte.', '3 Optionen · 20 Minuten Gremium', ['Ein-Seiten-Memo', 'Weitere Daten sammeln', 'Bestehende Präsentation ergänzen'], 'Eine gute Geschichte ersetzt keine gute Evidenz.', 'Überzeugung überdeckt Zielkonflikte.', 'Entscheidung, Gründe und Review dokumentiert', 'Empfehlung ändern bei Gegenbeleg'],
  ['Entgelttransparenz', 'Ein fiktiver Betrieb entdeckt große Unterschiede zwischen ähnlichen Rollen. Gründe und Datenqualität sind noch ungeklärt.', '120 Rollenprofile · 3 Datenquellen', ['Daten bereinigen', 'Sofort pauschal anpassen', 'Rechtlich geprüften Maßnahmenplan starten'], 'Rollenbezeichnungen allein zeigen keine Vergleichbarkeit.', 'Ungerechte Korrektur oder Untätigkeit.', 'Bereinigte Differenzen und Beschwerdeweg', 'Plan korrigieren bei neuen Vergleichsdaten'],
  ['Hybride Zusammenarbeit', 'In einem fiktiven Team mit Präsenz- und Remote-Rollen erhalten entfernte Personen seltener wichtige Informationen.', '2 Standorte · 4 Wochen Beobachtung', ['Asynchrone Übergabe', 'Alle ins Büro holen', 'Meetingregeln testen'], 'Informationslücken können auch aus Rollenverteilung stammen.', 'Ausschluss und Mehrbelastung.', 'Gleichwertiger Zugang zu Entscheidungen', 'Regeln ändern, wenn Beteiligung sinkt'],
  ['Onboarding-Wissen', 'Ein fiktives Team verliert in sechs Monaten drei erfahrene Personen. Neue Kolleg:innen finden wichtige Prozessentscheidungen nicht.', '3 Abgänge · 6 Monate', ['Übergabekarten', 'Mentoring', 'Dokumentensuche verbessern'], 'Mehr Dokumente lösen veraltetes Wissen nicht.', 'Fehler im Betrieb und Überlastung.', 'Zeit bis selbstständige Bearbeitung', 'Intervention ändern, wenn Wissen nicht genutzt wird'],
  ['Krisenkommunikation', 'Ein fiktiver Systemausfall verzögert Gehaltsabrechnungen. HR, IT und Führung geben widersprüchliche Informationen aus.', '48 Stunden Ausfall · 3 Kommunikationskanäle', ['Zentrale Lageinformation', 'Einzelantworten durch HR', 'Warten auf technische Lösung'], 'Schnelligkeit ohne verlässliche Fakten kann Vertrauen schädigen.', 'Fehlinformation und Datenschutz.', 'Korrekturen, Erreichbarkeit und Vertrauen', 'Kommunikationsweg ändern bei ungesicherten Aussagen'],
  ['Nachfolgeplanung', 'Ein fiktiver Betrieb hat für kritische Rollen nur informelle Nachfolgeannahmen. Demografische Daten zeigen mögliche Lücken.', '22 % kritische Rollen · 65 Pensionierungen', ['Interne Entwicklung', 'Externe Suche', 'Aufgaben neu gestalten'], 'Eine nominierte Nachfolge ist noch keine belegte Kompetenz.', 'Engpass und unfaire Chancen.', 'Nachgewiesene Einsatzfähigkeit', 'Plan ändern bei veränderten Frühindikatoren'],
];
const deepFields = [
  ['People Development, Finance, Beschäftigtenvertretung', 'Skill-Baseline, Kurskosten, Transferdaten', 'Kosten, Fairness, beobachtbarer Transfer'],
  ['HR Analytics, Schichtteam, Führung', 'Zeitverlauf, Schichtpläne, Rücklauf', 'Korrekte Quoten, Gegenhypothesen, Schutz'],
  ['Recruiting, Fachbereich, Betriebsrat', 'Phasenstempel, Fallzahlen, Qualitätsdaten', 'Engpasslogik, Qualität, Fairness'],
  ['HR Service, IT, Datenschutz', 'Aktuelle Richtlinien, Fehlerprotokoll', 'Aufgabentrennung, Stop-Regel, Quellen'],
  ['Team, Führung, Moderation', 'Originalforschung, Beobachtung, Rücklauf', 'Keine Personendiagnose, sichere Rückmeldung'],
  ['Learning, Teilnehmende, Führung', 'Baseline, Arbeitsbeobachtung, Vergleich', 'Transfer statt Teilnahme, Alternativen'],
  ['Workforce Planning, Operations, Finance', 'Szenarien, Skill-Nachweise, Einarbeitung', 'Robustheit, Trigger, Kosten'],
  ['HR Technology, Einkauf, Datenschutz', 'Testkriterien, Verträge, Exit-Plan', 'Nachweis, Datensparsamkeit, Lock-in'],
];
const cases = caseSeeds.map(([title, scenario, metrics, options, counterpoint, risk, measure, reversal], index) => ({
  id: `CASE-${String(index + 1).padStart(3, '0')}`, title, scenario, metrics, options,
  counterpoint, risk, measure, reversal, synthetic: true, deep: index < 8,
  roles: index < 8 ? deepFields[index][0] : null,
  evidenceNeed: index < 8 ? deepFields[index][1] : null,
  rubric: index < 8 ? deepFields[index][2] : 'Evidenz, Gegenposition, Verantwortung und Review',
  reviewDays: index < 8 ? 90 : 30,
}));
for (const item of cases) item.originalCase = inherited.cases.find(original => original.id === item.id) ?? null;

const gameQuestions = skills.flatMap((skill, index) => [0, 2, 4].map((stepIndex, variant) => ({
  id: `GAME-${String(index * 3 + variant + 1).padStart(3, '0')}`,
  level: Math.floor((index * 3 + variant) / 12) + 1,
  skillId: skill.id,
  question: skill.steps[stepIndex],
  hint: skill.rubric,
})));
const assessment = [...skills.slice(0, 20).map((skill, index) => ({ id: `ASM-${String(index + 1).padStart(2, '0')}`, skillId: skill.id, prompt: skill.steps[5] })),
  ...cases.slice(0, 4).map((item, index) => ({ id: `ASM-${String(index + 21).padStart(2, '0')}`, caseId: item.id, prompt: `Welche Evidenz würde deine Entscheidung im Fall „${item.title}“ umkehren?` }))];
const crises = [
  { id: 'CRISIS-01', title: 'KI-Ranking führt zu Beschwerden', phases: [
    ['Meldung', 'Mehrere Bewerber:innen melden eine unerklärte Ablehnung.', ['Einsatz pausieren und Fälle sichern', 'Beschwerden ignorieren']],
    ['Prüfung', 'Ein Anbieter verweist nur auf aggregierte Genauigkeit.', ['Originaldaten und Fehlerwege prüfen', 'Anbieterzahl ungeprüft übernehmen']],
    ['Entscheidung', 'Die Auswahlleitung braucht heute eine Entscheidung.', ['Menschliche Prüfung und Korrekturweg festlegen', 'Ranking ohne Einspruch fortsetzen']],
    ['Review', 'Nach 30 Tagen liegen neue Fehlerdaten vor.', ['Stop-Regel gegen Daten prüfen', 'Zeitgewinn allein bewerten']],
  ] },
  { id: 'CRISIS-02', title: 'Schichtkonflikt und Fluktuation', phases: [
    ['Meldung', 'Ein Schichtteam meldet Überlastung und Abgänge.', ['Betroffene geschützt anhören', 'Sofort Bonus ankündigen']],
    ['Prüfung', 'Austrittsdaten haben niedrigen Rücklauf.', ['Schicht- und Vergleichsdaten prüfen', 'Einzelstimmen verallgemeinern']],
    ['Entscheidung', 'Die Geschäftsführung fordert eine schnelle Maßnahme.', ['Reversiblen Planbarkeitstest starten', 'Ohne Baseline skalieren']],
    ['Review', 'Nach 90 Tagen verbessert sich Planbarkeit, nicht Fluktuation.', ['Erklärung und Zeitraum neu prüfen', 'Wirkung behaupten']],
  ] },
  { id: 'CRISIS-03', title: 'Fehlerhafte HR-Service-Antwort', phases: [
    ['Meldung', 'Ein KI-Assistent nennt eine falsche interne Richtlinie.', ['Betroffene informieren und Antwort stoppen', 'Fehler verschweigen']],
    ['Prüfung', 'Vier weitere Antworten könnten ähnlich betroffen sein.', ['Stichprobe und Quellen prüfen', 'Nur die gemeldete Antwort korrigieren']],
    ['Entscheidung', 'Das Serviceteam will den Assistenten weiter nutzen.', ['Freigabeprozess begrenzen', 'Vollautomatisch weiterlaufen lassen']],
    ['Review', 'Nach 30 Tagen stehen neue Prüfprotokolle bereit.', ['Kritische Fehler und Gesamtaufwand vergleichen', 'Nur Nutzungszahlen berichten']],
  ] },
];

export const catalog = { worlds, competencies, evidence, perspectives, skills, cases, gameQuestions, assessment, crises, phases,
  prompts: inherited.prompts, grills: inherited.grills, teaching: inherited.teaching, workbench: inherited.workbench,
  version: 2, sourceDate: '2026-11-15' };
