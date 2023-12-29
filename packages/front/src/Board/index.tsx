import { useParams } from '@solidjs/router';
import { Deck } from './Deck'
import { IBoard } from "@shared/types";

const board: IBoard = {decks: {asd: {cards: [{number: 81, power: ''}]}}};
console.log(board);

export const Board = () => {
  const { username } = useParams();
  console.log(username);
  
  return <div style={{height: '100%', padding: '16px'}}>
    {/* Decks horizontal list */}
    <div style={{display: 'flex', "flex-direction": "row", "justify-content": "space-between", "padding-left": "8px", "padding-right": "8px"}}>
      <Deck />
      <Deck />
    </div>
  </div>
}
