import { For } from 'solid-js';

export const Tower = (props: {
  id: number;
  userId: string;
  cards: {id: number; card_number: number;}[]
}) => {
  return <div style={{display: 'flex', "flex-direction": 'column'}}>
    <For each={props.cards}>{(card, idx) => (
      <div>card {card.card_number}</div>
    )}</For>
  </div>
}
