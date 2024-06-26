import { Database } from '@supa/functions/_shared/database-types';

export type TCardPower = Database['public']['Enums']['Power'];
export type TCardVariants = Map<number, TCardPower>;
