export const TV_QUOTES = [
  "I am the one who knocks. — Breaking Bad",
  "Winter is coming. — Game of Thrones",
  "Bazinga! — The Big Bang Theory",
  "We were on a break! — Friends",
  "Identity theft is not a joke, Jim! — The Office",
  "Clear eyes, full hearts, can't lose. — Friday Night Lights",
  "Cool, cool, cool, cool. — Community",
  "Suit up! — How I Met Your Mother",
  "Science, bitch! — Breaking Bad",
  "Bears. Beets. Battlestar Galactica. — The Office"
];

export const APP_QUOTES = [
  "Just one more episode. We both know that's a lie.",
  "Season 1 down. Time for Season 2.",
  "Your binge-watching streak is legendary.",
  "Cliffhanger ahead. Stay tuned.",
  "OTT algorithms are taking notes.",
  "Another season completed. Legend status.",
  "Your TV diary is looking epic.",
  "One more episode before sleep. Definitely."
];

export const FOOTER_QUOTES = [...TV_QUOTES, ...APP_QUOTES];

export const EMPTY_STATES = {
  watchlist: ["Nothing here yet.", "Your TV watchlist is empty."],
  history: ["No TV series logged yet.", "Go watch a show to populate your diary."],
};

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
