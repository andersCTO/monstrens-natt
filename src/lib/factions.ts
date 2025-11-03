import { Faction, FactionData } from '@/types/game';

export const FACTIONS: Record<Faction, FactionData> = {
  'Vampyr': {
    name: 'Vampyr',
    symbol: '🧛',
    description: 'Odödliga varelser som smyger i nattens skuggor och suger livsenergi ur sina offer.',
    color: 'bg-red-600',
    tellingTales: [
      'Försöker smyga när du går',
      'Rör på huvudet som om du spanar efter något i mörkret',
      'Gör subtila bitande rörelser mot luften'
    ],
    forbiddenWords: [
      'Blod',
      'Hals',
      'Bett',
      'Mörker',
      'Odödlig'
    ],
    favoritePhrases: [
      'Jag vill suga...',
      'Natten är ung',
      'Kom närmare'
    ]
  },
  'Varulv': {
    name: 'Varulv',
    symbol: '🐺',
    description: 'Människor med en vild och farlig förbannelse – vid fullmåne förvandlas de till vargliknande monster.',
    color: 'bg-amber-700',
    tellingTales: [
      'Krafsar dig bakom örat som en hund',
      'Gör snabba, ryckiga huvudrörelser',
      'Kliar dig ofta och aggressivt'
    ],
    forbiddenWords: [
      'Måne',
      'Varg',
      'Yla',      'Päls',
      'Förvandling'
    ],
    favoritePhrases: [
      'Jag känner mig vild ikväll',
      'Instinkterna tar över',
      'Det ligger i naturen'
    ]
  },
  'Häxa': {
    name: 'Häxa',
    symbol: '🔮',
    description: 'Mäktiga utövare av mörk magi, experter på brygder, besvärjelser och förbannelser.',
    color: 'bg-purple-600',
    tellingTales: [
      'Gör cirklar med fingret i luften som om du blandar något',
      'Gör vaga svepande rörelser med händerna',
      'Gestikulerar mystiskt när du pratar'
    ],
    forbiddenWords: [
      'Trolldryck',
      'Besvärjelse',
      'Kruka',
      'Magi',
      'Kvast'
    ],
    favoritePhrases: [
      'Jag har känslan att...',
      'Stjärnorna säger att...',
      'En liten ritual aldrig skadar'
    ]
  },
  'Monsterjägare': {
    name: 'Monsterjägare',
    symbol: '⚔️',
    description: 'Modiga krigare dedikerade till att skydda mänskligheten från övernaturliga hot.',
    color: 'bg-blue-600',
    tellingTales: [
      'Står ofta med armarna i kors och blicken runt rummet',
      'Gör snabba defensiva rörelser med händerna',
      'Håller dig stadigt och balanserat som om du alltid är redo'
    ],
    forbiddenWords: [
      'Vapen',
      'Jakt',
      'Stake',
      'Silver',
      'Skydda'
    ],
    favoritePhrases: [
      'Man kan aldrig vara för försiktig',
      'Jag har sett värre',
      'Var uppmärksam'
    ]
  },
  'De Fördömda': {
    name: 'De Fördömda',
    symbol: '💀',
    description: 'Dömda själar som varken tillhör de levande eller de döda – rastlösa andar med oavslutade angelägenheter.',
    color: 'bg-gray-700',
    tellingTales: [
      'Rör dig långsamt och glidande som om du svävar',
      'Tittar frånvarande förbi folk som om de inte finns',
      'Gör tomma, meningslösa gester i luften'
    ],
    forbiddenWords: [
      'Död',
      'Spöke',
      'Ande',
      'Himmel',
      'Helvete'
    ],
    favoritePhrases: [
      'Jag känner mig tom',
      'Det här känns inte riktigt',
      'Jag väntar på något'
    ]
  }
};

export function getFactionByName(name: Faction): FactionData {
  return FACTIONS[name];
}

export function getAllFactions(): FactionData[] {
  return Object.values(FACTIONS);
}
