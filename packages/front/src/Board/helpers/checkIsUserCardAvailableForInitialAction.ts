import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';

import { TCardPower } from '../fetchers/fetchCardVariants/types';

type TN<T> = NonNullable<T>;
type TCards = TN<
  TN<
    TN<TN<TN<BoardCollectionQuery['boardCollection']>['edges']>[0]['node']['card_towerCollection']>['edges']
  >[0]['node']['card_in_towerCollection']
>['edges'];

export const checkIsUserCardAvailableForInitialAction = (
  index: number,
  isProtected: boolean,
  selectedOpenedCardPower: TCardPower,
  cards: TCards
): boolean => {
  switch (selectedOpenedCardPower) {
    case 'Protect':
      return (
        !isProtected && (cards[index + 1]?.node.is_protected === false || cards[index - 1]?.node.is_protected === false)
      );
    case 'Remove_top':
      return index === cards.length - 1;
    case 'Remove_middle':
      return index === (cards.length - 1) / 2;
    case 'Remove_bottom':
      return index === 0;
    case 'Swap_neighbours':
      return (
        !isProtected && (cards[index + 1]?.node.is_protected === false || cards[index - 1]?.node.is_protected === false)
      );
    case 'Swap_through_one':
      return (
        !isProtected && (cards[index + 2]?.node.is_protected === false || cards[index - 2]?.node.is_protected === false)
      );
    case 'Move_up_by_two':
      return (
        !isProtected && (cards[index + 1]?.node.is_protected === false || cards[index + 2]?.node.is_protected === false)
      );
    case 'Move_down_by_two':
      return (
        !isProtected && (cards[index - 1]?.node.is_protected === false || cards[index - 2]?.node.is_protected === false)
      );
    default: {
      const unhandledPower: never = selectedOpenedCardPower;
      throw new Error(`Unhandled power "${unhandledPower}"`);
    }
  }
};
