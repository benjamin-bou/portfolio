export type StopType = 'edu' | 'work';

export type Stop = {
  id: string;
  year: string;
  yearStart: number;
  title: string;
  org: string;
  type: StopType;
  altitude: number;
  desc: string;
  city: string;
  ongoing?: boolean;
  side: 'left' | 'right';
};

export const STOPS: Stop[] = [
  {
    id: 'licence',
    year: '2021 — 2024',
    yearStart: 2021,
    title: 'Université',
    org: 'Licence Informatique',
    type: 'edu',
    altitude: 1430,
    desc: 'Algorithmique, systèmes, fondations.',
    city: 'Caen',
    side: 'left',
  },
  {
    id: 'bachelor',
    year: '2024 — 2025',
    yearStart: 2024,
    title: 'My-digital-school',
    org: 'Bachelor Dév. Web',
    type: 'edu',
    altitude: 1850,
    desc: "L'année où j'ai commencé à me sentir développeur.",
    city: 'Rennes',
    side: 'left',
  },
  {
    id: 'cap',
    year: '2024 — 2025',
    yearStart: 2024.3,
    title: 'Cap Achat',
    org: 'Alternant',
    type: 'work',
    altitude: 2317,
    desc: 'Première alternance. Le vrai rythme du métier.',
    city: 'Rennes',
    side: 'right',
  },
  {
    id: 'epitech',
    year: '2025 — 2027',
    yearStart: 2025,
    title: 'Epitech',
    org: 'Master MSc Pro',
    type: 'edu',
    altitude: 2372,
    desc: 'Master en cours.',
    city: 'Rennes',
    ongoing: true,
    side: 'left',
  },
  {
    id: 'spayr',
    year: '2025 — 2027',
    yearStart: 2025.3,
    title: 'Spayr',
    org: 'Alternant full-stack',
    type: 'work',
    altitude: 3050,
    desc: "Développement produit en startup.",
    city: 'Télétravail',
    ongoing: true,
    side: 'right',
  },
];

export const SUMMIT_ALT = 4810;
export const VALLEY_ALT = 1035;
