import { FC, useState } from 'react';

import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';
import { TUseSelectedCardRequest } from '@supa/functions/_shared/use-selected-card-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getGraphqlQueryKey } from '../../core/graphql/createGetQueryKet';
import { supabase } from '../../supabaseClient';
import { Card } from '../Card';
import { TCardVariants } from '../fetchers/fetchCardVariants/types';
import { boardQueryDocument } from '../graphql-documents/boardQueryDocument';
import { checkIsUserCardAvailableForInitialAction } from '../helpers/checkIsUserCardAvailableForInitialAction';

type TN<T> = NonNullable<T>;
type TCards = TN<
  TN<
    TN<TN<TN<BoardCollectionQuery['boardCollection']>['edges']>[0]['node']['card_towerCollection']>['edges']
  >[0]['node']['card_in_towerCollection']
>['edges'];

export const UserTower: FC<{
  id: string;
  boardId: string;
  userId: string;
  cards: TCards;
  cardVariants: TCardVariants;
  openedCardToUse: number | null;
  pulledCardToChange: number | null;
}> = (props) => {
  const { id, boardId, cards, cardVariants, openedCardToUse, pulledCardToChange } = props;
  const [selectedCardIndexAccessor, setSelectedCardIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const changeCardToPulledMutation = useMutation({
    mutationFn: (index: number) =>
      supabase.functions.invoke('change-card-to-pulled', { body: { boardId: boardId, index } }),
    onSuccess: () =>
      queryClient.refetchQueries({ queryKey: [getGraphqlQueryKey(boardQueryDocument), id], exact: true }),
  });

  const useSelectedCardMutation = useMutation({
    mutationFn: (payload: TUseSelectedCardRequest) => supabase.functions.invoke('use-selected-card', { body: payload }),
    onSuccess: () =>
      queryClient.refetchQueries({ queryKey: [getGraphqlQueryKey(boardQueryDocument), id], exact: true }),
  });

  const handleCardClick = async (index: number, isActionAvailable: boolean): Promise<void> => {
    if (!isActionAvailable) return;
    if (pulledCardToChange) {
      changeCardToPulledMutation.mutate(index);
      return;
    }
    if (!openedCardToUse) throw new Error('Can not make an action when there is no opened card to use');
    const selectedOpenedCardPower = cardVariants.get(openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor;
    if (selectedCardIndex === null) {
      switch (selectedOpenedCardPower) {
        case 'Protect':
          return setSelectedCardIndex(index);
        case 'Swap_neighbours':
          return setSelectedCardIndex(index);
        case 'Swap_through_one':
          return setSelectedCardIndex(index);
        case 'Remove_top':
          return useSelectedCardMutation.mutate({ boardId: boardId, power: 'Remove_top' });
        case 'Remove_middle':
          return useSelectedCardMutation.mutate({ boardId: boardId, power: 'Remove_middle' });
        case 'Remove_bottom':
          return useSelectedCardMutation.mutate({ boardId: boardId, power: 'Remove_bottom' });
        case 'Move_up_by_two':
          return useSelectedCardMutation.mutate({ boardId: boardId, power: 'Move_up_by_two', cardIndex: index });
        case 'Move_down_by_two':
          return useSelectedCardMutation.mutate({
            boardId: boardId,
            power: 'Move_down_by_two',
            cardIndex: index,
          });
        default: {
          const unhandledPower: never = selectedOpenedCardPower;
          throw new Error(`Unhandled power "${unhandledPower}"`);
        }
      }
    } else {
      try {
        switch (selectedOpenedCardPower) {
          case 'Protect':
            return useSelectedCardMutation.mutate({
              boardId: boardId,
              power: 'Protect',
              fisrtCardIndex: selectedCardIndex,
              secondCardIndex: index,
            });
          case 'Swap_neighbours':
            return useSelectedCardMutation.mutate({
              boardId: boardId,
              power: 'Swap_neighbours',
              fisrtCardIndex: selectedCardIndex,
              secondCardIndex: index,
            });
          case 'Swap_through_one':
            return useSelectedCardMutation.mutate({
              boardId: boardId,
              power: 'Swap_through_one',
              fisrtCardIndex: selectedCardIndex,
              secondCardIndex: index,
            });
          default:
            throw new Error(`Only one card selection required to make action with power "${selectedOpenedCardPower}"`);
        }
      } finally {
        setSelectedCardIndex(null);
      }
    }
  };

  const checkIsAvailableForAction = (index: number, isProtected: boolean): boolean => {
    if (useSelectedCardMutation.isPending) return false;
    if (pulledCardToChange) return true;
    if (!openedCardToUse) return false;

    const selectedOpenedCardPower = cardVariants.get(openedCardToUse)!;
    const selectedCardIndex = selectedCardIndexAccessor;
    if (selectedCardIndex === null) {
      return checkIsUserCardAvailableForInitialAction(index, isProtected, selectedOpenedCardPower, cards);
    } else {
      switch (selectedOpenedCardPower) {
        case 'Protect':
          return !isProtected && Math.abs(selectedCardIndex - index) === 1;
        case 'Swap_neighbours':
          return !isProtected && Math.abs(selectedCardIndex - index) === 1;
        case 'Swap_through_one':
          return !isProtected && Math.abs(selectedCardIndex - index) === 2;
        default:
          throw new Error(`Action for opened card power "${selectedOpenedCardPower}" can't have second step`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', 'flexDirection': 'column-reverse', gap: '8px' }}>
      {cards.map((card, index) => {
        const power = cardVariants.get(card.node.card_number)!;
        const isActionAvailable = checkIsAvailableForAction(index, card.node.is_protected);
        return (
          <Card
            key={card.node.id}
            number={card.node.card_number}
            power={power}
            isActionAvailable={isActionAvailable}
            isProtected={card.node.is_protected}
            onClick={() => handleCardClick(index, isActionAvailable)}
          />
        );
      })}
    </div>
  );
};
