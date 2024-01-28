import { For, Resource, createSignal, useContext } from 'solid-js';
import { TCardPower, TCardVariants } from '../fetchers/fetchCardVariants/types';
import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';
import { Card } from '../Card';
import { supabase } from '../../supabaseClient';
import { QueryClientContext, createMutation } from '@tanstack/solid-query';
import { getGraphqlQueryKey } from '../../core/graphql/createGetQueryKet';
import { boardQueryDocument } from '../graphql-documents/boardQueryDocument';
import { TUseSelectedCardRequest } from '@supabase/functions/_shared/use-selected-card.types';

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
  boardId: string;
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
      mutationFn: (index: number) => supabase.functions.invoke('change-card-to-pulled', {body: { boardId: props.boardId, index }}),
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
  
  const handleCardClick = async (index: number) => {
    if (props.pulledCardToChange) {
      changeCardToPulledMutation.mutate(index);
      return;
    }
    if (!props.openedCardToUse) throw new Error('Can not make an action when there is no opened card to use');
    const openedCardPower = props.cardVariants.get(props.openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor();
    if (selectedCardIndex === null) {
      switch (openedCardPower) {
        case 'Protect': return setSelectedCardIndex(index);
        case 'Swap_neighbours': return setSelectedCardIndex(index);
        case 'Swap_through_one': return setSelectedCardIndex(index);
        case 'Remove_top': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Remove_top'});
        case 'Remove_middle': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Remove_middle'});
        case 'Remove_bottom': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Remove_bottom'});
        case 'Move_up_by_two': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Move_up_by_two', cardIndex: index });
        case 'Move_down_by_two': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Move_down_by_two', cardIndex: index });
        default: {
          const unhandledPower: never = openedCardPower;
          throw new Error(`Unhandled power "${unhandledPower}"`);
        }
      }
    } else {
      try {
        switch (openedCardPower) {
          case 'Protect': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Protect', fisrtCardIndex: selectedCardIndex, secondCardIndex: index });
          case 'Swap_neighbours': return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Swap_neighbours', fisrtCardIndex: selectedCardIndex, secondCardIndex: index });
          case 'Swap_through_one':  return useSelectedCardMutation.mutate({boardId: props.boardId, power: 'Swap_through_one', fisrtCardIndex: selectedCardIndex, secondCardIndex: index });
          default: throw new Error(`Only one card selection required to make action with power "${openedCardPower}"`);
        }
      } finally {
        setSelectedCardIndex(null);
      }
    }
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

      return (
        <Card
          number={card.node.card_number}
          power={power}
          isActionAvailable={checkIsAvailableForAction(card.node.card_number, power, index(), card.node.is_protected)}
          isProtected={card.node.is_protected}
          onClick={() => handleCardClick(index())}
        />
      )
    }}</For>
  </div>
}
