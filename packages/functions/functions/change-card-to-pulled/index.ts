import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Database } from '../_shared/database.types.ts';
import { corsHeaders } from '../_shared/cors.ts';
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!")


Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  const authHeader = req.headers.get('Authorization')!;
  const { towerId, index } = await req.json() as { towerId: string; index: number };

  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  
  const supabaseServiceClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );  

  const { data } = await supabaseClient.auth.getUser()
  const user = data.user;
  if (!user) throw new Error('User not found');

  const { data: cardsInTower, error: cardsInTowerError } = await supabaseServiceClient.from('card_in_tower').select('*').eq('card_tower_id', towerId).order('id', { ascending: true });
  if (cardsInTowerError) throw new Error(cardsInTowerError.message);

  const cardToChange = cardsInTower[index];

  const { data: cardTowers, error: cardTowersError } = await supabaseServiceClient.from('card_tower').select('*').eq('id', towerId);
  if (cardTowersError) throw new Error(cardTowersError.message);
  const cardTower = cardTowers[0];
  const boardId = cardTower.board_id;
  
  const { data: boards, error: boardsError } = await supabaseServiceClient.from('board').select('*').eq('id', boardId).eq('turn_user_id', user.id);
  if (boardsError) throw new Error(boardsError.message);
  const board = boards[0];
  
  const pulledCardNumberToChange = board.pulled_card_number_to_change;
  if (!pulledCardNumberToChange) throw new Error('Can not chage card when "pulled_card_number_to_change" is not set');

  const { error: cardsInTowersUpdateError } = await supabaseServiceClient.from('card_in_tower').update({ card_number: pulledCardNumberToChange }).eq('id', cardToChange.id);
  if (cardsInTowersUpdateError) throw new Error(cardsInTowersUpdateError.message);

  const { error: boardsUpdateError } = await supabaseServiceClient.from('board').update({ pulled_card_number_to_change: null }).eq('id', boardId);
  if (boardsUpdateError) throw new Error(boardsUpdateError.message);
  
  const { error: cardsInBoardOpenedError } = await supabaseServiceClient.from('card_in_board_opened').insert({ board_id: boardId, card_number: cardToChange.card_number });
  if (cardsInBoardOpenedError) throw new Error(cardsInBoardOpenedError.message);


  return new Response(JSON.stringify({ ok: 123 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pull-card' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjRoeHBzbHhHYllpbE5wbzUiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzAzOTAxODYwLCJpYXQiOjE3MDM4OTgyNjAsImlzcyI6Imh0dHBzOi8vYmp1d3dwc3F1d2FueHZ6cWZxd2suc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6Ijg5N2NiZDJkLWQxZDQtNGMzNC1hYjllLTljNzM1NDI2YmNjNyIsImVtYWlsIjoicmVkaXNoa29AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzAzODk4MjYwfV0sInNlc3Npb25faWQiOiI4ZmRiOTQ5My05ZjgxLTQ2M2EtYTc0MC02NmM0MjA1NzFhZTgifQ.C6x6WmzWCAR96jFXcib0rnC34buAjXmW0EJ4ZlH9aQM' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
