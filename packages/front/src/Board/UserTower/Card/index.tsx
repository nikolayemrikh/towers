import { TCardPower, TCardVariants } from '@front/Board/fetchers/fetchCardVariants/types';
import { Resource } from 'solid-js';

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

export const Card = (props: {
  number: number;
  power: TCardPower;
  isActionAvailable: boolean;
  isProtected: boolean;
  onClick: () => void;
}) => {
  const { number, power, onClick, isActionAvailable } = props;

  return (
    <div
      onClick={() => onClick()}
      style={{
        display: 'flex',
        "flex-direction": 'column',
        padding: '10px',
        "background-color": isActionAvailable ? 'purple' : 'black',
      }}
    >
      <div>card {number}</div>
        <div>({PowerTitle[power]})</div>
    </div>
  )
}
