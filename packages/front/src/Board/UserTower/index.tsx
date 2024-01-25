import { For, Resource, createSignal, useContext } from 'solid-js';
import { TCardPower, TCardVariants } from '../fetchers/fetchCardVariants/types';
import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';
import { Card } from '../Card';
import { supabase } from '../../supabaseClient';
import { QueryClientContext, createMutation } from '@tanstack/solid-query';
import { getGraphqlQueryKey } from '../../core/graphql/createGetQueryKet';
import { boardQueryDocument } from '../graphql-documents/boardQueryDocument';
import { TUseSelectedCardRequest } from '@shared/_supabase/use-selected-card.types';

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

export const UserTower = (props: {
  id: string;
  userId: string;
  cards: TCards
  cardVariants: TCardVariants;
  openedCardToUse: number | null;
  pulledCardToChange: number | null;
}) => {
  const [selectedCardIndexAccessor, setSelectedCardIndex] = createSignal<number | null>(null);
  const queryClient = useContext(QueryClientContext);

  const createChangeCardToPulledMutation = () => {
    return createMutation(() => ({
      mutationFn: (index: number) => supabase.functions.invoke('change-card-to-pulled', {body: { towerId: props.id, index }}),
      onSuccess: () => queryClient?.().refetchQueries({ queryKey: [getGraphqlQueryKey(boardQueryDocument), props.id], exact: true }),
    }))
  }

  const changeCardToPulledMutation = createChangeCardToPulledMutation()
  
  const createUseSelectedCardMutation = () => {
    return createMutation(() => ({
      mutationFn: (payload: TUseSelectedCardRequest) => supabase.functions.invoke('use-selected-card', {body: payload}),
      onSuccess: () => queryClient?.().refetchQueries({ queryKey: [getGraphqlQueryKey(boardQueryDocument), props.id], exact: true }),
    }))
  }

  const useSelectedCardMutation = createUseSelectedCardMutation()
  
  const makeAction = async (index: number) => {
    if (props.pulledCardToChange) {
      changeCardToPulledMutation.mutate(index);
      return;
    }
    if (!props.openedCardToUse) throw new Error('Can not make an action when there is no opened card to use');
    const openedCardPower = props.cardVariants.get(props.openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor();
    if (selectedCardIndex === null) {
      if (openedCardPower === 'Protect') return setSelectedCardIndex(index);
      if (openedCardPower === 'Swap_neighbours') return setSelectedCardIndex(index);
      if (openedCardPower === 'Swap_through_one') return setSelectedCardIndex(index);
      return;
    }
    // make action
    useSelectedCardMutation.mutate({boardId: 'asd', power: 'Protect', fisrtCardIndex: selectedCardIndex, secondCardIndex: index })
  };

  const checkIsAvailableForAction = (number: number, power: TCardPower, index: number, isProtected: boolean): boolean => {  
    if (props.pulledCardToChange) return true;
    if (props.openedCardToUse) {
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
    return false;
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
