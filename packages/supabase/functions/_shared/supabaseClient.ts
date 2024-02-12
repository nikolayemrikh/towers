// eslint-disable-next-line import/extensions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

import { Database } from './database-types.ts';

export const supabaseClient = createClient<Database>(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
