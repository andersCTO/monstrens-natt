import { Faction, FactionData } from '@/types/game';

export const FACTIONS: Record<Faction, FactionData> = {
  'Vampyr': {
    name: 'Vampyr',
    symbol: '🧛',
    description: 'Odödliga varelser som smyger i nattens skuggor och suger livsenergi ur sina offer.',
    color: 'bg-red-600',
    tellingTales: [
      'Du känner dig alltid piggare på kvällen än på morgonen',
      'Du har en mystisk motvilja mot vitlök',
      'Du föredrar ditt kött rött, mycket rött'
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
      'Du blir ovanligt uppjagad vid fullmåne',
      'Du har märkligt mycket kroppsbehåring',
      'Du föredrar att äta med händerna'
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
      'Du samlar på ovanliga örter och "ingredienser"',
      'Du pratar ibland med ditt husdjur som om det förstår',
      'Du har en speciell förmåga att "känna" saker innan de händer'
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
      'Du har alltid en kniv eller verktyg på dig "för säkerhets skull"',
      'Du är misstänksam mot nya människor tills de bevisat sig pålitliga',
      'Du känner dig tryggare med ryggen mot väggen'
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
      'Du känner dig ibland "frånkopplad" från världen omkring dig',
      'Du har svårt att komma ihåg vissa perioder av ditt liv',
      'Folk säger ibland att du "ser rakt igenom dem"'
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
