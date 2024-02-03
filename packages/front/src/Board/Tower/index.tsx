import { BoardCollectionQuery } from '@front/__generated__/graphql/graphql';

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
};

type TN<T> = NonNullable<T>;
type TCards = TN<
  TN<
    TN<TN<TN<BoardCollectionQuery['boardCollection']>['edges']>[0]['node']['card_towerCollection']>['edges']
  >[0]['node']['card_in_towerCollection']
>['edges'];

export const Tower = (props: { id: string; userId: string; cards: TCards; cardVariants: TCardVariants }) => {
  return (
    <div style={{ display: 'flex', 'flexDirection': 'column' }}>
      {props.cards.map((card) => {
        return (
          <div key={card.node.id}>
            card {card.node.card_number} ({PowerTitle[props.cardVariants.get(card.node.card_number)!]})
          </div>
        );
      })}
    </div>
  );
};
