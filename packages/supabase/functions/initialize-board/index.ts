import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';
import { Database } from '../_shared/database-types.ts';

Deno.serve(async (req: Request) => {
  console.log(corsHeaders);

  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const authHeader = req.headers.get('Authorization')!;

  const supabaseClient = createClient<Database>(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData } = await supabaseClient.auth.getUser();
  if (!userData.user) throw new Error('User not found');

  const supabaseServiceClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: usersInLobby, error: usersInLobbySelectError } = await supabaseServiceClient
    .from('user_in_lobby')
    .select('user_id');

  if (!usersInLobby) throw new Error(usersInLobbySelectError.message);

  if (!usersInLobby.length) throw new Error('No users in lobby');

  // create a new board
  const randomUserInLobby = usersInLobby[Math.floor(Math.random() * usersInLobby.length)];
  const { data: boardData, error: boardInsertError } = await supabaseServiceClient
    .from('board')
    .insert({ turn_user_id: randomUserInLobby.user_id })
    .select();
  if (boardInsertError) throw new Error(boardInsertError.message);
  const newBoard = boardData[0];

  // create cards in board deck
  const { data: cardVariants, error: cardVariantsSelectError } = await supabaseServiceClient
    .from('card_variant')
    .select('*');
  if (cardVariantsSelectError) throw new Error(cardVariantsSelectError.message);

  // shuffle card variants
  const cardVariantsToReduce = [...cardVariants];
  const cardsInBoardDeck: Database['public']['Tables']['card_variant']['Row'][] = [];
  while (cardVariantsToReduce.length > 0) {
    const randomIndex = Math.floor(Math.random() * cardVariantsToReduce.length);
    const randomCardVariant = cardVariantsToReduce[randomIndex];
    cardsInBoardDeck.push(randomCardVariant);
    cardVariantsToReduce.splice(randomIndex, 1);
  }

  // create card towers
  const cardTowers: Database['public']['Tables']['card_tower']['Row'][] = [];
  for (const userInLobby of usersInLobby) {
    const { data: cardTowerData, error: cardTowerInsertError } = await supabaseServiceClient
      .from('card_tower')
      .insert({ board_id: newBoard.id, user_id: userInLobby.user_id })
      .select();
    if (cardTowerInsertError) throw new Error(cardTowerInsertError.message);
    const newCardTower = cardTowerData[0];
    cardTowers.push(newCardTower);

    // move cards from board deck to card tower
    // move first 7 cards from board deck to card tower
    const cardsToMoveFromBoardDeck = cardsInBoardDeck.splice(0, 7).sort((a, b) => b.number - a.number);
    for (const cardToMoveFromBoardDeck of cardsToMoveFromBoardDeck) {
      const { error: cardInCardTowerInsertError } = await supabaseServiceClient
        .from('card_in_tower')
        .insert({ card_tower_id: newCardTower.id, card_number: cardToMoveFromBoardDeck.number })
        .select();
      if (cardInCardTowerInsertError) throw new Error(cardInCardTowerInsertError.message);
    }
  }

  // create cards in border deck
  for (const cardInBoardDeck of cardsInBoardDeck) {
    const { error: cardInBoardDeckInsertError } = await supabaseServiceClient
      .from('card_in_board_deck')
      .insert({ board_id: newBoard.id, card_number: cardInBoardDeck.number })
      .select();
    if (cardInBoardDeckInsertError) throw new Error(cardInBoardDeckInsertError.message);
  }

  return new Response(JSON.stringify({ newBoard }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

    curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/initialize-board' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzAzOTM5NTk5LCJpYXQiOjE3MDM5MzU5OTksImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6NTQzMjEvYXV0aC92MSIsInN1YiI6Ijg5N2NiZDJkLWQxZDQtNGMzNC1hYjllLTljNzM1NDI2YmNjNyIsImVtYWlsIjoicmVkaXNoa29AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MDM5MzU5OTl9XSwic2Vzc2lvbl9pZCI6ImExZTNiNDkzLTFmMjAtNDJmZC05YTBhLWRhNTQyZDgwNWUzNSJ9.IwXdSFSAouWLiG-6s7j5Qnwgk4f1ZGmSzFSJtZq_xwQ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
