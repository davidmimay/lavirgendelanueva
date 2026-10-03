export interface Comun {
  novenaTitle: string,
  noteStart: string;
  warningTitle: string;
  warningContent: string;
  comunTitle: string;
  comunText: string;
  padreTitle: string;
  padreText: string;
  salutacionTitle: string;
  salutacionText: string;
  salutacionText2: string;
  salutacionText3: string;
  oremusTitle: string;
  oremusText: string;
  gozosTitle: string;
  gozosText: string;
  gozosQuote: string;
  notePetition: string;
  ourFatherTitle: string;
  ourFatherContent: string;
  hailMaryTitle: string;
  hailMaryContent: string;
  day: Concreta[];
};

export interface Concreta {
  date: string;
  title: string;
  subtitle: string;
  text: string;
  gozo: string;
};