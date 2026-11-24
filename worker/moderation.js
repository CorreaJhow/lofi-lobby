// Word filter for chat and names (Portuguese + English).
// Text is normalized before matching so "P0RR4", "pôrra" and "poooorra" all match "porra":
// lowercase, no accents, leetspeak undone, only letters/digits, repeated letters collapsed.
// A short word list never catches everything; kick/ban (admin) covers the rest.

const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 8: "b", "@": "a", $: "s" };

export const normalize = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[0134578@$]/g, (c) => LEET[c])
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");

// whole words (a chat word must be exactly this)
const WORDS = `
porra caralho caralha buceta boceta xoxota xereca xota piroca pica cu cuzao cuzinho
foda fodase fode foder fodido fodida puta puto putas putos putinha putinho putaria
vagabunda vadia arrombado arrombada viado viada viadinho viadagem bicha sapatao punheta siririca
goza gozar gozei gozando porno transar transa safada safado tesao tesuda peituda rabuda
boquete broxa corno otario babaca retardado retardada
fuck fucking fucker shit bitch cunt dick cock pussy porn sex sexy nude nudes boobs tits
penis vagina anal cum horny slut whore rape nigger nigga faggot fag retard hitler nazi
`;
// prefixes (any word starting with this)
const STEMS = "caralh fod punhet putari arromb porn fuck boquet siric xvideo pornhub onlyfan bucet";
// names and brands that are never OK, matched anywhere (spaces and symbols ignored)
const ANYWHERE = `
miakhalifa khalifa kidbengala kitbengala bengala sashagrey johnnysins brazzers onlyfans
xvideos pornhub redtube
`;

const list = (s) => s.split(/\s+/).filter(Boolean).map(normalize);
const WORD_SET = new Set(list(WORDS));
const STEM_LIST = list(STEMS);
const ANYWHERE_LIST = list(ANYWHERE);
// caught even inside a squashed name ("xxporraxx"): only terms that don't show up in normal
// words, so "aviador", "bichano" and "computador" stay fine
const SQUASHED = list("porra caralh buceta boceta xoxota piroca punheta putaria arromb cuzao siririca boquete fuck porn whore faggot nigger hitler");

const badWord = (token) => {
  const n = normalize(token);
  return !!n && (WORD_SET.has(n) || STEM_LIST.some((s) => n.startsWith(s)));
};

// a name is refused if any word is bad, or the whole name (squashed) contains a bad term
export function badName(name) {
  const all = normalize(name);
  if (String(name).split(/[\s._-]+/).some(badWord)) return true;
  return [...ANYWHERE_LIST, ...SQUASHED].some((t) => all.includes(t));
}

// chat: bad words become ***; returns null when the message must not go out at all
export function cleanChat(text) {
  if (ANYWHERE_LIST.some((t) => normalize(text).includes(t))) return null;
  return text.replace(/\S+/g, (tok) => (badWord(tok) ? "*".repeat(Math.min(tok.length, 6)) : tok));
}
