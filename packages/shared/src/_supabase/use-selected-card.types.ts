import { Database } from './database.types';

export type TCardPower = Database['public']['Enums']['Power'];

export type TUseSelectedCardRequest = 
  | IUseSelectedProtectCardRequest
  | IUseSelectedRemoveTopCardRequest
  | IUseSelectedRemoveMiddleCardRequest
  | IUseSelectedRemoveBottomCardRequest;

interface IBaseUseSelectedCardRequest {
  power: TCardPower;
  boardId: string;
}

export interface IUseSelectedProtectCardRequest extends IBaseUseSelectedCardRequest {
  power: 'Protect';
  fisrtCardIndex: number;
  secondCardIndex: number;
}

export interface IUseSelectedRemoveTopCardRequest extends IBaseUseSelectedCardRequest {
  power: 'Remove_top';
}

export interface IUseSelectedRemoveMiddleCardRequest extends IBaseUseSelectedCardRequest {
  power: 'Remove_middle';
}

export interface IUseSelectedRemoveBottomCardRequest extends IBaseUseSelectedCardRequest {
  power: 'Remove_bottom';
}
