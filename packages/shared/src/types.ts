export interface ICard {
  number: number;
  power: unknown;
}

export interface IDeck {
  cards: ICard[];
}

export interface IBoard {
  decks: Record<string, IDeck>;
}
