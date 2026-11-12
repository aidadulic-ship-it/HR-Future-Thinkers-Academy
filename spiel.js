/* HR-Mastermind · Das Spiel der HR Future Thinkers Academy, Teil der Academy-Seite. Alles lokal, keine Speicherung. */
(() => {

const PROMPTS = /*PROMPTS*/{};

const LEVEL_XP = 250;
const SPEED_SECONDS = 20;
const FINAL_SECONDS = 15;
const PRO = { target: 500, seconds: 12, sureBonus: 50, surePenalty: 50 };
const RANKS = ['HR Explorer', 'Assumption Hunter', 'Evidence Detective', 'Decision Architect', 'Reflective Leader'];
const FINAL_TITLE = 'HR-Mastermind';

const SKILL_TITLES = {
  'human-ai-work-design': 'Arbeit zwischen Mensch und KI gestalten',
  'safe-ai-hr': 'KI in HR verantwortungsvoll einsetzen',
  'grill-me': 'Annahmen kritisch hinterfragen',
  'hr-experiment': 'HR-Maßnahmen experimentell testen',
  'hr-data-reasoning': 'HR-Daten richtig interpretieren',
  'organization-diagnosis': 'Organisationsprobleme analysieren',
  'hr-decision-lab': 'Fundierte HR-Entscheidungen',
  'executive-hr-brief': 'Entscheidungsvorlagen für Führungsgremien',
  'learning-review': 'Lerntransfer überprüfen',
  'learning-design': 'Lernangebote entwickeln',
};

const LEVELS = [
  {
    title: 'Entdecken', skill: 'human-ai-work-design', shows: 'Aufgaben zerlegen und klug zwischen Mensch und KI verteilen',
    mission: 'Bei der Personalabteilung gehen jeden Monat viele Fragen von Beschäftigten ein. Rund 360 davon sind Routinefragen, manche betreffen sehr persönliche Themen. Eine Software soll helfen, hat im Test aber etwa jede fünfzehnte Antwort falsch gegeben. Welche Akte passt?',
    facts: [['Anfragen pro Monat', '800'], ['davon Routinefragen', '45 %'], ['davon persönliche Themen', '15 %'], ['falsche Antworten im Test', '4 von 60']],
    caseTitle: 'KI im HR-Service',
    cases: [
      { title: 'Auswahl einer HR-Technologie', teaser: 'Angebot A 42.000 €, Angebot B 55.000 € pro Jahr' },
      { title: 'KI im HR-Service', teaser: '800 Anfragen im Monat, 45 % Routine, 4 von 60 Testantworten falsch', correct: true },
      { title: 'Weiterbildungsbudget', teaser: '120.000 € Budget für 144.000 € Wünsche' },
      { title: 'Lange Besetzungszeiten', teaser: 'Typisch 74 Tage bis zur Zusage' },
    ],
    questions: [
      { text: 'Die Personalabteilung bekommt 800 Anfragen im Monat, 45 % davon sind Routinefragen. Wie viele Routinefragen sind das?', options: ['360', '120', '450', '45'], correct: 0, explain: '45 % von 800 sind 360. Bei diesen Fragen kann eine Software am ehesten entlasten.', hint: 'Rechne zuerst 10 % von 800 aus und nimm das Ergebnis dann mal 4,5.' },
      { text: 'Bei welchen Anfragen sollte immer ein Mensch antworten und nicht die Software?', options: ['Bei persönlichen Themen wie Krankheit oder Konflikten', 'Bei der Frage, wohin eine Anfrage weitergeleitet wird', 'Bei Routinefragen zu Urlaubsanspruch und Formularen', 'Beim Verschicken von Formularlinks und Fristen'], correct: 0, explain: 'Persönliche Themen brauchen Fingerspitzengefühl und Vertraulichkeit. Ein Fehler hätte hier die schwersten Folgen für einen einzelnen Menschen.', hint: 'Wo würde eine falsche Antwort einem einzelnen Menschen am meisten schaden?', skill: 'safe-ai-hr' },
      { text: 'Im Test gab die Software bei 4 von 60 Antworten falsche Auskünfte. Wie hoch ist die Fehlerquote ungefähr?', options: ['Rund 7 %', 'Rund 4 %', 'Rund 15 %', 'Unter 1 %'], correct: 0, explain: '4 geteilt durch 60 ergibt rund 6,7 %. Für Auskünfte zu Regeln und Ansprüchen ist das ohne Kontrolle zu viel.', hint: 'Teile die Zahl der falschen Antworten durch die Zahl aller Testantworten.' },
      { text: 'Wie sollte der erste Testbetrieb mit der Software ablaufen?', options: ['Die Software schlägt vor, eine Fachkraft prüft jede Antwort vor dem Versand', 'Die Software antwortet allein, Fehler werden gesammelt und später korrigiert', 'Die Software beantwortet auch persönliche Fälle, um dem Team Zeit zu sparen', 'Die Software startet sofort an allen Standorten, damit genug Daten entstehen'], correct: 0, explain: 'Die Software entlastet, ein Mensch prüft und gibt frei. So bleibt die Verantwortung klar, und Fehler erreichen niemanden.', hint: 'Wer sollte eine Antwort prüfen, bevor sie bei Beschäftigten ankommt?', skill: 'safe-ai-hr' },
      { text: 'Welche Methode aus der Academy hilft in diesem Fall als Erstes?', options: ['Aufgaben zwischen Mensch und KI aufteilen', 'Prüfen, ob ein Training wirkt', 'Die Kultur eines Teams untersuchen', 'Wissen von erfahrenen Kolleg:innen sichern'], correct: 0, explain: 'Zuerst wird geklärt, welche Aufgaben die Software übernimmt, wo sie nur unterstützt und was bei Menschen bleibt.', hint: 'Es geht darum, wer welche Aufgaben übernimmt: Mensch oder Software.' },
      { text: '15 % der 800 Anfragen betreffen persönliche Themen. Wie viele sind das pro Monat?', options: ['120', '80', '360', '150'], correct: 0, explain: '15 % von 800 sind 120. Diese Anfragen sollten direkt bei einer Fachkraft landen.', hint: 'Rechne 10 % und 5 % von 800 aus und zähle beides zusammen.' },
      { text: 'Welche Tätigkeit sollte das Team am besten ganz einstellen?', options: ['Private Antwortvorlagen ohne fachliche Prüfung', 'Rückruftermine mit Beschäftigten bestätigen', 'Antwortvorschläge der Software prüfen und freigeben', 'Persönliche Fälle direkt an Fachkräfte weitergeben'], correct: 0, explain: 'Ungeprüfte Vorlagen verbreiten leicht veraltete oder falsche Auskünfte. Sie abzuschaffen senkt das Risiko.', hint: 'Gesucht ist etwas, das eher schadet als nützt.' },
      { text: 'Woran erkennt man nach 30 Tagen, ob der Testbetrieb erfolgreich war?', options: ['Keine falsche Auskunft wurde an Beschäftigte verschickt', 'Die Software hat möglichst viele Antworten pro Stunde geschrieben', 'Die Antworten der Software klingen freundlich', 'Die IT-Abteilung hat sich nicht beschwert'], correct: 0, explain: 'Der Erfolg wird am größten Risiko gemessen, das der Test gezeigt hat: falsche Auskünfte.', hint: 'Welches Problem hat der Test gezeigt? Daran misst man den Erfolg.' },
      { text: 'Die Software soll die 360 Routinefragen im Monat vorbereiten. Jede spart rund 4 Minuten. Wie viele Stunden sind das etwa?', options: ['Rund 24 Stunden', 'Rund 6 Stunden', 'Rund 60 Stunden', 'Rund 144 Stunden'], correct: 0, explain: '360 mal 4 Minuten ergibt 1.440 Minuten, also rund 24 Stunden im Monat. Das ist Zeit, die das Team für schwierige Fälle gewinnt.', hint: 'Rechne zuerst alle Minuten aus und teile dann durch 60.' },
      { text: 'Eine Kollegin sagt: „Die Software ist schneller als wir, also kann sie auch Fragen zu Kündigungen beantworten.“ Was übersieht sie?', options: ['Dass Tempo nichts über die Folgen eines Fehlers sagt', 'Dass die Software in der Nacht gar nicht erreichbar ist', 'Dass Fragen zu Kündigungen eher selten vorkommen', 'Dass das Team dann weniger zu tun hätte'], correct: 0, explain: 'Bei Kündigungen kann eine falsche Auskunft Menschen Rechte kosten. Entscheidend ist, was ein Fehler anrichtet, nicht wie schnell die Antwort kommt.', hint: 'Überleg, was passiert, wenn genau bei so einer Frage die Antwort falsch ist.', skill: 'safe-ai-hr' },
      { text: 'Was sollten Beschäftigte wissen, wenn sie eine Antwort aus dem HR-Service lesen?', options: ['Dass die Antwort von einer Software vorbereitet wurde', 'Wie viel die Software im Jahr gekostet hat', 'Welche Firma die Software programmiert hat', 'Wie viele Anfragen die Software schon insgesamt bearbeitet hat'], correct: 0, explain: 'Wer weiß, dass eine Software beteiligt war, kann die Antwort besser einordnen und gezielt nachfragen. Offenheit schafft Vertrauen.', hint: 'Was hilft Beschäftigten, eine Antwort richtig einzuordnen und bei Zweifeln nachzufragen?', skill: 'safe-ai-hr' },
      { text: 'Nach dem Testbetrieb waren 3 von 120 geprüften Vorschlägen falsch. Was folgt daraus?', options: ['Die Prüfung durch Fachkräfte bleibt vorerst nötig', 'Die Software kann ab sofort allein antworten', 'Die Software sollte sofort ganz abgeschaltet werden', 'Das Ergebnis sagt nichts über die Qualität aus'], correct: 0, explain: '3 von 120 sind 2,5 %. Das ist besser als im ersten Test, aber jede falsche Auskunft kann Folgen haben. Die Prüfung bleibt, bis die Fehler dauerhaft sehr selten sind.', hint: 'Rechne die Fehlerquote aus und überlege, ob sie für Antworten ohne Kontrolle schon reicht.' },
    ],
  },
  {
    title: 'Hinterfragen', skill: 'grill-me', shows: 'Annahmen erkennen und die stärkste Gegenposition prüfen',
    mission: 'Die Geschäftsführung will mehr Personal für die Personalsuche einstellen, weil offene Stellen zu spät besetzt werden. Die Daten zeigen aber: Allein die Terminsuche für Vorstellungsgespräche dauert über drei Wochen. Welche Akte passt?',
    facts: [['typische Dauer bis zur Zusage', '74 Tage'], ['Freigabe der Stelle', '12 Tage'], ['erste Kontaktaufnahme', '9 Tage'], ['Termine für Gespräche', '23 Tage']],
    caseTitle: 'Lange Besetzungszeiten',
    cases: [
      { title: 'Fluktuation in einer Abteilung', teaser: '12 von 80 Personen gingen in sechs Monaten' },
      { title: 'Skills-basierte Workforce-Planung', teaser: '4, 8 oder 12 zusätzliche Personen in zwölf Monaten' },
      { title: 'Lange Besetzungszeiten', teaser: 'Typisch 74 Tage, davon 23 Tage für Gesprächstermine', correct: true },
      { title: 'Führungskultur und psychologische Sicherheit', teaser: '8 von 25 melden Bedenken früh' },
    ],
    questions: [
      { text: 'Die Geschäftsführung sagt: „Wir brauchen mehr Personal für die Personalsuche.“ Welche Annahme steckt dahinter?', options: ['Das Recruiting-Team ist zu langsam und bremst alles.', 'Bewerberinnen und Bewerber wollen kürzere Verfahren.', 'Die Fachabteilungen schreiben zu viele Stellen aus.', 'Die Zahlen zur Besetzungsdauer sind falsch berechnet.'], correct: 0, explain: 'Mehr Personal hilft nur, wenn die Zeit im Recruiting verloren geht. Genau das zeigen die Daten nicht.', hint: 'Mehr Personal löst nur ein Problem, das bei diesem Personal liegt. Welches wäre das?' },
      { text: 'Freigabe der Stelle 12 Tage, erste Kontaktaufnahme 9 Tage, Termine für Gespräche 23 Tage: Welcher Schritt dauert am längsten?', options: ['Termine für Gespräche', 'Freigabe der Stelle', 'Erste Kontaktaufnahme', 'Versand des Vertrags'], correct: 0, explain: 'Die Terminsuche dauert 23 Tage. Dafür braucht es vor allem freie Termine der Fachabteilungen, nicht des Recruitings.', hint: 'Vergleiche die drei Zahlen in der Frage miteinander.' },
      { text: 'Darf man 12 + 9 + 23 Tage einfach zusammenzählen, um die typische Gesamtdauer zu bekommen?', options: ['Nein, jede Zahl stammt aus anderen Fällen', 'Ja, das ergibt immer die Gesamtdauer', 'Ja, sobald es mindestens drei Schritte sind', 'Nur, wenn jede Zahl über 30 Tagen liegt'], correct: 0, explain: 'Jede Zahl ist der mittlere Wert einer eigenen Gruppe von Fällen. Zusammengezählt ergeben sie keine sinnvolle Gesamtdauer.', hint: 'Überleg, ob alle drei Zahlen von denselben Bewerbungen stammen.', skill: 'hr-data-reasoning' },
      { text: 'Was würden die Fachabteilungen der Geschäftsführung am ehesten entgegnen?', options: ['„Mehr Recruiter helfen nicht, wenn wir drei Wochen für Termine brauchen.“', '„Wir brauchen kein Recruiting, wir finden Leute selbst über unsere Kontakte.“', '„Die offenen Stellen sind nicht so dringend, wie es immer heißt.“', '„Eine KI soll die Vorauswahl übernehmen, dann geht es schneller.“'], correct: 0, explain: 'Der stärkste Einwand setzt dort an, wo am meisten Zeit verloren geht: bei der Terminsuche.', hint: 'Der stärkste Einwand zielt auf den größten Zeitverlust.' },
      { text: 'Welche Daten braucht man, um zu sehen, wo Bewerbungen wirklich warten?', options: ['Für jede Bewerbung das Datum jedes Schritts', 'Die Zufriedenheit des Recruiting-Teams mit den Abläufen', 'Die Zahl der Stellenanzeigen pro Kanal und Monat', 'Die Kosten pro Anzeige im Vergleich zum Vorjahr'], correct: 0, explain: 'Erst mit den Daten jeder einzelnen Bewerbung sieht man, wo dieselben Fälle tatsächlich liegen bleiben.', hint: 'Man muss eine Bewerbung Schritt für Schritt verfolgen können.' },
      { text: 'Welchen Schritt kann das Recruiting-Team am wenigsten selbst beschleunigen?', options: ['Die Terminsuche mit den Fachabteilungen', 'Die erste Kontaktaufnahme mit Bewerbenden', 'Das Veröffentlichen der Stellenanzeige', 'Das Versenden von Absagen und Zusagen'], correct: 0, explain: 'Für Gespräche braucht es freie Termine in den Fachabteilungen. Darauf hat das Recruiting kaum Einfluss.', hint: 'Bei welchem Schritt hängt das Recruiting von anderen ab?' },
      { text: 'Wie lässt sich am schnellsten testen, ob die Terminsuche das eigentliche Problem ist?', options: ['Vier Wochen feste Gesprächstermine in zwei Abteilungen anbieten', 'Zwei zusätzliche Recruiter:innen befristet für ein Jahr einstellen', 'Eine teure Recruiting-Software mit Jahresvertrag kaufen', 'Alle offenen Stellen für drei Monate an eine Agentur vergeben'], correct: 0, explain: 'Ein kleiner Versuch, der sich leicht rückgängig machen lässt, zeigt schnell, ob es an den Terminen liegt.', hint: 'Gesucht ist ein kleiner Versuch, der wenig kostet und sich leicht rückgängig machen lässt.', skill: 'hr-experiment' },
      { text: 'Welche Zahl spricht am deutlichsten dagegen, dass das Recruiting-Team die Ursache ist?', options: ['Die erste Kontaktaufnahme dauert nur 9 Tage', 'Pro Stelle gibt es viele passende Bewerbungen', 'Die Fachabteilungen sind mit den Kandidaten zufrieden', 'Es gibt mehr offene Stellen als im Vorjahr'], correct: 0, explain: 'Wenn das Recruiting selbst schnell reagiert, liegt die Verzögerung woanders.', hint: 'Schau, wie schnell das Recruiting-Team selbst reagiert.' },
      { text: 'Angenommen, die Terminsuche sinkt von 23 auf 8 Tage. Um wie viele Tage könnten Bewerbungen höchstens schneller durch sein?', options: ['Um bis zu 15 Tage', 'Um genau 23 Tage', 'Um rund 8 Tage', 'Um keinen einzigen Tag'], correct: 0, explain: '23 minus 8 ergibt 15. „Bis zu“, weil jede Zahl aus anderen Fällen stammt und sich andere Schritte mitverändern können.', hint: 'Bilde die Differenz der beiden Zahlen für die Terminsuche.' },
      { text: 'Die Geschäftsführung sagt: „Andere Firmen besetzen Stellen in 40 Tagen.“ Welche Frage solltest du zuerst stellen?', options: ['Ab wann und bis wann wurde dort gemessen?', 'Warum sind die anderen Firmen so viel besser?', 'Wie viele Recruiter arbeiten bei den anderen?', 'Welche Software nutzen die anderen Firmen dafür?'], correct: 0, explain: 'Vergleiche taugen nur, wenn gleich gemessen wird: ab Freigabe oder ab Anzeige, bis zur Zusage oder bis zum ersten Arbeitstag.', hint: 'Bevor man vergleicht, muss klar sein, ob beide Zahlen dasselbe meinen.', skill: 'hr-data-reasoning' },
      { text: 'Welcher Befund würde zeigen, dass die Geschäftsführung doch recht hat?', options: ['Bewerbungen liegen lange ungelesen im Recruiting', 'Die Fachabteilungen finden kaum freie Gesprächstermine', 'Es gibt mehr Bewerbungen als im letzten Jahr', 'Die Stellenanzeigen sind sehr lang formuliert'], correct: 0, explain: 'Wenn Bewerbungen im Recruiting liegen bleiben, wäre das Team tatsächlich ein Engpass. Eine gute Prüfung sucht auch nach Belegen für die Gegenseite.', hint: 'Gesucht ist ein Befund, der die Verzögerung beim Recruiting-Team selbst zeigt.', skill: 'grill-me' },
      { text: 'Nach dem Versuch mit festen Terminen sinkt die Terminsuche in beiden Abteilungen auf 7 Tage. Was ist der beste nächste Schritt?', options: ['Feste Termine schrittweise ausweiten und weiter messen', 'Sofort zwei weitere Recruiter:innen einstellen', 'Den Versuch beenden, weil das Problem gelöst ist', 'Das Ergebnis nicht teilen, um niemanden im Team zu kränken'], correct: 0, explain: 'Ein erfolgreicher kleiner Versuch wird schrittweise ausgeweitet. Weiter messen zeigt, ob die Wirkung auch in anderen Abteilungen hält.', hint: 'Ein guter Versuch endet nicht mit dem ersten Erfolg. Was macht man mit einem guten Ergebnis?', skill: 'hr-experiment' },
    ],
  },
  {
    title: 'Analysieren', skill: 'hr-data-reasoning', shows: 'Kennzahlen richtig bilden und Ursachen sauber trennen',
    mission: 'In einem Bereich kündigen doppelt so viele Menschen wie im Bereich nebenan. Gleichzeitig gab es neue Dienstpläne und eine neue Leitung. Welche Akte passt?',
    facts: [['Abgänge in sechs Monaten', '12 von 80'], ['Vergleichsbereich', '5 von 70'], ['Gründe genannt', '7 von 12'], ['Änderungen', 'Dienstpläne und Leitung']],
    caseTitle: 'Fluktuation in einer Abteilung',
    cases: [
      { title: 'Transfer eines Führungskräftetrainings', teaser: '18 von 24 antworteten, 14 berichten mehr Gespräche' },
      { title: 'Führungskultur und psychologische Sicherheit', teaser: 'Rücklauf 56 %, 8 von 25 melden Bedenken' },
      { title: 'Skills-basierte Workforce-Planung', teaser: '4 interne Kandidat:innen in 6 Monaten qualifizierbar' },
      { title: 'Fluktuation in einer Abteilung', teaser: '12 von 80 gingen in sechs Monaten, nebenan 5 von 70', correct: true },
    ],
    questions: [
      { text: '12 von durchschnittlich 80 Beschäftigten haben in sechs Monaten das Unternehmen verlassen. Wie hoch ist die Quote?', options: ['15 %', '12 %', '7 %', '20 %'], correct: 0, explain: '12 geteilt durch 80 ergibt 15 %.', hint: 'Teile die Zahl der Abgänge durch die Zahl der Beschäftigten.' },
      { text: 'Im Vergleichsbereich haben 5 von 70 Beschäftigten das Unternehmen verlassen. Wie hoch ist dort die Quote?', options: ['Rund 7 %', 'Rund 5 %', 'Rund 14 %', 'Rund 10 %'], correct: 0, explain: '5 geteilt durch 70 ergibt rund 7 %. Im betroffenen Bereich ist die Quote also etwa doppelt so hoch.', hint: 'Teile 5 durch 70 und runde auf eine ganze Zahl.' },
      { text: 'Die Quote ist etwa doppelt so hoch wie nebenan. Was lässt sich allein daraus schließen?', options: ['Dass etwas auffällig ist, aber noch nicht, warum', 'Dass die neue Leitung die Hauptursache ist', 'Dass die neuen Dienstpläne die Abgänge auslösen', 'Dass es kein Zufall sein kann, sondern System hat'], correct: 0, explain: 'Zwei Änderungen kamen gleichzeitig, und die Zahlen sind klein. Für eine Ursache braucht es mehr Daten.', hint: 'Es gab zwei Änderungen zur selben Zeit. Kann man schon sagen, welche wirkt?', skill: 'organization-diagnosis' },
      { text: 'Welche Grafik hilft am besten, die Ursache einzugrenzen?', options: ['Abgänge pro Monat mit markierten Zeitpunkten der Änderungen', 'Ein Tortendiagramm aller Abgänge nach Alter, Geschlecht und Team', 'Eine 3D-Säule mit der Gesamtzahl der Abgänge pro Bereich', 'Eine Wortwolke mit allen genannten Kündigungsgründen'], correct: 0, explain: 'Nur ein Verlauf über die Zeit zeigt, ob die Abgänge nach den neuen Dienstplänen oder nach dem Leitungswechsel stiegen.', hint: 'Gesucht ist eine Darstellung, die zeigt, wann etwas passiert ist.' },
      { text: 'Welche fehlende Information ist am wichtigsten?', options: ['Die Gründe der 5 Personen, die nichts sagten', 'Der Krankenstand im ganzen Unternehmen im Vorjahr', 'Die Zahl der offenen Stellen im gesamten Konzern', 'Wer aus beiden Bereichen beim Sommerfest war'], correct: 0, explain: 'Fünf von zwölf Gründen fehlen. Gerade diese Personen könnten das entscheidende Muster zeigen.', hint: 'Von zwölf Personen haben nicht alle ihre Gründe genannt.' },
      { text: 'Wenn es im gleichen Tempo weitergeht: Wie hoch wäre die Quote nach einem ganzen Jahr?', options: ['Rund 30 %', '15 %', 'Rund 24 %', 'Rund 45 %'], correct: 0, explain: '15 % in sechs Monaten entsprechen rund 30 % im Jahr, wenn das Tempo gleich bleibt. Diese Annahme sollte man dazusagen.', hint: 'Sechs Monate sind ein halbes Jahr.' },
      { text: '7 der 12 Personen haben ihre Gründe genannt. Welcher Anteil ist das?', options: ['Rund 58 %', 'Rund 70 %', 'Rund 42 %', '12 %'], correct: 0, explain: '7 geteilt durch 12 ergibt rund 58 %. Fast die Hälfte der Gründe fehlt.', hint: 'Teile die 7 Rückmeldungen durch die 12 Personen, die gegangen sind.' },
      { text: 'Welche Beobachtung würde gegen die Vermutung sprechen, dass die neuen Dienstpläne schuld sind?', options: ['Nebenan gibt es dieselben Dienstpläne, dort kündigt kaum jemand', 'Mehrere Personen nennen die neuen Dienstpläne ausdrücklich als Grund', 'Die Kündigungen stiegen kurz nach der Umstellung deutlich an', 'Die neue Leitung berichtet von Unmut über die Schichten'], correct: 0, explain: 'Gleiche Änderung, aber nebenan keine Wirkung: Das schwächt die Erklärung mit den Dienstplänen.', hint: 'Gesucht ist eine Beobachtung, die der Vermutung widerspricht.', skill: 'organization-diagnosis' },
      { text: 'Drei der 12 Personen sind in Pension gegangen. Wie hoch ist die Quote ohne sie?', options: ['Rund 11 %', '15 %', 'Rund 4 %', '12 %'], correct: 0, explain: '9 geteilt durch 80 ergibt rund 11 %. Pensionierungen sind planbar und sagen wenig über Unzufriedenheit aus.', hint: 'Ziehe die drei Personen ab und teile den Rest durch 80.' },
      { text: 'Die neue Leitung kam im März, die neuen Dienstpläne im Mai. Die meisten Kündigungen kamen im Juni. Was lässt sich daraus ableiten?', options: ['Eher die Dienstpläne, bewiesen ist das aber nicht', 'Die Leitung ist schuld, weil sie zuerst kam', 'Die neuen Dienstpläne sind sicher die einzige Ursache', 'Der zeitliche Ablauf sagt gar nichts aus'], correct: 0, explain: 'Die zeitliche Nähe ist ein Hinweis, kein Beweis. Kündigungsfristen und andere Gründe können den Zeitpunkt verschieben.', hint: 'Ein zeitlicher Zusammenhang ist ein Hinweis. Ist er auch ein Beweis?' },
      { text: 'Mit wem solltest du zuerst sprechen, um mehr über die Ursachen zu erfahren?', options: ['Vertraulich mit Beschäftigten, die geblieben sind', 'Nur mit der neuen Leitung des betroffenen Bereichs', 'Mit der Geschäftsführung über ihre Vermutungen', 'Mit einer Beratung über Zahlen anderer Firmen'], correct: 0, explain: 'Wer geblieben ist, erlebt dieselben Bedingungen und kann offen erzählen, was belastet. Vertraulichkeit macht ehrliche Antworten wahrscheinlicher.', hint: 'Wer kennt die Lage von innen und ist noch im Unternehmen?', skill: 'organization-diagnosis' },
      { text: 'Im Vergleichsbereich sind die Beschäftigten im Schnitt 15 Jahre im Unternehmen, im betroffenen Bereich 3 Jahre. Warum ist das wichtig?', options: ['Wer kürzer da ist, geht oft schneller, das verzerrt den Vergleich', 'Es ist unwichtig, weil für den Vergleich nur die Quote zählt', 'Es beweist, dass die neue Leitung das eigentliche Problem ist', 'Es zeigt, dass Ältere mit Dienstplänen grundsätzlich zufriedener sind'], correct: 0, explain: 'Wer erst kurz im Unternehmen ist, wechselt häufiger. Ein Teil des Unterschieds kann an der Zusammensetzung der Bereiche liegen, nicht an den Änderungen.', hint: 'Überleg, ob die beiden Gruppen überhaupt gleich zusammengesetzt sind.', skill: 'hr-data-reasoning' },
    ],
  },
  {
    title: 'Entscheiden', skill: 'hr-decision-lab', shows: 'Optionen durchrechnen, Vermutungen benennen und klar entscheiden',
    mission: 'Für Lernangebote gibt es einen festen Betrag, die Wünsche kosten aber 24.000 € mehr. 74 Menschen warten auf ein Angebot. Welche Akte liegt auf dem Tisch?',
    facts: [['Budget', '120.000 €'], ['Daten-Programm', '48.000 €'], ['Führungs-Programm', '60.000 €'], ['freies Budget für Teams', '36.000 €']],
    caseTitle: 'Weiterbildungsbudget für 180 Mitarbeitende',
    cases: [
      { title: 'Auswahl einer HR-Technologie', teaser: 'A: 42.000 € im Jahr plus 25.000 € Einführung' },
      { title: 'KI im HR-Service', teaser: '800 Anfragen im Monat' },
      { title: 'Weiterbildungsbudget für 180 Mitarbeitende', teaser: '120.000 € Budget, Programme 48.000, 60.000 und 36.000 €', correct: true },
      { title: 'Lange Besetzungszeiten', teaser: 'Freigabe 12 Tage, Gesprächstermine 23 Tage' },
    ],
    questions: [
      { text: 'Das Budget beträgt 120.000 €. Die drei Programme kosten 48.000 €, 60.000 € und 36.000 €. Wie viel fehlt?', options: ['24.000 €', '12.000 €', '36.000 €', 'Nichts'], correct: 0, explain: '48.000 + 60.000 + 36.000 = 144.000 €. Das sind 24.000 € mehr als das Budget.', hint: 'Zähle die drei Beträge zusammen und vergleiche mit 120.000 €.' },
      { text: 'Welche Aufteilung kostet genau 120.000 €?', options: ['Daten 48.000 € · Führung 60.000 € · Teams 12.000 €', 'Daten 48.000 € · Führung 60.000 € · Teams 36.000 €', 'Daten 60.000 € · Führung 60.000 € · Teams 12.000 €', 'Daten 48.000 € · Führung 48.000 € · Teams 36.000 €'], correct: 0, explain: '48.000 + 60.000 + 12.000 = 120.000 €. Gekürzt wird beim freien Budget für die Teams.', hint: 'Rechne jede Aufteilung kurz nach. Nur eine geht genau auf.' },
      { text: 'Was ist bei dieser Entscheidung nur eine Vermutung und noch nicht belegt?', options: ['Dass das Führungs-Programm das Verhalten wirklich verändert', 'Dass das Budget für Lernangebote 120.000 € beträgt', 'Dass es 24 Führungskräfte in neuen Rollen gibt', 'Dass alle drei Programme zusammen mehr kosten als das Budget'], correct: 0, explain: 'Budget und Zahlen sind bekannt. Ob ein Programm wirkt, ist dagegen eine Erwartung, die erst geprüft werden muss.', hint: 'Was ist bekannt, und was wird nur erhofft?' },
      { text: 'Nach 30 Tagen soll die Entscheidung überprüft werden. Was muss vorher feststehen?', options: ['Wer prüft, woran gemessen wird und wann man abbricht', 'Dass man prüft, sobald im Team gerade Zeit dafür ist', 'Dass man nur dann prüft, wenn sich Probleme zeigen', 'Dass eine Zufriedenheitsumfrage am Ende ausreicht'], correct: 0, explain: 'Ohne Verantwortung, Messgröße und Abbruchregel wird aus einer Überprüfung nur ein Gespräch.', hint: 'Eine Überprüfung braucht eine Person, einen Maßstab und eine Grenze.' },
      { text: 'Was gehört in den ersten Satz einer Entscheidungsvorlage für den Vorstand?', options: ['Was heute entschieden werden soll', 'Wie die Analyse durchgeführt wurde', 'Welche Studien verwendet wurden', 'Ein Dank an das ganze Projektteam'], correct: 0, explain: 'Vorstände lesen den Anfang. Dort muss sofort stehen, worüber sie entscheiden sollen.', hint: 'Was muss ein Vorstand als Erstes wissen?', skill: 'executive-hr-brief' },
      { text: 'Das Daten-Programm kostet 48.000 € für 50 Personen. Wie viel ist das pro Person?', options: ['Rund 960 €', 'Rund 480 €', 'Rund 2.400 €', 'Rund 1.500 €'], correct: 0, explain: '48.000 € geteilt durch 50 ergibt 960 € pro Person.', hint: 'Teile den Preis des Programms durch die Zahl der Personen.', skill: 'learning-design' },
      { text: 'Was wird die Finanzabteilung am ehesten einwenden?', options: ['„Ohne Wirkungsnachweis ist das ein Risiko. Testet erst klein.“', '„Weiterbildung ist in diesem Jahr grundsätzlich zu teuer für uns.“', '„Führungskräfte lernen am besten ganz ohne teure Programme.“', '„Verdoppelt einfach das Budget, dann gibt es keinen Streit.“'], correct: 0, explain: 'Die Finanzabteilung fragt, was ein Euro bewirkt. Ein kleiner Test mit Messung beantwortet genau das.', hint: 'Die Finanzabteilung will wissen, was das Geld bewirkt.' },
      { text: 'Unter welcher Bedingung wäre eine andere Aufteilung besser?', options: ['Wenn Führungsstellen dringend zu besetzen sind', 'Wenn das Logo der Academy neu gestaltet wird', 'Wenn die drei Programme freundlichere Namen bekommen', 'Wenn sich an der Ausgangslage nichts ändert'], correct: 0, explain: 'Eine gute Entscheidung sagt auch, wann sie nicht mehr passt. Hier wäre das zum Beispiel große Dringlichkeit bei Führungsstellen.', hint: 'Was müsste sich an der Lage ändern, damit andere Prioritäten gelten?' },
      { text: '74 Personen warten auf ein Lernangebot, das Daten-Programm hat 50 Plätze. Wie viele bekommen dort keinen Platz?', options: ['24', '50', '74', '26'], correct: 0, explain: '74 minus 50 ergibt 24. Für sie braucht es eine Warteliste, einen zweiten Durchgang oder eine andere Lösung.', hint: 'Ziehe die Zahl der Plätze von der Zahl der Wartenden ab.' },
      { text: 'Welche Information macht die Entscheidung am meisten sicherer?', options: ['Ob das Gelernte im Arbeitsalltag angewendet werden kann', 'Wie andere Firmen ihr Weiterbildungsbudget verteilen', 'Welches Programm im Vorjahr bei Teilnehmenden beliebter war', 'Wie modern die Anbieter ihre Website gestalten'], correct: 0, explain: 'Ein Programm lohnt sich nur, wenn das Gelernte im Alltag ankommt. Beliebtheit und Vergleiche mit anderen sagen darüber wenig.', hint: 'Wofür wird das Geld am Ende eigentlich ausgegeben?', skill: 'learning-design' },
      { text: 'Die Geschäftsführung will die Entscheidung auf das nächste Quartal verschieben. Was kostet das Warten?', options: ['74 Menschen warten länger, wichtige Lücken bleiben offen', 'Nichts, weil das Budget im nächsten Quartal erhalten bleibt', 'Nur die Zeit für ein weiteres Abstimmungsmeeting', 'Warten senkt meistens sogar die Preise der Anbieter'], correct: 0, explain: 'Auch Nichtentscheiden ist eine Entscheidung mit Folgen: Die Lücken bleiben, und wer lange wartet, verliert Motivation.', hint: 'Auch Nichtstun hat Folgen. Für wen?', skill: 'hr-decision-lab' },
      { text: 'Was ist eine sinnvolle Abbruchbedingung für das Führungs-Programm?', options: ['Nach drei Monaten zeigt sich im Team keine Veränderung', 'Die Teilnehmenden finden einzelne Termine etwas zu früh', 'Ein Modul muss wegen einer Erkrankung verschoben werden', 'Die Anbieterin schickt die Rechnung zu spät'], correct: 0, explain: 'Abgebrochen wird, wenn das Ziel verfehlt wird, nicht bei kleinen Störungen. Diese Bedingung legt man vor dem Start fest.', hint: 'Eine Abbruchbedingung hängt am Ziel des Programms, nicht an Kleinigkeiten.', skill: 'hr-decision-lab' },
    ],
  },
  {
    title: 'Reflektieren', skill: 'learning-review', shows: 'Echte Wirkung von Selbstauskunft unterscheiden',
    mission: 'Nach einer Weiterbildung haben drei Viertel der Teilnehmenden einen Fragebogen ausgefüllt, die meisten sind begeistert. Aber vorher hat niemand gemessen, und beim Vergleichsteam hat sich gleichzeitig vieles geändert. Welche Akte passt?',
    facts: [['Teilnehmende', '24'], ['Fragebogen ausgefüllt', '18'], ['berichten mehr Feedbackgespräche', '14'], ['Messung vorher', 'keine']],
    caseTitle: 'Transfer eines Führungskräftetrainings',
    cases: [
      { title: 'Führungskultur und psychologische Sicherheit', teaser: '8 von 25 melden Bedenken früh, Rücklauf 56 %' },
      { title: 'Transfer eines Führungskräftetrainings', teaser: '18 von 24 antworteten, 14 berichten mehr Feedbackgespräche', correct: true },
      { title: 'Weiterbildungsbudget für 180 Mitarbeitende', teaser: '50 Personen mit Lücken bei Datenkompetenz' },
      { title: 'Fluktuation in einer Abteilung', teaser: '7 von 12 nannten ihre Gründe' },
    ],
    questions: [
      { text: '24 Führungskräfte haben teilgenommen, 18 haben den Fragebogen ausgefüllt. Wie hoch ist die Rücklaufquote?', options: ['75 %', '58 %', '78 %', '100 %'], correct: 0, explain: '18 von 24 sind 75 %. Über sechs Personen wissen wir nichts.', hint: 'Teile die Zahl der ausgefüllten Fragebögen durch die Zahl der Teilnehmenden.' },
      { text: '14 Teilnehmende sagen, sie führen jetzt mehr Feedbackgespräche. Was ist das Problem an dieser Aussage?', options: ['Es ist Selbsteinschätzung, und vorher wurde nichts gemessen', 'Es haben zu viele Führungskräfte gleichzeitig am Training teilgenommen', 'Der Zeitraum zwischen Training und Befragung ist zu lang', 'Der Fragebogen war zu kurz und hatte zu wenige Fragen'], correct: 0, explain: 'Wer sich selbst einschätzt, sieht sich oft positiver. Ohne Messung vorher fehlt außerdem der Vergleich.', hint: 'Wer hat die Zahl erhoben, und gibt es einen Wert von vorher?' },
      { text: 'Warum eignet sich das Vergleichsteam kaum für einen Vergleich?', options: ['Dort haben sich gleichzeitig Ziele und Personal geändert', 'Das Team ist mit zwölf Personen zu klein für Vergleiche', 'Das Team arbeitet in einem anderen Gebäude als die Gruppe', 'Das Team hat seine Besprechungen an anderen Wochentagen'], correct: 0, explain: 'Wenn sich beim Vergleichsteam gleichzeitig vieles ändert, kann man Unterschiede nicht dem Training zuschreiben.', hint: 'Ein Vergleich funktioniert nur, wenn sich sonst wenig unterscheidet.' },
      { text: 'Was ist der beste nächste Schritt?', options: ['Praxisaufgaben ergänzen und ab jetzt vorher und nachher messen', 'Das Training sofort für alle Führungskräfte im ganzen Haus anbieten', 'Das Training stoppen, bis eine Studie die Wirkung belegt', 'Die Zufriedenheitsumfrage mit mehr Fragen wiederholen'], correct: 0, explain: 'Das gute Signal ernst nehmen, aber erst messen, ob sich das Verhalten wirklich ändert.', hint: 'Gesucht ist ein Schritt, der das gute Signal nutzt und trotzdem genauer misst.', skill: 'hr-experiment' },
      { text: 'Ein Projekt ist gut ausgegangen. Was beweist das?', options: ['Nicht automatisch, dass die Entscheidung gut war', 'Dass die Entscheidung gut und gut begründet war', 'Dass es sicher keine bessere Möglichkeit gegeben hätte', 'Dass die verwendeten Daten vollständig waren'], correct: 0, explain: 'Auch Glück und Umstände spielen mit. Eine gute Entscheidung erkennt man an ihrer Begründung, nicht nur am Ergebnis.', hint: 'Kann ein gutes Ergebnis auch Glück gewesen sein?' },
      { text: '14 von 18 Antwortenden berichten mehr Feedbackgespräche. Welcher Anteil ist das?', options: ['Rund 78 %', 'Rund 58 %', 'Rund 75 %', 'Rund 92 %'], correct: 0, explain: '14 von 18 sind rund 78 %. Bezogen auf alle 24 Teilnehmenden wären es nur rund 58 %.', hint: 'Teile 14 durch die Zahl der Antwortenden, nicht durch alle Teilnehmenden.' },
      { text: 'Welche Messung zeigt am ehesten echtes Verhalten statt einer Meinung?', options: ['Teammitglieder bestätigen anonym, dass ein Gespräch stattfand', 'Die Teilnehmenden geben dem Training 4,8 von 5 Punkten', 'Die Teilnehmenden schreiben ein Lerntagebuch über ihre Gespräche', 'Die Trainerin bewertet die Fortschritte als sehr gut'], correct: 0, explain: 'Die Sicht der Teammitglieder auf ein tatsächliches Gespräch ist näher am Verhalten als jede Selbsteinschätzung.', hint: 'Wer erlebt das Verhalten der Führungskraft im Alltag?' },
      { text: 'Zwei Tage nach dem Training schätzt du erst deine Sicherheit ein und beantwortest dann Fragen ohne Unterlagen. Wozu dient das?', options: ['Man sieht, ob das Gefühl zum tatsächlichen Wissen passt', 'Es ersetzt jede weitere Messung des Lernerfolgs', 'Es macht das Lernen leichter, weil man sich sicherer fühlt', 'Es zeigt, wie zufrieden man mit dem Training ist'], correct: 0, explain: 'Erst der Vergleich zwischen gefühlter Sicherheit und echtem Wissen zeigt, wo man sich über- oder unterschätzt.', hint: 'Womit wird die eigene Einschätzung hier verglichen?', skill: 'learning-design' },
      { text: 'Bezieh die 14 positiven Antworten auf alle 24 Teilnehmenden. Welcher Anteil ist das?', options: ['Rund 58 %', 'Rund 78 %', '75 %', 'Rund 42 %'], correct: 0, explain: '14 von 24 sind rund 58 %. Über die sechs Personen ohne Antwort wissen wir nichts, vielleicht hat sich bei ihnen gar nichts verändert.', hint: 'Teile 14 durch die Zahl aller Teilnehmenden, nicht nur der Antwortenden.' },
      { text: 'Was ist bei freiwilligen Fragebögen nach einem Training oft ein Problem?', options: ['Es antworten eher die Zufriedenen, das Bild wird zu positiv', 'Es antworten alle gleich häufig, das Bild ist also verlässlich', 'Freiwillige Antworten sind immer genauer als Pflichtantworten', 'Freiwillige Fragebögen lassen sich gar nicht auswerten'], correct: 0, explain: 'Wer freiwillig antwortet, ist oft zufriedener als der Rest. Solange die Fehlenden unbekannt sind, wirkt das Ergebnis besser, als es ist.', hint: 'Überleg, wer nach einem Training eher Lust hat, noch einen Fragebogen auszufüllen.', skill: 'learning-review' },
      { text: 'Was wäre die beste Vergleichsgruppe für das nächste Training?', options: ['Führungskräfte, die erst im nächsten Durchgang teilnehmen', 'Führungskräfte aus einem ganz anderen Unternehmen', 'Die Trainerinnen und Trainer des Programms selbst', 'Führungskräfte, die das Training ganz bewusst abgelehnt haben'], correct: 0, explain: 'Wer später teilnimmt, ist den Teilnehmenden ähnlich und erlebt dieselben Bedingungen. So lässt sich die Wirkung des Trainings besser abgrenzen.', hint: 'Gesucht ist eine Gruppe, die möglichst ähnlich ist, nur eben noch ohne Training.', skill: 'learning-review' },
      { text: 'Drei Monate später führt nur noch die Hälfte regelmäßig Feedbackgespräche. Was ist die beste Reaktion?', options: ['Nachfragen, was im Alltag hindert, und dort ansetzen', 'Das Training als gescheitert erklären und streichen', 'Die Gespräche zur Pflicht machen und streng kontrollieren', 'Das ganze Training einfach noch einmal wiederholen'], correct: 0, explain: 'Wenn Verhalten im Alltag nachlässt, liegt es oft an Zeit, Rückhalt oder Gewohnheiten. Erst die Hindernisse verstehen, dann gezielt nachbessern.', hint: 'Bevor man reagiert, sollte man wissen, warum es nachlässt.' },
    ],
  },
];

// Für Tests und Konsole sichtbar machen
Object.assign(globalThis, { LEVELS, PROMPTS, PRO });

/* ---------- Spiellogik (rein, testbar) ---------- */

function shuffled(list, rng = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

function shuffleQuestion(question, rng = Math.random) {
  const order = shuffled(question.options.map((_, index) => index), rng);
  return { ...question, options: order.map(index => question.options[index]), correct: order.indexOf(question.correct) };
}

function scoreAnswer({ correct, streak, seconds, joker, pro = false, sure = false }) {
  if (!correct) return pro && sure ? -PRO.surePenalty : 0;
  let points = 100 + 25 * Math.min(streak, 4) + (seconds <= (pro ? PRO.seconds : SPEED_SECONDS) ? 25 : 0);
  if (joker) points = Math.floor(points / 2);
  if (pro && sure) points += PRO.sureBonus;
  return points;
}

function createLevelRun(count, rng = Math.random, pro = false) {
  return { queue: shuffled(Array.from({ length: count }, (_, index) => index), rng), asked: [], xp: 0, streak: 0, jokers: pro ? 0 : 2, target: pro ? PRO.target : LEVEL_XP, pro, done: false, stars: 0, correctCount: 0, lastPoints: 0 };
}

function applyCaseFind(run, firstTry) {
  if (firstTry) run.xp += 50;
}

function answerQuestion(run, { correct, seconds, joker, sure = false }) {
  const index = run.queue.shift();
  run.asked.push(index);
  const points = Math.max(scoreAnswer({ correct, streak: run.streak, seconds, joker, pro: run.pro, sure }), -run.xp);
  run.lastPoints = points;
  run.xp += points;
  if (correct) { run.streak += 1; run.correctCount += 1; }
  else { run.streak = 0; run.queue.splice(Math.min(2, run.queue.length), 0, index); }
  if (run.xp >= run.target) {
    run.done = true;
    const steps = run.asked.length;
    run.stars = steps <= 3 ? 3 : steps <= 5 ? 2 : 1;
  }
  return points;
}

function useJoker(run, question) {
  if (run.jokers <= 0) return null;
  run.jokers -= 1;
  const wrong = shuffled(question.options.map((_, index) => index).filter(index => index !== question.correct));
  return { removed: wrong.slice(0, 2), prompt: PROMPTS[question.joker] ?? '', hint: question.hint ?? '' };
}

function createFinalRound(levels, rng = Math.random, pro = false) {
  return { items: levels.map((level, index) => ({ level: index, question: level.questions[Math.floor(rng() * level.questions.length)] })), position: 0, correct: 0, jokers: pro ? 0 : 1 };
}

function finalPassed({ correct, total, pro = false }) {
  return correct >= (pro ? total : total - 1);
}

/* ---------- Oberfläche ---------- */

const $ = id => document.getElementById(id);
const state = { pro: false, pending: null, calibration: { sure: 0, sureRight: 0, unsure: 0, unsureRight: 0 }, level: 0, run: null, total: 0, stars: [], perLevel: [], jokersUsed: 0, correct: 0, answered: 0, started: 0, current: null, questionStart: 0, timer: null, jokerActive: false, caseTries: 0, name: '', noTimer: false, final: null, answeredCurrent: false };

function show(id) {
  for (const screen of document.querySelectorAll('#spiel .screen')) screen.hidden = screen.id !== id;
  $('hud').hidden = ['screen-start', 'screen-final'].includes(id) || id.startsWith('screen-crisis');
  $('spiel')?.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  const heading = $(id)?.querySelector('h1, h2');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

// Tasten wirken nur, solange das Spiel sichtbar ist
function gameInView() {
  const box = $('spiel')?.getBoundingClientRect?.();
  return !box || (box.top < window.innerHeight * 0.6 && box.bottom > window.innerHeight * 0.4);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function rankFor(level) {
  return level === 0 ? 'Einstieg' : RANKS[level - 1];
}

function updateHud() {
  const inFinal = Boolean(state.final) || state.level >= LEVELS.length;
  const finalRound = state.final ?? { position: 0, correct: 0 };
  $('hud-level').textContent = inFinal ? 'Schlussrunde' : 'Level ' + (state.level + 1) + ' von 5 · ' + LEVELS[state.level].title;
  $('hud-rank').textContent = rankFor(inFinal ? 5 : state.level);
  if (inFinal) {
    $('xp-fill').style.width = (100 * finalRound.position / 5) + '%';
    $('hud-xp').textContent = finalRound.correct + ' von 5 richtig';
  } else {
    const target = state.run?.target ?? LEVEL_XP;
    const xp = state.run ? Math.min(state.run.xp, target) : 0;
    $('xp-fill').style.width = (100 * xp / target) + '%';
    $('hud-xp').textContent = xp + ' / ' + target + ' Punkte';
  }
  $('hud-streak').textContent = state.run && !inFinal ? state.run.streak : 0;
  $('hud-score').textContent = state.total;
}

function floatPoints(points) {
  if (!points) return;
  const bubble = element('span', 'xp-float' + (points < 0 ? ' minus' : ''), (points > 0 ? '+' : '−') + Math.abs(points));
  $('hud').append(bubble);
  setTimeout(() => bubble.remove(), 1400);
  $('hud').classList.add('hud-pulse');
  setTimeout(() => $('hud').classList.remove('hud-pulse'), 700);
}

function renderMap() {
  state.run = null;
  state.final = null;
  const path = $('level-path');
  path.replaceChildren();
  const nodes = [...LEVELS.map(level => level.title), 'Schlussrunde'];
  nodes.forEach((title, index) => {
    const status = index < state.level ? ' done' : index === state.level ? ' current' : ' locked';
    const item = element('li', 'level-node' + status + (index === 5 ? ' level-final' : ''));
    item.append(element('span', 'node-number', index === 5 ? '★' : String(index + 1)));
    const text = element('span', 'node-text');
    let line;
    if (index < state.level) line = RANKS[index] + ' · ' + '★'.repeat(state.stars[index]) + '☆'.repeat(3 - state.stars[index]);
    else if (index === state.level) line = index === 5 ? (state.pro ? 'Fünf Fragen aus allen Fällen, alle müssen sitzen' : 'Fünf Fragen aus allen Fällen, vier müssen sitzen') : 'Als Nächstes';
    else line = index === 5 ? 'Öffnet nach Level 5' : 'Gesperrt';
    text.append(element('strong', '', title), element('span', '', line));
    item.append(text);
    path.append(item);
  });
  $('map-rank').textContent = 'Aktueller Rang: ' + rankFor(state.level);
  $('map-title').textContent = state.level === 0 ? 'Dein Weg beginnt.' : state.level === 5 ? 'Bereit für die Schlussrunde.' : 'Weiter geht’s: Level ' + (state.level + 1) + '.';
  $('map-continue').textContent = state.level === 5 ? 'Schlussrunde starten' : 'Mission starten';
  updateHud();
  show('screen-map');
}

function continueFromMap() {
  if (state.level === 5) return startFinal();
  startMission();
}

function startMission() {
  const level = LEVELS[state.level];
  state.run = createLevelRun(level.questions.length, Math.random, state.pro);
  state.caseTries = 0;
  $('mission-kicker').textContent = 'LEVEL ' + (state.level + 1) + ' · ' + level.title.toUpperCase() + ' · MISSION';
  $('mission-text').textContent = level.mission;
  $('mission-feedback').textContent = '';
  const files = $('case-files');
  files.replaceChildren();
  shuffled(level.cases).forEach(item => {
    const button = element('button', 'case-file');
    button.type = 'button';
    button.append(element('span', 'case-tab', 'FALLAKTE'), element('strong', '', item.title), element('span', 'case-data', item.teaser));
    button.addEventListener('click', () => pickCase(item, button));
    files.append(button);
  });
  updateHud();
  show('screen-mission');
}

function pickCase(item, button) {
  state.caseTries += 1;
  if (!item.correct) {
    button.disabled = true;
    button.classList.add('wrong');
    $('mission-feedback').textContent = 'Nicht diese Akte. Rechne die Zahlen der Mission nach und vergleiche sie mit den Daten auf den Akten.';
    return;
  }
  applyCaseFind(state.run, state.caseTries === 1);
  if (state.caseTries === 1) { state.total += 50; floatPoints(50); }
  for (const other of $('case-files').querySelectorAll('.case-file')) other.disabled = true;
  button.classList.add('right');
  $('mission-feedback').textContent = state.caseTries === 1 ? 'Richtig gefunden: 50 Bonuspunkte.' : 'Gefunden. Weiter zu den Fragen.';
  updateHud();
  setTimeout(nextQuestion, 900);
}

function renderFacts(level) {
  const brief = $('case-brief');
  brief.replaceChildren();
  brief.append(element('span', 'brief-title', level.caseTitle));
  const list = element('dl', 'fact-list');
  for (const [label, value] of level.facts) {
    const item = element('div', 'fact');
    item.append(element('dt', '', label), element('dd', '', value));
    list.append(item);
  }
  brief.append(list);
}

function presentQuestion(question, kicker, level) {
  state.current = question;
  state.jokerActive = false;
  state.answeredCurrent = false;
  renderFacts(level);
  $('question-kicker').textContent = kicker;
  $('question-text').textContent = question.text;
  const options = $('options');
  options.replaceChildren();
  question.options.forEach((label, optionIndex) => {
    const button = element('button', 'option');
    button.type = 'button';
    button.dataset.index = optionIndex;
    button.append(element('span', 'option-key', String(optionIndex + 1)), element('span', '', label));
    button.addEventListener('click', () => choose(optionIndex));
    options.append(button);
  });
  $('answer-feedback').hidden = true;
  $('confidence').hidden = true;
  state.pending = null;
  $('joker-button').hidden = state.pro;
  const jokers = state.final ? state.final.jokers : state.run.jokers;
  $('joker-button').disabled = jokers === 0;
  $('joker-label').textContent = 'Joker (' + jokers + ')';
  state.questionStart = Date.now();
  startTimer();
  updateHud();
  show('screen-question');
}

function nextQuestion() {
  if (state.final) return nextFinalQuestion();
  const level = LEVELS[state.level];
  if (state.run.done) return levelUp();
  const index = state.run.queue[0];
  const base = level.questions[index];
  const question = { ...shuffleQuestion(base), joker: base.skill ?? level.skill, skill: base.skill ?? level.skill };
  const repeat = state.run.asked.includes(index);
  presentQuestion(question, 'FRAGE ' + (state.run.asked.length + 1) + (repeat ? ' · ZWEITE CHANCE' : ''), level);
}

function limit() {
  return state.final ? FINAL_SECONDS : state.pro ? PRO.seconds : SPEED_SECONDS;
}

function choose(choice) {
  if (state.answeredCurrent) return;
  if (!state.pro) return answer(choice);
  state.pending = choice;
  for (const button of $('options').querySelectorAll('.option')) button.classList.toggle('selected', Number(button.dataset.index) === choice);
  $('confidence').hidden = false;
  $('confidence').querySelector('[data-sure="true"]').focus({ preventScroll: true });
  $('confidence').scrollIntoView?.({ block: 'nearest' });
}

function confirmChoice(sure) {
  if (state.pending === null || state.answeredCurrent) return;
  answer(state.pending, sure);
}

function startTimer() {
  clearInterval(state.timer);
  const fill = $('timer-fill');
  const hint = $('speed-hint');
  if (state.noTimer) { fill.parentElement.hidden = true; hint.textContent = 'Ohne Zeitdruck'; return; }
  fill.parentElement.hidden = false;
  const seconds = limit();
  const tick = () => {
    const left = Math.max(0, seconds - (Date.now() - state.questionStart) / 1000);
    fill.style.width = (100 * left / seconds) + '%';
    hint.textContent = left > 0 ? 'Tempo-Bonus: noch ' + Math.ceil(left) + ' s' : 'Tempo-Bonus vorbei, nimm dir Zeit';
    if (left === 0) clearInterval(state.timer);
  };
  tick();
  state.timer = setInterval(tick, 250);
}

function answer(choice, sure = false) {
  if (state.answeredCurrent) return;
  state.answeredCurrent = true;
  $('confidence').hidden = true;
  clearInterval(state.timer);
  const question = state.current;
  const correct = choice === question.correct;
  const seconds = state.noTimer ? Infinity : (Date.now() - state.questionStart) / 1000;
  let points;
  let streakBefore = 0;
  if (state.final) {
    points = Math.max(scoreAnswer({ correct, streak: 0, seconds: seconds <= FINAL_SECONDS ? 0 : Infinity, joker: state.jokerActive, pro: state.pro, sure }), -state.total);
    if (correct) state.final.correct += 1;
    state.final.position += 1;
  } else {
    streakBefore = state.run.streak;
    points = answerQuestion(state.run, { correct, seconds, joker: state.jokerActive, sure });
    const tally = state.perLevel[state.level] ?? (state.perLevel[state.level] = { right: 0, asked: 0 });
    tally.asked += 1;
    if (correct) tally.right += 1;
  }
  state.total = Math.max(0, state.total + points);
  if (state.pro) {
    const key = sure ? 'sure' : 'unsure';
    state.calibration[key] += 1;
    if (correct) state.calibration[key + 'Right'] += 1;
  }
  state.answered += 1;
  if (correct) state.correct += 1;
  floatPoints(points);
  for (const button of $('options').querySelectorAll('.option')) {
    button.disabled = true;
    const index = Number(button.dataset.index);
    if (index === question.correct) button.classList.add('right');
    else if (index === choice) button.classList.add('wrong');
  }
  const bonus = [];
  if (correct && streakBefore > 0) bonus.push('Serie +' + 25 * Math.min(streakBefore, 4));
  if (correct && seconds <= limit()) bonus.push('Tempo +25');
  if (correct && state.jokerActive) bonus.push('mit Joker halbiert');
  if (correct && state.pro && sure) bonus.push('Sicher +' + PRO.sureBonus);
  $('speed-hint').textContent = state.noTimer ? 'Ohne Zeitdruck' : seconds <= limit() ? 'Tempo-Bonus erreicht' : 'Ohne Tempo-Bonus';
  $('timer-fill').parentElement.hidden = true;
  const penalty = !correct && state.pro && sure ? ' Du warst sicher: −' + PRO.surePenalty + ' Punkte.' : '';
  $('verdict').textContent = correct ? 'Richtig. +' + points + ' Punkte' + (bonus.length ? ' · ' + bonus.join(' · ') : '') : (state.final ? 'Nicht richtig.' : 'Nicht richtig. Diese Frage kommt gleich noch einmal.') + penalty;
  $('verdict').className = 'verdict ' + (correct ? 'ok' : 'no');
  $('explain').textContent = question.explain;
  const link = $('skill-link');
  link.href = '#' + question.skill;
  link.textContent = 'Vertiefen in der Academy: ' + (SKILL_TITLES[question.skill] ?? 'zum passenden Skill');
  const finishing = state.final ? state.final.position === 5 : state.run.done;
  $('next-button').textContent = finishing ? (state.final ? 'Ergebnis ansehen' : 'Level abschließen') : 'Weiter';
  $('answer-feedback').hidden = false;
  $('joker-button').disabled = true;
  updateHud();
  $('answer-feedback').scrollIntoView?.({ behavior: matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  $('next-button').focus({ preventScroll: true });
}

function openJoker() {
  const pool = state.final ?? state.run;
  const result = useJoker(pool, state.current);
  if (!result) return;
  state.jokerActive = true;
  state.jokersUsed += 1;
  for (const button of $('options').querySelectorAll('.option')) {
    if (result.removed.includes(Number(button.dataset.index))) { button.disabled = true; button.classList.add('removed'); }
  }
  $('joker-hint').textContent = result.hint;
  $('joker-prompt').value = result.prompt;
  $('joker-status').textContent = '';
  $('joker-label').textContent = 'Joker (' + pool.jokers + ')';
  $('joker-button').disabled = true;
  $('joker-dialog').showModal?.();
  $('joker-prompt').scrollTop = 0;
}

function levelUp() {
  clearInterval(state.timer);
  state.stars[state.level] = state.run.stars;
  const level = LEVELS[state.level];
  const tally = state.perLevel[state.level];
  $('levelup-title').textContent = 'Neuer Rang: ' + RANKS[state.level];
  $('levelup-stars').textContent = '★'.repeat(state.run.stars) + '☆'.repeat(3 - state.run.stars);
  $('levelup-stars').setAttribute('aria-label', state.run.stars + ' von 3 Sternen');
  $('levelup-text').textContent = 'Gezeigt: ' + level.shows + '. ' + tally.right + ' von ' + tally.asked + ' Antworten richtig, Level in ' + tally.asked + ' Fragen geschafft.';
  state.level += 1;
  $('levelup-next').textContent = state.level === 5 ? 'Zur Schlussrunde' : 'Zum nächsten Level';
  show('screen-levelup');
  celebrate($('burst-canvas'), 1600);
}

function startFinal() {
  state.final = createFinalRound(LEVELS, Math.random, state.pro);
  state.run = null;
  $('final-intro-text').textContent = 'Fünf Fragen, je eine aus jedem Fall, gemischt und ohne Missionen. ' + (state.noTimer ? 'Ohne Zeitdruck.' : 'Pro Frage 15 Sekunden für den Tempo-Bonus.') + (state.pro ? ' Profi-Stufe: kein Joker, alle fünf Antworten müssen richtig sein.' : ' Ein Joker. Vier richtige Antworten öffnen das Finale.');
  updateHud();
  show('screen-final-intro');
}

function nextFinalQuestion() {
  const round = state.final;
  if (round.position === 5) return finishFinal();
  const item = round.items[round.position];
  const level = LEVELS[item.level];
  const question = { ...shuffleQuestion(item.question), joker: item.question.skill ?? level.skill, skill: item.question.skill ?? level.skill };
  presentQuestion(question, 'SCHLUSSRUNDE · FRAGE ' + (round.position + 1) + ' VON 5 · ' + level.title.toUpperCase(), level);
}

function finishFinal() {
  clearInterval(state.timer);
  if (finalPassed({ correct: state.final.correct, total: 5, pro: state.pro })) return finale();
  $('retry-text').textContent = state.final.correct + ' von 5 richtig. Für das Finale braucht es ' + (state.pro ? 'alle fünf' : 'vier') + '. Die nächste Runde zieht neue Fragen aus allen fünf Fällen.';
  show('screen-final-retry');
}

function finale() {
  const name = state.name;
  const stars = state.stars.reduce((sum, value) => sum + value, 0);
  $('final-name').textContent = name ? name + ', du bist' : 'Du bist';
  $('final-distinction').textContent = (state.pro ? 'Profi-Stufe · ' : '') + (stars >= 13 ? 'Mit Auszeichnung · ' + stars + ' von 15 Sternen' : stars + ' von 15 Sternen');
  const cal = state.calibration;
  $('final-calibration').hidden = !state.pro;
  if (state.pro) {
    const rate = cal.sure ? cal.sureRight / cal.sure : 1;
    $('final-calibration').textContent = 'Deine Sicherheit: ' + cal.sure + ' Mal sicher, davon ' + cal.sureRight + ' richtig. ' + cal.unsure + ' Mal unsicher, davon ' + cal.unsureRight + ' richtig. ' + (rate >= 0.85 ? 'Wenn du dir sicher warst, lagst du fast immer richtig.' : 'Deine Sicherheit war öfter größer als dein Wissen. Genau das lohnt sich bei echten Entscheidungen zu beobachten.') + (cal.unsure >= 3 && cal.unsureRight / cal.unsure >= 0.8 ? ' Auch wenn du unsicher warst, lagst du meist richtig: Du darfst dir mehr zutrauen.' : '');
  }
  const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
  const stats = $('final-stats');
  stats.replaceChildren();
  for (const [label, value] of [['Punkte', state.total], ['Richtig', state.correct + ' von ' + state.answered], ['Schlussrunde', state.final.correct + ' von 5'], ['Spielzeit', minutes + ' Min.']]) {
    const box = element('div');
    box.append(element('dt', '', label), element('dd', '', String(value)));
    stats.append(box);
  }
  const debrief = $('final-debrief');
  debrief.replaceChildren();
  LEVELS.forEach((level, index) => {
    const tally = state.perLevel[index] ?? { right: 0, asked: 0 };
    const row = element('li');
    row.append(element('strong', '', level.title), element('span', '', level.shows), element('em', '', tally.right + ' / ' + tally.asked));
    debrief.append(row);
  });
  $('certificate-link').href = certificate(name, stars);
  show('screen-final');
  celebrate($('fireworks'), 9000, true);
}

function certificate(name, stars) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600; canvas.height = 1100;
  const c = canvas.getContext?.('2d');
  if (!c) return '#';
  c.fillStyle = '#12295a'; c.fillRect(0, 0, 1600, 1100);
  c.strokeStyle = '#d6288c'; c.lineWidth = 6; c.strokeRect(50, 50, 1500, 1000);
  c.textAlign = 'center';
  c.fillStyle = '#f6a8d2'; c.font = '700 30px "DM Sans", sans-serif'; c.fillText('HR FUTURE THINKERS ACADEMY', 800, 200);
  c.fillStyle = '#ffffff'; c.font = '400 140px "Instrument Serif", Georgia, serif'; c.fillText(FINAL_TITLE, 800, 430);
  c.font = '400 54px "DM Sans", sans-serif'; c.fillText(name || 'Herausragend gespielt', 800, 560);
  c.fillStyle = '#d5daf0'; c.font = '400 34px "DM Sans", sans-serif';
  c.fillText('hat alle fünf Level und die Schlussrunde' + (state.pro ? ' auf der Profi-Stufe' : '') + ' gemeistert:', 800, 640);
  c.fillText('Entdecken · Hinterfragen · Analysieren · Entscheiden · Reflektieren', 800, 690);
  c.fillText(state.total + ' Punkte · ' + stars + ' von 15 Sternen · ' + new Date().toLocaleDateString('de-AT'), 800, 750);
  c.fillStyle = '#d6288c'; c.font = '400 60px Georgia, serif'; c.fillText('★'.repeat(Math.max(1, Math.round(stars / 3))), 800, 850);
  c.fillStyle = '#aab6dd'; c.font = '400 24px "DM Sans", sans-serif'; c.fillText('Spielauszeichnung der HR Future Thinkers Academy, kein Kompetenznachweis', 800, 960);
  return canvas.toDataURL('image/png');
}

/* ---------- Feuerwerk ---------- */

function celebrate(canvas, duration, big = false) {
  if (!canvas?.getContext) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const c = canvas.getContext('2d');
  canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
  canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
  const colors = ['#d6288c', '#ff7cc4', '#ffffff', '#f6a8d2', '#aab6dd', '#ffd36b'];
  const particles = [];
  const burst = (x, y, count) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (big ? 3 : 2) + Math.random() * (big ? 6 : 4);
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color: Math.random() < 0.3 ? colors[Math.floor(Math.random() * colors.length)] : color, size: 2 + Math.random() * 3 });
    }
  };
  if (reduce) {
    for (let i = 0; i < 6; i++) burst(canvas.width * (0.15 + 0.14 * i), canvas.height * 0.35, 40);
    for (const p of particles) { c.fillStyle = p.color; c.fillRect(p.x + p.vx * 18, p.y + p.vy * 18, p.size * 2, p.size * 2); }
    return;
  }
  const end = Date.now() + duration;
  let next = 0;
  const frame = () => {
    const now = Date.now();
    if (now < end && now > next) {
      burst(canvas.width * (0.15 + Math.random() * 0.7), canvas.height * (0.15 + Math.random() * 0.4), big ? 90 : 50);
      next = now + (big ? 380 : 450);
    }
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.985; p.life -= 0.012;
      if (p.life > 0) { c.globalAlpha = p.life; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill(); }
    }
    c.globalAlpha = 1;
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
    if (now < end || particles.length) requestAnimationFrame(frame);
    else c.clearRect(0, 0, canvas.width, canvas.height);
  };
  requestAnimationFrame(frame);
}

/* ---------- Start und Bedienung ---------- */

function startGame() {
  Object.assign(state, { level: 0, total: 0, stars: [], perLevel: [], jokersUsed: 0, correct: 0, answered: 0, final: null, run: null, pending: null, calibration: { sure: 0, sureRight: 0, unsure: 0, unsureRight: 0 } });
  state.pro = Boolean($('pro-mode')?.checked);
  state.started = Date.now();
  state.name = ($('player-name')?.value ?? '').trim().slice(0, 40);
  state.noTimer = Boolean($('no-timer')?.checked);
  renderMap();
}

if ($('start-button')) {
  $('start-button').addEventListener('click', startGame);
  $('map-continue').addEventListener('click', continueFromMap);
  $('next-button').addEventListener('click', nextQuestion);
  $('levelup-next').addEventListener('click', renderMap);
  $('final-start').addEventListener('click', nextFinalQuestion);
  $('retry-button').addEventListener('click', startFinal);
  $('restart-button').addEventListener('click', () => show('screen-start'));
  $('joker-button').addEventListener('click', openJoker);
  for (const button of $('confidence').querySelectorAll('[data-sure]')) button.addEventListener('click', () => confirmChoice(button.dataset.sure === 'true'));
  $('joker-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('joker-prompt').value); $('joker-status').textContent = 'Prompt kopiert.'; }
    catch { $('joker-prompt').select(); $('joker-status').textContent = 'Markiert, kopiere mit Strg+C.'; }
  });
  document.addEventListener('keydown', event => {
    if ($('screen-question').hidden || $('joker-dialog').open || event.target.matches?.('input, textarea') || !gameInView()) return;
    const key = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 }[event.key.toLowerCase()];
    const sureKey = { s: true, u: false }[event.key.toLowerCase()];
    if (sureKey !== undefined && state.pending !== null && !state.answeredCurrent) {
      event.preventDefault();
      confirmChoice(sureKey);
    } else if (key !== undefined && !state.answeredCurrent) {
      const button = $('options').querySelector('[data-index="' + key + '"]');
      if (button && !button.disabled) { event.preventDefault(); button.click(); }
    } else if (event.key === 'Enter' && state.answeredCurrent && document.activeElement !== $('next-button')) {
      event.preventDefault();
      $('next-button').click();
    }
  });
}

/* ---------- Krisenmodus: erfundene Fälle, angelehnt an Muster bekannter Unternehmenskrisen ---------- */

const CRISES = [
  {
    id: 'krise-1', title: 'Die Hinweisgeberin', topic: 'Hinweisgeberschutz', company: 'Lumora Pay',
    setting: 'Lumora Pay ist ein schnell wachsender, börsennotierter Zahlungsdienstleister mit 5.000 Beschäftigten. Die Zahlen sind seit Jahren glänzend, kritische Fragen gelten intern als illoyal.',
    phases: [
      {
        situation: 'Eine Mitarbeiterin aus der Buchhaltung einer Auslandstochter meldet sich vertraulich bei dir. Sie hat Belege gesehen, die darauf hindeuten, dass Umsätze erfunden sein könnten. Sie hat Angst um ihren Job.',
        question: 'Wie reagierst du als HR zuerst?',
        options: [
          { text: 'Vertraulich aufnehmen, ihre Identität schützen und Compliance einschalten', quality: 'best', consequence: 'Der Hinweis landet bei Stellen, die unabhängig prüfen können. Die Mitarbeiterin fühlt sich ernst genommen und bleibt geschützt.' },
          { text: 'Ihren Vorgesetzten um eine Stellungnahme bitten, damit beide Seiten gehört werden', quality: 'bad', consequence: 'Der Vorgesetzte weiß nun, wer gemeldet hat. Belege verschwinden, die Mitarbeiterin wird ausgegrenzt.' },
          { text: 'Abwarten, bis sie belastbare Beweise vorlegen kann, und erst dann handeln', quality: 'bad', consequence: 'Wochen vergehen. Die Mitarbeiterin verliert das Vertrauen und wendet sich später direkt an die Presse.' },
          { text: 'Ihr raten, die Belege selbst weiter zu sammeln und dann wiederzukommen', quality: 'ok', consequence: 'Gut gemeint, aber riskant: Sie bringt sich selbst in Gefahr, und die Verantwortung bleibt bei ihr statt beim Unternehmen.' },
        ],
      },
      {
        situation: 'Der Vorstand erfährt von der Meldung. Er will die Mitarbeiterin wegen „mangelnder Loyalität“ in eine andere Abteilung versetzen und fordert dich auf, das umzusetzen.',
        strained: 'Die Meldung hat sich im Haus herumgesprochen, der Vorstand kennt den Namen der Mitarbeiterin. Er will sie wegen „mangelnder Loyalität“ noch heute versetzen. Sie hat sich krankgemeldet, ihr Team meidet sie.',
        question: 'Was tust du?',
        options: [
          { text: 'Die Versetzung umsetzen, schließlich ist es eine Anweisung des Vorstands', quality: 'bad', consequence: 'Die Versetzung wirkt wie eine Strafe für die Meldung. Andere Beschäftigte lernen: Wer etwas sagt, verliert.' },
          { text: 'Widersprechen, den Hinweisgeberschutz einfordern und den Aufsichtsrat informieren', quality: 'best', consequence: 'Die Benachteiligung wird verhindert. Dein Widerspruch ist dokumentiert und schützt auch dich und das Unternehmen.' },
          { text: 'Neutral bleiben und die Entscheidung über die Versetzung dem Vorstand überlassen', quality: 'bad', consequence: 'Neutralität wirkt hier wie Zustimmung. HR verliert seine Glaubwürdigkeit als Ansprechstelle.' },
          { text: 'Die Versetzung verzögern und hoffen, dass sich das Thema von selbst erledigt', quality: 'ok', consequence: 'Du gewinnst Zeit, aber das Problem bleibt ungelöst und der Druck auf die Mitarbeiterin wächst.' },
        ],
      },
      {
        situation: 'Eine Zeitung berichtet über mögliche Bilanzfälschung. Der Aktienkurs fällt stark. In der Belegschaft herrschen Angst und Gerüchte.',
        strained: 'Eine Zeitung berichtet über mögliche Bilanzfälschung und zitiert interne Quellen, die sich von HR im Stich gelassen fühlen. Der Aktienkurs fällt stark, in der Belegschaft kursieren Namen und Schuldzuweisungen.',
        question: 'Wie kommunizierst du intern?',
        options: [
          { text: 'Vorerst gar nicht, um der laufenden Aufklärung nicht vorzugreifen', quality: 'bad', consequence: 'Das Schweigen füllen Gerüchte. Viele erfahren Neues nur aus der Presse.' },
          { text: 'Die Berichte intern als „Kampagne von Spekulanten“ zurückweisen und Ruhe verlangen', quality: 'bad', consequence: 'Wochen später bestätigen sich die Vorwürfe. Die Belegschaft fühlt sich belogen, das Vertrauen ist zerstört.' },
          { text: 'Offen sagen, was bekannt ist und was nicht, und feste Ansprechstellen nennen', quality: 'best', consequence: 'Die Unsicherheit bleibt, aber die Beschäftigten wissen, woran sie sind und wo sie Fragen stellen können.' },
          { text: 'Eine kurze E-Mail an alle schicken: „Wir prüfen die Vorwürfe sorgfältig.“', quality: 'ok', consequence: 'Besser als nichts, aber ohne Ansprechstellen und weitere Termine bleibt die Belegschaft allein.' },
        ],
      },
      {
        situation: 'Die Vorwürfe bestätigen sich, dem Unternehmen droht die Insolvenz. Viele Beschäftigte fürchten um Gehalt und Zukunft.',
        strained: 'Die Vorwürfe bestätigen sich, dem Unternehmen droht die Insolvenz. Weil intern lange beschwichtigt wurde, glaubt kaum jemand mehr den offiziellen Aussagen. Erste Teams kündigen geschlossen.',
        question: 'Was hat jetzt Vorrang?',
        options: [
          { text: 'Ausstehende Boni des Managements noch schnell auszahlen, bevor Konten gesperrt werden', quality: 'bad', consequence: 'Das wird öffentlich. Empörung in der Belegschaft und Fragen der Behörden folgen.' },
          { text: 'Über Ansprüche informieren, Betriebsrat einbinden, wichtige Wissensträger halten', quality: 'best', consequence: 'Die Menschen wissen, was ihnen zusteht. Wichtiges Wissen für die Aufklärung bleibt im Haus.' },
          { text: 'Einen sofortigen Einstellungsstopp verkünden und alle weiteren Fragen vertagen', quality: 'ok', consequence: 'Kosten sinken, aber die Fragen der Belegschaft bleiben unbeantwortet.' },
          { text: 'Allen offen raten, sich vorsichtshalber schon einen neuen Job zu suchen', quality: 'bad', consequence: 'Gerade die Personen, die für die Aufklärung wichtig wären, gehen zuerst.' },
        ],
      },
    ],
    lessons: ['Hinweisgebende brauchen Vertraulichkeit und Schutz vor Benachteiligung, auch gegenüber dem Vorstand.', 'HR ist nicht neutral, wenn eine Anweisung Hinweisgebende bestraft. Widerspruch gehört dokumentiert.', 'In der Krise schafft ehrliche Information mehr Vertrauen als Beschwichtigung.', 'Eine Kultur, in der kritische Fragen als illoyal gelten, ist selbst ein Frühwarnsignal.'],
    skills: ['grill-me', 'culture-diagnosis', 'stakeholder-negotiation'],
  },
  {
    id: 'krise-2', title: 'Die Zielvorgabe', topic: 'Fehlanreize', company: 'Vantor Motion',
    setting: 'Vantor Motion entwickelt Motorsteuerungen. Ein Entwicklungsteam soll strenge Grenzwerte erreichen, technisch scheint das kaum möglich. 40 % der Boni der Teamleitungen hängen an genau diesen Testwerten.',
    phases: [
      {
        situation: 'Im Austrittsgespräch sagt ein erfahrener Ingenieur: „Die Testwerte stimmen nicht. Wir haben sie passend gemacht, weil sonst niemand seinen Bonus bekommt.“',
        question: 'Was machst du mit dieser Aussage?',
        options: [
          { text: 'Als Frust eines Ausscheidenden einordnen und im Protokoll nicht festhalten', quality: 'bad', consequence: 'Ein ernsthafter Hinweis geht verloren. Das Problem wächst weiter.' },
          { text: 'Den Hinweis anonym im Quartalsbericht zu Austrittsgründen erwähnen', quality: 'ok', consequence: 'Die Information ist festgehalten, aber niemand prüft sie.' },
          { text: 'Den Hinweis genau dokumentieren und vertraulich an Compliance weitergeben', quality: 'best', consequence: 'Eine unabhängige Prüfung beginnt früh, bevor Behörden oder Medien davon erfahren.' },
          { text: 'Den Ingenieur bitten, das Gesagte zum Schutz aller für sich zu behalten', quality: 'bad', consequence: 'Das ist ein Vertuschungsversuch. Wird es später bekannt, steht auch HR in der Verantwortung.' },
        ],
      },
      {
        situation: 'Die Prüfung beginnt. Du schaust dir das Bonussystem an: Wer die Testwerte nicht erreicht, verliert fast die Hälfte des Bonus.',
        strained: 'Der Hinweis wurde nicht weiterverfolgt. Drei Monate später meldet sich eine Behörde wegen auffälliger Testwerte. Unter Zeitdruck prüfst du das Bonussystem: Wer die Werte verfehlt, verliert fast die Hälfte des Bonus.',
        question: 'Wie gehst du mit dem Bonussystem um?',
        options: [
          { text: 'Die Boni erhöhen, damit das Team die Grenzwerte motivierter angeht', quality: 'bad', consequence: 'Der Druck, Werte zu schönen, wird noch größer.' },
          { text: 'Den Bonus an diese Testwerte aussetzen und Qualität mitbewerten', quality: 'best', consequence: 'Der Anreiz zur Manipulation fällt weg. Gute Arbeit zählt wieder mehr als eine Zahl.' },
          { text: 'Das Bonussystem lassen und dem Team eine Ethik-Schulung anbieten', quality: 'ok', consequence: 'Schulung schadet nicht, aber solange der Anreiz bleibt, ändert sich wenig.' },
          { text: 'Am Bonussystem nichts ändern, bis die Prüfung abgeschlossen ist', quality: 'bad', consequence: 'Während der Prüfung geht der Druck weiter und neue Manipulationen sind möglich.' },
        ],
      },
      {
        situation: 'Die Prüfung bestätigt: Testwerte wurden über Jahre manipuliert. Behörden ermitteln. Viele Ingenieurinnen und Ingenieure fürchten, zu Sündenböcken gemacht zu werden.',
        strained: 'Die Prüfung bestätigt: Testwerte wurden über Jahre manipuliert, und das Bonussystem lief unverändert weiter. Behörden ermitteln, Medien berichten. Die Ingenieurinnen und Ingenieure fürchten, zu Sündenböcken gemacht zu werden, und schweigen.',
        question: 'Wie geht HR mit den Beschäftigten im Team um?',
        options: [
          { text: 'Schnell einige beteiligte Ingenieure entlassen, als klares Signal nach außen', quality: 'bad', consequence: 'Die Belegschaft sieht Bauernopfer. Wer etwas weiß, schweigt ab jetzt erst recht.' },
          { text: 'Faire Einzelverfahren, keine Vorverurteilung, auch die Rolle der Führung prüfen', quality: 'best', consequence: 'Die Aufklärung kommt voran, weil Menschen bereit sind zu reden. Verantwortung wird dort gesucht, wo Entscheidungen fielen.' },
          { text: 'Die Namen der Beteiligten intern bekannt geben, um Transparenz zu zeigen', quality: 'bad', consequence: 'Rufschädigung vor jeder Klärung. Rechtliche Risiken und tiefes Misstrauen folgen.' },
          { text: 'Abwarten, was die Behörden entscheiden, und bis dahin intern nichts sagen', quality: 'ok', consequence: 'Rechtlich vorsichtig, aber die Beschäftigten bleiben mit ihrer Angst allein.' },
        ],
      },
      {
        situation: 'Ein Jahr später soll sich die Kultur ändern. Die Geschäftsführung fragt, was HR beitragen kann.',
        strained: 'Ein Jahr später soll sich die Kultur ändern. Doch das Misstrauen ist groß: In der Befragung sagen viele, sie würden Probleme nicht mehr melden. Die Geschäftsführung fragt, was HR beitragen kann.',
        question: 'Was ist dein wichtigster Vorschlag?',
        options: [
          { text: 'Neue Unternehmenswerte formulieren und in allen Gebäuden sichtbar aufhängen', quality: 'bad', consequence: 'Plakate ändern kein Verhalten. Die Belegschaft reagiert mit Zynismus.' },
          { text: 'Eine verpflichtende Integritätsschulung für alle Beschäftigten einführen', quality: 'ok', consequence: 'Ein Anfang, aber ohne Änderungen an Zielen und Führung verpufft die Wirkung.' },
          { text: 'Sichere Meldewege, Ziele ohne Fehlanreize, Konsequenzen auch für die Führung', quality: 'best', consequence: 'Die Rahmenbedingungen ändern sich. Wer Probleme anspricht, wird gehört, und Fehlanreize sind beseitigt.' },
          { text: 'Ein großes Fest zum kulturellen Neustart mit Rede der neuen Führung', quality: 'bad', consequence: 'Nett gemeint, aber es wirkt, als wolle man das Geschehene überspielen.' },
        ],
      },
    ],
    lessons: ['Austrittsgespräche sind eine Quelle für Frühwarnsignale und gehören ernst genommen.', 'Anreizsysteme können Fehlverhalten belohnen. HR gestaltet sie mit und trägt Verantwortung dafür.', 'Faire Verfahren und Schutz vor Vorverurteilung fördern die Aufklärung.', 'Kulturwandel braucht geänderte Ziele und Meldewege, nicht Plakate.'],
    skills: ['strategic-hr-value', 'culture-diagnosis', 'change-in-practice'],
  },
  {
    id: 'krise-3', title: 'Der Videocall', topic: 'Massenkündigung', company: 'Brightloan',
    setting: 'Brightloan ist eine Online-Plattform für Kredite mit 3.000 Beschäftigten. Das Geschäft bricht ein. Der Geschäftsführer will 900 Personen auf einmal kündigen, in einem kurzen Videocall kurz vor den Feiertagen.',
    phases: [
      {
        situation: 'Du bekommst den Plan zwei Wochen vorher: ein dreiminütiger Videocall, danach werden alle Zugänge gesperrt.',
        question: 'Wie reagierst du?',
        options: [
          { text: 'Den Plan umsetzen, der Geschäftsführer hat entschieden und trägt die Verantwortung', quality: 'bad', consequence: 'Du trägst einen Ablauf mit, der Menschen respektlos behandelt und rechtliche Fristen gefährden kann.' },
          { text: 'Bedenken einbringen, Fristen prüfen lassen, einen würdigen Ablauf vorschlagen', quality: 'best', consequence: 'Die Geschäftsführung sieht Risiken und Alternativen. Der Ablauf wird überarbeitet.' },
          { text: 'Die Kündigungen lieber einzeln per E-Mail verschicken, das ist diskreter', quality: 'bad', consequence: 'Noch unpersönlicher. Die Betroffenen erfahren es zwischen Werbung und Newslettern.' },
          { text: 'Den Termin bis zuletzt geheim halten, damit nichts durchsickert', quality: 'ok', consequence: 'Vertraulichkeit ist wichtig, aber ohne Vorbereitung von Führungskräften und Betriebsrat wird es chaotisch.' },
        ],
      },
      {
        situation: 'Die Geschäftsführung ist offen für einen anderen Ablauf. Jetzt geht es um die Gespräche selbst.',
        strained: 'Der Plan wurde eine Woche vor dem Termin intern bekannt. Gerüchte machen die Runde, der Betriebsrat fordert ein Gespräch. Die Geschäftsführung lenkt widerwillig ein, jetzt geht es mit wenig Zeit um die Gespräche selbst.',
        question: 'Wie sollen die Kündigungen ablaufen?',
        options: [
          { text: 'Ein großer Videocall für alle, damit alle es gleichzeitig und schnell erfahren', quality: 'bad', consequence: 'Es geht schnell, doch die Betroffenen fühlen sich wie eine Nummer behandelt.' },
          { text: 'Kleine Gruppen mit der Führungskraft, klare Infos zu Abfindung und Fristen', quality: 'best', consequence: 'Es bleibt schmerzhaft, aber die Menschen werden respektvoll behandelt und wissen, wie es weitergeht.' },
          { text: 'Aus Sicherheitsgründen zuerst alle Zugänge sperren und erst danach informieren', quality: 'bad', consequence: 'Viele merken die Kündigung am gesperrten Laptop. Das wirkt demütigend.' },
          { text: 'Schriftlich und vollständig informieren, mit einer Telefonnummer für Rückfragen', quality: 'ok', consequence: 'Die Information ist korrekt, aber in einem so wichtigen Moment fehlt das persönliche Gespräch.' },
        ],
      },
      {
        situation: 'Trotz allem geht eine Aufnahme eines früheren Calls im Netz viral. Medien berichten, die Arbeitgebermarke leidet.',
        strained: 'Eine Aufnahme geht im Netz viral, Betroffene schildern den Ablauf als demütigend. Medien berichten tagelang, Bewerbungen brechen ein, erste Kundinnen und Kunden kündigen ihre Verträge.',
        question: 'Wie reagiert das Unternehmen?',
        options: [
          { text: 'Öffentlich erklären, dass alle Kündigungen rechtlich korrekt abgelaufen sind', quality: 'bad', consequence: 'Rechtlich vielleicht richtig, menschlich am Thema vorbei. Die Kritik wird lauter.' },
          { text: 'Beschäftigte abmahnen, die die Aufnahme des Videocalls verbreitet haben', quality: 'bad', consequence: 'Das wirkt wie Einschüchterung und macht die nächste Schlagzeile.' },
          { text: 'Gar nichts sagen und warten, bis die Aufregung in den Medien vorbei ist', quality: 'ok', consequence: 'Die Aufregung legt sich irgendwann, aber das Bild eines respektlosen Arbeitgebers bleibt.' },
          { text: 'Fehler eingestehen, sich entschuldigen, Betroffene zusätzlich unterstützen', quality: 'best', consequence: 'Nicht alle sind versöhnt, aber das Unternehmen zeigt, dass es gelernt hat.' },
        ],
      },
      {
        situation: 'Die verbleibenden 2.100 Beschäftigten sind verunsichert. Viele überlegen zu gehen, die Arbeitslast ist gestiegen.',
        strained: 'Die verbleibenden 2.100 Beschäftigten haben die Reaktion des Unternehmens genau verfolgt. Viele trauen der Geschäftsführung nicht mehr, gefragte Fachkräfte haben bereits Angebote, die Arbeitslast ist gestiegen.',
        question: 'Was tut HR jetzt?',
        options: [
          { text: 'Fragerunden mit der Führung, Arbeit neu verteilen, die Stimmung messen', quality: 'best', consequence: 'Die Belegschaft sieht, dass ihre Sorgen ankommen. Die Arbeit wird tragbarer, die Kündigungswelle bleibt aus.' },
          { text: '„Zurück an die Arbeit“ ausrufen und den Blick bewusst nach vorne richten', quality: 'bad', consequence: 'Die Unsicherheit bleibt unausgesprochen. Gerade gute Leute gehen.' },
          { text: 'Einzelnen Top-Leuten diskret Halteprämien zahlen, damit sie sicher bleiben', quality: 'bad', consequence: 'Es spricht sich herum. Die anderen fühlen sich weniger wert.' },
          { text: 'Eine Feier zum Neustart organisieren, damit das Team wieder zusammenfindet', quality: 'ok', consequence: 'Gemeinschaft hilft, ersetzt aber keine Antworten auf offene Fragen.' },
        ],
      },
    ],
    lessons: ['HR muss auch der Geschäftsführung widersprechen, wenn ein Ablauf Menschen respektlos behandelt.', 'Kündigungen gehören in ein persönliches Gespräch mit klaren Informationen.', 'Nach einem Fehler hilft offenes Eingestehen mehr als rechtliche Rechtfertigung.', 'Die Verbleibenden brauchen Aufmerksamkeit, sonst folgt die nächste Welle.'],
    skills: ['stakeholder-negotiation', 'change-in-practice', 'executive-hr-brief'],
  },
];

Object.assign(globalThis, { CRISES, crisisSituation });

function createCrisisRun() {
  return { phase: 0, trust: 50, risk: 50, points: 0, choices: [], strained: false, path: [] };
}

// Eine schwache Entscheidung verschärft die nächste Phase: andere Lage, weniger Spielraum.
const CRISIS_EFFECTS = {
  calm: { best: [15, -15, 100], ok: [5, 0, 40], bad: [-15, 15, 0] },
  strained: { best: [10, -10, 120], ok: [0, 5, 40], bad: [-20, 20, 0] },
};

function crisisSituation(crisis, run) {
  const phase = crisis.phases[run.phase];
  return run.strained && phase.strained ? phase.strained : phase.situation;
}

function chooseCrisisOption(run, option) {
  run.path.push(run.strained ? 'verschärft' : 'ruhig');
  const effect = CRISIS_EFFECTS[run.strained ? 'strained' : 'calm'][option.quality];
  run.trust = Math.max(0, Math.min(100, run.trust + effect[0]));
  run.risk = Math.max(0, Math.min(100, run.risk + effect[1]));
  run.points += effect[2];
  run.choices.push(option.quality);
  run.phase += 1;
  run.strained = option.quality === 'bad';
  return run;
}

function crisisVerdict(run) {
  if (run.trust >= 75 && run.risk <= 25) return { title: 'Krise gemeistert', text: 'Du hast Menschen geschützt, ehrlich kommuniziert und Risiken früh begrenzt.' };
  if (run.trust >= 45 && run.risk <= 55) return { title: 'Krise eingedämmt', text: 'Vieles lief gut, an einigen Stellen hat Zögern oder Mittelmaß Vertrauen gekostet.' };
  return { title: 'Krise eskaliert', text: 'Mehrere Entscheidungen haben Vertrauen zerstört und das Risiko erhöht. Spiel den Fall noch einmal und vergleiche.' };
}

const crisisState = { crisis: null, run: null, options: [] };

function renderCrisisSelect() {
  const list = $('crisis-list');
  list.replaceChildren();
  for (const crisis of CRISES) {
    const button = element('button', 'case-file crisis-card');
    button.type = 'button';
    button.append(element('span', 'case-tab', crisis.topic.toUpperCase()), element('strong', '', crisis.title), element('span', 'case-data', crisis.setting), element('span', 'case-cta', 'Fall spielen →'));
    button.addEventListener('click', () => startCrisis(crisis));
    list.append(button);
  }
  show('screen-crisis-select');
}

function updateMeters(before) {
  const run = crisisState.run;
  for (const [key, goodWhenUp] of [['trust', true], ['risk', false]]) {
    $('meter-' + key).style.width = run[key] + '%';
    $('meter-' + key + '-value').textContent = run[key];
    $('meter-' + key + '-bar').setAttribute('aria-valuenow', String(run[key]));
    const delta = before ? run[key] - before[key] : 0;
    const label = $('meter-' + key + '-delta');
    label.textContent = delta ? (delta > 0 ? '+' : '−') + Math.abs(delta) : '';
    label.className = 'meter-delta' + (delta ? ((delta > 0) === goodWhenUp ? ' good' : ' bad') : '');
  }
}

function describeDelta(before, run) {
  const part = (name, delta) => delta ? name + (delta > 0 ? ' steigt um ' : ' sinkt um ') + Math.abs(delta) : name + ' bleibt gleich';
  return part('Vertrauen', run.trust - before.trust) + ', ' + part('Risiko', run.risk - before.risk) + '.';
}

function startCrisis(crisis) {
  crisisState.crisis = crisis;
  crisisState.run = createCrisisRun();
  $('crisis-title').textContent = crisis.title;
  $('crisis-setting').textContent = crisis.setting;
  crisisState.recap = [];
  presentCrisisPhase();
}

function presentCrisisPhase() {
  const { crisis, run } = crisisState;
  const phase = crisis.phases[run.phase];
  $('crisis-kicker').textContent = 'KRISENFALL · PHASE ' + (run.phase + 1) + ' VON 4';
  const strained = run.strained && Boolean(phase.strained);
  $('crisis-situation').textContent = crisisSituation(crisis, run);
  $('crisis-situation').classList.toggle('strained', strained);
  $('crisis-alert').hidden = !strained;
  $('crisis-question').textContent = phase.question;
  const box = $('crisis-options');
  box.replaceChildren();
  crisisState.options = shuffled(phase.options);
  crisisState.options.forEach((option, index) => {
    const button = element('button', 'option');
    button.type = 'button';
    button.append(element('span', 'option-key', String(index + 1)), element('span', '', option.text));
    button.addEventListener('click', () => chooseCrisis(option, button));
    box.append(button);
  });
  $('crisis-feedback').hidden = true;
  $('crisis-setting-box').open = run.phase === 0;
  updateMeters();
  show('screen-crisis');
}

function chooseCrisis(option, button) {
  if (!$('crisis-feedback').hidden) return;
  const { crisis, run } = crisisState;
  const before = { trust: run.trust, risk: run.risk };
  chooseCrisisOption(run, option);
  for (const other of $('crisis-options').querySelectorAll('.option')) other.disabled = true;
  button.classList.add(option.quality === 'best' ? 'right' : option.quality === 'ok' ? 'partial' : 'wrong');
  const best = crisisState.options.find(item => item.quality === 'best');
  if (option !== best) {
    const index = crisisState.options.indexOf(best);
    $('crisis-options').querySelectorAll('.option')[index]?.classList.add('right');
  }
  $('crisis-verdict').textContent = { best: 'Starke Entscheidung.', ok: 'Vertretbar, aber nicht stark genug.', bad: 'Diese Entscheidung verschärft die Krise.' }[option.quality];
  $('crisis-verdict').className = 'verdict ' + (option.quality === 'best' ? 'ok' : 'no');
  $('crisis-consequence').textContent = describeDelta(before, run) + ' ' + option.consequence + (option !== best ? ' Stärkste Reaktion wäre gewesen: ' + best.text + '.' : '');
  crisisState.recap.push({ question: crisis.phases[run.phase - 1].question, option, best, strained: run.path[run.path.length - 1] === 'verschärft' });
  $('crisis-next').textContent = run.phase === crisis.phases.length ? 'Ergebnis ansehen' : 'Nächste Phase';
  $('crisis-feedback').hidden = false;
  updateMeters(before);
  $('crisis-feedback').scrollIntoView?.({ block: 'center' });
  $('crisis-next').focus({ preventScroll: true });
}

function nextCrisisStep() {
  const { crisis, run } = crisisState;
  if (run.phase < crisis.phases.length) return presentCrisisPhase();
  const verdict = crisisVerdict(run);
  $('crisis-end-title').textContent = verdict.title;
  $('crisis-end-text').textContent = verdict.text + ' Vertrauen der Belegschaft: ' + run.trust + ' von 100. Risiko für das Unternehmen: ' + run.risk + ' von 100.';
  const lessons = $('crisis-lessons');
  lessons.replaceChildren(...crisis.lessons.map(text => element('li', '', text)));
  $('crisis-recap').replaceChildren(...crisisState.recap.map(({ question, option, best, strained }) => {
    const item = element('li');
    if (strained) item.append(element('span', 'recap-strained', 'Lage verschärft'));
    const rating = { best: ['good', 'Stark'], ok: ['mid', 'Vertretbar'], bad: ['bad', 'Schwach'] }[option.quality];
    item.append(element('strong', '', question), element('span', rating[0], rating[1] + ': '), document.createTextNode(option.text));
    if (option !== best) item.append(element('small', '', 'Stärker: ' + best.text));
    return item;
  }));
  $('crisis-academy').href = '#' + crisis.id;
  show('screen-crisis-end');
  if (verdict.title === 'Krise gemeistert') celebrate($('crisis-canvas'), 1600);
}

if ($('crisis-button')) {
  $('crisis-button').addEventListener('click', renderCrisisSelect);
  $('crisis-teaser-button')?.addEventListener('click', renderCrisisSelect);
  document.addEventListener('keydown', event => {
    if ($('screen-crisis').hidden || event.target.matches?.('input, textarea, summary') || !gameInView()) return;
    const index = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 }[event.key.toLowerCase()];
    if (index !== undefined && $('crisis-feedback').hidden) {
      const button = $('crisis-options').querySelectorAll('.option')[index];
      if (button && !button.disabled) { event.preventDefault(); button.click(); }
    } else if (event.key === 'Enter' && !$('crisis-feedback').hidden && document.activeElement?.tagName !== 'BUTTON') {
      event.preventDefault();
      $('crisis-next').click();
    }
  });
  $('crisis-next').addEventListener('click', nextCrisisStep);
  $('crisis-again').addEventListener('click', () => startCrisis(crisisState.crisis));
  for (const id of ['crisis-back', 'crisis-end-back']) $(id).addEventListener('click', renderCrisisSelect);
  $('crisis-home').addEventListener('click', () => show('screen-start'));
  // Direktlinks auf derselben Seite: #spiel-krise (Auswahl) und #spiel-krise-1 bis -3
  const route = (hash = location.hash) => {
    const direct = CRISES.find(crisis => hash === '#spiel-' + crisis.id);
    if (hash === '#spiel-krise') renderCrisisSelect();
    else if (direct) startCrisis(direct);
  };
  route();
  window.addEventListener('hashchange', () => route());
  // Links der Academy kommen auch ohne Hash-Ereignis an (eingebettete Vorschau)
  window.addEventListener('academy-link', event => route('#' + event.detail));
}

// Für Tests und Konsole sichtbar machen, alles andere bleibt im Spiel gekapselt
Object.assign(globalThis, { scoreAnswer, createLevelRun, answerQuestion, useJoker, shuffleQuestion, createFinalRound, finalPassed, createCrisisRun, chooseCrisisOption, crisisVerdict, spielState: state });
})();
