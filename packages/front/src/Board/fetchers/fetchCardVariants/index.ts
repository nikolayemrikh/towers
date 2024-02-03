import { supabase } from '../../../supabaseClient';

import { TCardVariants } from './types';

export const fetchCardVariants = async (): Promise<TCardVariants> => {
  const { data, error } = await supabase.from('card_variant').select('number, power');
  if (error) throw new Error(error.message);
  return new Map(data.map(({ number, power }) => [number, power]));
};
