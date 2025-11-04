import { Faction, FactionData } from '@/types/game';

export const FACTIONS: Record<Faction, FactionData> = {
  'Vampyr': {
    name: 'Vampyr',
    symbol: '/factions/vampyr.png',
    description: 'Odödliga varelser som smyger i nattens skuggor och suger livsenergi ur sina offer.',
    color: 'bg-red-600',
    tellingTales: [
      'Försöker smyga när du går',
      'Rör på huvudet som om du spanar efter något i mörkret',
      'Gör subtila bitande rörelser mot luften',
      'Drar fingrarna längs halsen när du pratar',
      'Undviker starkt ljus och solsken',
      'Böjer dig närmare folk när de pratar',
      'Håller dig i skuggorna',
      'Sträcker på nacken och rullar med axlarna',
      'Slickar dig över läpparna ofta',
      'Tittar intensivt på folks halsar'
    ],
    forbiddenWords: [
      'Blod',
      'Hals',
      'Bett',
      'Mörker',
      'Odödlig',
      'Natt',
      'Suga',
      'Vitlök',
      'Fladdermus',
      'Kista'
    ],
    favoritePhrases: [
      'Jag vill suga...',
      'Natten är ung',
      'Kom närmare',
      'Evigheten väntar',
      'Jag törstar',
      'Mörkret lockar',
      'För evigt',
      'Udda timmar passar mig bäst',
      'Ljuset skär i ögonen',
      'Det flyter i ådrorna'
    ]
  },
  'Varulv': {
    name: 'Varulv',
    symbol: '/factions/varulv.png',
    description: 'Människor med en vild och farlig förbannelse – vid fullmåne förvandlas de till vargliknande monster.',
    color: 'bg-amber-700',
    tellingTales: [
      'Krafsar dig bakom örat som en hund',
      'Gör snabba, ryckiga huvudrörelser',
      'Kliar dig ofta och aggressivt',
      'Morrar lågt när du är irriterad',
      'Nynnar och ylar svagt',
      'Luktar på saker och människor',
      'Stampar med fötterna nervöst',
      'Visar tänderna när du ler',
      'Skakar på huvudet som en våt hund',
      'Böjer dig fram i jaktställning'
    ],
    forbiddenWords: [
      'Måne',
      'Varg',
      'Yla',
      'Päls',
      'Förvandling',
      'Fullmåne',
      'Tjuta',
      'Flock',
      'Jakt',
      'Instinkt'
    ],
    favoritePhrases: [
      'Jag känner mig vild ikväll',
      'Instinkterna tar över',
      'Det ligger i naturen',
      'Flockens styrka',
      'Jakten är på',
      'Månen kallar',
      'Vilda nätter',
      'Jag känner doften',
      'Håll dig i flocken',
      'Primitiva känslor'
    ]
  },
  'Häxa': {
    name: 'Häxa',
    symbol: '/factions/haxa.png',
    description: 'Mäktiga utövare av mörk magi, experter på brygder, besvärjelser och förbannelser.',
    color: 'bg-purple-600',
    tellingTales: [
      'Gör cirklar med fingret i luften som om du blandar något',
      'Gör vaga svepande rörelser med händerna',
      'Gestikulerar mystiskt när du pratar',
      'Muttrar lågt för dig själv',
      'Ritar symboler i luften med fingret',
      'Knäpper med fingrarna rituellt',
      'Vickar fram och tillbaka som i trans',
      'Håller händerna som om du håller en osynlig boll',
      'Blåser mjukt mot folk',
      'Pekar dramatiskt åt olika håll'
    ],
    forbiddenWords: [
      'Trolldryck',
      'Besvärjelse',
      'Kruka',
      'Magi',
      'Kvast',
      'Häxa',
      'Trolldom',
      'Ritual',
      'Förbannelse',
      'Ört'
    ],
    favoritePhrases: [
      'Jag har känslan att...',
      'Stjärnorna säger att...',
      'En liten ritual aldrig skadar',
      'Universum visar vägen',
      'Krafterna samlas',
      'Det är skrivet',
      'Jag ser tecken',
      'Brygden är klar',
      'Mystiska vägar',
      'Det ligger i korten'
    ]
  },
  'Monsterjägare': {
    name: 'Monsterjägare',
    symbol: '/factions/monsterjaegare.png',
    description: 'Modiga krigare dedikerade till att skydda mänskligheten från övernaturliga hot.',
    color: 'bg-blue-600',
    tellingTales: [
      'Står ofta med armarna i kors och blicken runt rummet',
      'Gör snabba defensiva rörelser med händerna',
      'Håller dig stadigt och balanserat som om du alltid är redo',
      'Scannar rummet ständigt med blicken',
      'Tar grepp om osynliga vapen',
      'Rör dig tyst och taktiskt',
      'Håller alltid ryggen mot väggen',
      'Gör blockerande rörelser',
      'Står brett och stabilt',
      'Testar grepp och balans'
    ],
    forbiddenWords: [
      'Vapen',
      'Jakt',
      'Stake',
      'Silver',
      'Skydda',
      'Jägare',
      'Svärd',
      'Beskydda',
      'Försvara',
      'Kämpa'
    ],
    favoritePhrases: [
      'Man kan aldrig vara för försiktig',
      'Jag har sett värre',
      'Var uppmärksam',
      'Förbered dig',
      'Vaksamhet är nyckeln',
      'De lurar i mörkret',
      'Jag är redo',
      'Skydda de oskyldiga',
      'Träning betalar sig',
      'Vaksamma ögon'
    ]
  },
  'De Fördömda': {
    name: 'De Fördömda',
    symbol: '/factions/de-fordomda.png',
    description: 'Dömda själar som varken tillhör de levande eller de döda – rastlösa andar med oavslutade angelägenheter.',
    color: 'bg-gray-700',
    tellingTales: [
      'Rör dig långsamt och glidande som om du svävar',
      'Tittar frånvarande förbi folk som om de inte finns',
      'Gör tomma, meningslösa gester i luften',
      'Står stilla alldeles för länge',
      'Rör dig ryckigt som en trasig docka',
      'Tittar tomt rakt fram',
      'Sträcker ut handen som om du vill greppa något',
      'Vajar sakta fram och tillbaka',
      'Låter huvudet falla åt sidan',
      'Försöker röra vid saker men missar'
    ],
    forbiddenWords: [
      'Död',
      'Spöke',
      'Ande',
      'Himmel',
      'Helvete',
      'Begrava',
      'Grav',
      'Själ',
      'Vila',
      'Evig'
    ],
    favoritePhrases: [
      'Jag känner mig tom',
      'Det här känns inte riktigt',
      'Jag väntar på något',
      'Jag glömde något',
      'Tiden betyder inget',
      'Mellan världarna',
      'Oavslutat',
      'Jag kan inte minnas',
      'Förlorad och vilse',
      'Det är kallt här'
    ]
  }
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFactionByName(name: Faction): FactionData {
  return FACTIONS[name];
}

export function getRandomizedFactionData(name: Faction): FactionData {
  const faction = FACTIONS[name];
  return {
    ...faction,
    tellingTales: shuffleArray(faction.tellingTales).slice(0, 3),
    forbiddenWords: shuffleArray(faction.forbiddenWords).slice(0, 5),
    favoritePhrases: shuffleArray(faction.favoritePhrases).slice(0, 3)
  };
}

export function getAllFactions(): FactionData[] {
  return Object.values(FACTIONS);
}
