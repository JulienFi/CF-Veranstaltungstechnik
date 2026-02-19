export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Wie viel Vorlaufzeit sollten wir einplanen?',
    answer:
      'Fuer Veranstaltungen mit Full-Service empfehlen wir 3 bis 6 Wochen Vorlauf. Kurzfristige Termine sind moeglich, sofern Technik und Team verfuegbar sind.',
  },
  {
    question: 'Uebernehmen Sie Aufbau und Abbau?',
    answer:
      'Ja. Auf Wunsch uebernehmen wir Lieferung, Aufbau, technischen Betrieb waehrend der Veranstaltung und den kompletten Abbau.',
  },
  {
    question: 'In welchem Einsatzgebiet sind Sie unterwegs?',
    answer:
      'Unser Schwerpunkt liegt auf Berlin und Brandenburg. Einsaetze ausserhalb der Region pruefen wir gerne individuell.',
  },
  {
    question: 'Arbeiten Sie fuer Privatkunden und Geschaeftskunden?',
    answer:
      'Ja, wir betreuen beide Zielgruppen. Von der privaten Feier bis zum Corporate Event erhalten Sie eine passende Loesung.',
  },
  {
    question: 'Wie funktioniert die Preisgestaltung?',
    answer:
      'Im Mietshop finden Sie je nach Produkt ab-Preise oder Richtwerte. Das finale Angebot wird auf Umfang, Laufzeit, Logistik und Servicelevel abgestimmt.',
  },
];
