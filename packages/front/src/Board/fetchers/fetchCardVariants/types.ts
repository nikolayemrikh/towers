import { Database } from '../../../../../shared/src/_supabase/database.types.ts';

export type TCardPower = Database['public']['Enums']['Power'];
export type TCardVariants = Map<number, TCardPower>;
