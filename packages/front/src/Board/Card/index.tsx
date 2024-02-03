import { TCardPower } from '@front/Board/fetchers/fetchCardVariants/types';

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

export const Card = (props: {
  number: number;
  power: TCardPower;
  isActionAvailable: boolean;
  isProtected: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={() => props.onClick?.()}
      style={{
        display: 'flex',
        'flexDirection': 'column',
        padding: '10px',
        'backgroundColor': props.isActionAvailable ? 'purple' : 'black',
      }}
    >
      <div>card {props.number}</div>
      <div>({PowerTitle[props.power]})</div>
    </div>
  );
};
