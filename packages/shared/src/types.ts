export interface ICard {
  number: number;
  power: unknown;
}

export interface IDeck {
  cards: ICard[];
}

export interface IBoard {
  decks: Record<string, IDeck>;
  cardToChange: ICard | null;
  openCards: ICard[];
  openCardToUse: ICard | null;
}

export interface IGameLobby {
  state: EGameState.LOBBY;
  players: string[];
}


export interface IGamePlaying {
  state: EGameState.PLAYING;
  board: IBoard;
  turn: string;
}

export interface IGameFinished {
  state: EGameState.FINISHED;
  board: IBoard;
  winner: string;
}

export type TGame = IGameLobby | IGamePlaying | IGameFinished;

export enum EGameState {
  LOBBY = 'lobby',
  PLAYING = 'playing',
  FINISHED = 'finished'
}
