import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';
import { Database } from '../_shared/database-types.ts';
import { notifyBoardStateChanged } from '../_shared/notifyBoardStateChanged.ts';
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log('Hello from Functions!');

Deno.serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const authHeader = req.headers.get('Authorization')!;
  const res = (await req.json()) as { boardId: string; cardNumber: number };

  const cardNumber = res.cardNumber;
  const boardId = Number(res.boardId);

  const supabaseClient = createClient<Database>(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const supabaseServiceClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data } = await supabaseClient.auth.getUser();
  const user = data.user;
  if (!user) throw new Error('User not found');

  const { data: boards, error: boardsError } = await supabaseServiceClient.from('board').select('*').eq('id', boardId);
  if (boardsError) throw new Error(boardsError.message);
  const board = boards[0];
  if (!board) throw new Error('Board not found');

  if (board.turn_user_id !== user.id) throw new Error('Turn user is not current user');

  if (board.pulled_card_number_to_change)
    throw new Error('Can not select opened card when card has already been pulled from the deck');
  if (board.opened_card_number_to_use) throw new Error('Opened card number has already been selected');

  const { data: cardsInBoardOpened, error: cardsInBoardOpenedError } = await supabaseServiceClient
    .from('card_in_board_opened')
    .select('*')
    .eq('board_id', boardId)
    .eq('card_number', cardNumber);
  if (cardsInBoardOpenedError) throw new Error(cardsInBoardOpenedError.message);
  const cardToSelect = cardsInBoardOpened[0];

  const { error: boardUpdateError } = await supabaseServiceClient
    .from('board')
    .update({ opened_card_number_to_use: cardToSelect.card_number })
    .eq('id', boardId);
  if (boardUpdateError) throw new Error(boardUpdateError.message);

  const { error: cardsInBoardOpenedDeleteError } = await supabaseServiceClient
    .from('card_in_board_opened')
    .delete()
    .eq('board_id', boardId)
    .eq('card_number', cardNumber);
  if (cardsInBoardOpenedDeleteError) throw new Error(cardsInBoardOpenedDeleteError.message);

  await notifyBoardStateChanged(boardId);

  return new Response(JSON.stringify({ ok: 123 }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pull-card' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjRoeHBzbHhHYllpbE5wbzUiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzAzOTAxODYwLCJpYXQiOjE3MDM4OTgyNjAsImlzcyI6Imh0dHBzOi8vYmp1d3dwc3F1d2FueHZ6cWZxd2suc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6Ijg5N2NiZDJkLWQxZDQtNGMzNC1hYjllLTljNzM1NDI2YmNjNyIsImVtYWlsIjoicmVkaXNoa29AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzAzODk4MjYwfV0sInNlc3Npb25faWQiOiI4ZmRiOTQ5My05ZjgxLTQ2M2EtYTc0MC02NmM0MjA1NzFhZTgifQ.C6x6WmzWCAR96jFXcib0rnC34buAjXmW0EJ4ZlH9aQM' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
