import { For, Resource } from 'solid-js';
import { TCardPower, TCardVariants } from '../fetchers/fetchCardVariants/types';

const PowerTitle: Record<TCardPower, string> = {
  Move_down_by_two: 'Move down by two',
  Move_up_by_two: 'Move up by two',
  Protect: 'Protect',
  Remove_bottom: 'Remove bottom',
  Remove_middle: 'Remove middle',
  Remove_top: 'Remove top',
  Swap_neighbours: 'Swap neighbours',
  Swap_through_one: 'Swap through one',
}

export const Tower = (props: {
  id: number;
  userId: string;
  cards: {id: number; card_number: number;}[]
  cardVariants: Resource<TCardVariants>;
}) => {
  return <div style={{display: 'flex', "flex-direction": 'column'}}>
    <For each={props.cards}>{(card) => {
      const cardVariants = props.cardVariants();
      return (
        <div>card {card.card_number} {cardVariants ? PowerTitle[cardVariants.get(card.card_number)!] : null}</div>
      )
    }}</For>
  </div>
}
