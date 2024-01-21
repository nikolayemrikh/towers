import { For, Resource, createSignal } from 'solid-js';
import { TCardPower, TCardVariants } from '../fetchers/fetchCardVariants/types';
import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';
import { Card } from './Card';

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

type TN<T> = NonNullable<T>;
type TCards = TN<TN<TN<TN<TN<BoardCollectionQuery['boardCollection']>['edges']>[0]['node']['card_towerCollection']>['edges']>[0]['node']['card_in_towerCollection']>['edges'];

enum ECardAction {
  ReplaceWithPulledCard = 'ReplaceWithPulledCard',
  UseOpenedCardStart = 'UseOpenedCardStart',
  UseOpenedCardConfirm = 'UseOpenedCardConfirm',
}

export const UserTower = (props: {
  id: string;
  userId: string;
  cards: TCards
  cardVariants: TCardVariants;
  openedCardToUse: number | null;
}) => {
  const [selectedCardIndexAccessor, setSelectedCardIndex] = createSignal<number | null>(null)
  
  const makeAction = async (index: number) => {
    if (!props.openedCardToUse) throw new Error('Can not make an action when there is no opened card to use');
    const openedCardPower = props.cardVariants.get(props.openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor();
    if (selectedCardIndex === null) {
      if (openedCardPower === 'Protect') return setSelectedCardIndex(index);
      if (openedCardPower === 'Swap_neighbours') return setSelectedCardIndex(index);
      if (openedCardPower === 'Swap_through_one') return setSelectedCardIndex(index);
    }
    // make action
  };

  const checkIsAvailableForAction = (number: number, power: TCardPower, index: number, isProtected: boolean): boolean => {
    if (!props.openedCardToUse) return false;
    const openedCardPower = props.cardVariants.get(props.openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor();
    if (selectedCardIndex === null) {
      if (openedCardPower === 'Protect') return !isProtected;
      if (openedCardPower === 'Remove_top') return index === 0;
      if (openedCardPower === 'Remove_middle') return index === 3;
      if (openedCardPower === 'Remove_bottom') return index === 6;
      if (openedCardPower === 'Swap_neighbours') return !isProtected && (!props.cards[index + 1]?.node.is_protected || !props.cards[index - 1]?.node.is_protected);
      if (openedCardPower === 'Swap_through_one') return !isProtected && (!props.cards[index + 2]?.node.is_protected || !props.cards[index - 2]?.node.is_protected);
      if (openedCardPower === 'Move_up_by_two') return !isProtected && (!props.cards[index + 1]?.node.is_protected || !props.cards[index + 2]?.node.is_protected);
      if (openedCardPower === 'Move_down_by_two') return !isProtected && (!props.cards[index - 1]?.node.is_protected || !props.cards[index - 2]?.node.is_protected);
    } else {
      if (openedCardPower === 'Protect') return Math.abs(selectedCardIndex - index) === 1;
      if (openedCardPower === 'Swap_neighbours') return !isProtected && Math.abs(selectedCardIndex - index) === 1;
      if (openedCardPower === 'Swap_through_one') return !isProtected && Math.abs(selectedCardIndex - index) === 2;
      throw new Error(`Action for opened card power "${openedCardPower}" can't have second step`);
    }
  }

  return <div style={{display: 'flex', "flex-direction": 'column', gap: '8px'}}>
    <For each={props.cards}>{(card, index) => {
      const power = props.cardVariants.get(card.node.card_number)!

      // @TODO add is_protected to card_in_tower
      // const isProtected = card.node.is_protected;
      const isProtected = false;
      return (
        <Card
          number={card.node.card_number}
          power={power}
          isActionAvailable={checkIsAvailableForAction(card.node.card_number, power, index(), isProtected)}
          isProtected={isProtected}
          onClick={() => makeAction(index())}
        />
        // <div
        //   onClick={() => makeAction(card.node.id)}
        //   style={{display: 'flex', "flex-direction": 'column', padding: '10px', "background-color": 'black' }}>
        //   <div>card {card.node.card_number}</div>
        //   <div>({cardVariants ? PowerTitle[cardVariants.get(card.node.card_number)!] : null})</div>
        // </div>
      )
    }}</For>
  </div>
}
