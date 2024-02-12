import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { removeCard } from '../_shared/actions/removeCard.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Database } from '../_shared/database-types.ts';
import { notifyBoardStateChanged } from '../_shared/notifyBoardStateChanged.ts';
import { passTurnToNextUser } from '../_shared/passTurnToNextUser.ts';
import { TUseSelectedCardRequest } from '../_shared/use-selected-card-types.ts';

// import { TUseSelectedCardRequest } from '../../../shared/src/_supabase/use-selected-card.types.ts';
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
  const res = (await req.json()) as TUseSelectedCardRequest;

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

  const openedCardNumberToUse = board.opened_card_number_to_use;
  if (!openedCardNumberToUse) throw new Error('No card to use since "opened_card_number_to_use" is not set');

  const { data: cardVariants, error: cardVariantsSelectError } = await supabaseServiceClient
    .from('card_variant')
    .select('*');
  if (cardVariantsSelectError) throw new Error(cardVariantsSelectError.message);

  const cardVariant = cardVariants.find((cardVariant) => cardVariant.number === openedCardNumberToUse);
  if (!cardVariant) throw new Error(`Card variant not found for card with number "${openedCardNumberToUse}"`);

  const power = cardVariant.power;

  const resPower = res.power;
  if (resPower !== power)
    throw new Error(`Can not use card with power "${power}" when power "${res.power}" is requested`);

  const { data: cardTowers, error: cardTowersError } = await supabaseServiceClient
    .from('card_tower')
    .select('*')
    .eq('board_id', boardId);
  if (cardTowersError) throw new Error(cardTowersError.message);
  const cardTower = cardTowers.find((cardTower) => cardTower.user_id === user.id);
  if (!cardTower) throw new Error('Card tower for current user not found');

  const { data: cardsInTower, error: cardsInTowerError } = await supabaseServiceClient
    .from('card_in_tower')
    .select('*')
    .eq('card_tower_id', cardTower.id)
    .order('id', { ascending: true });
  if (cardsInTowerError) throw new Error(cardsInTowerError.message);

  // move used opened card to discard pile
  const { error: cardInBoardDiscardDeckError } = await supabaseServiceClient
    .from('card_in_board_discard_deck')
    .insert({ board_id: boardId, card_number: openedCardNumberToUse });
  if (cardInBoardDiscardDeckError) throw new Error(cardInBoardDiscardDeckError.message);

  switch (resPower) {
    case 'Protect': {
      if (Math.abs(res.fisrtCardIndex - res.secondCardIndex) !== 1)
        throw new Error('Can not protect cards that are not next to each other');
      const firstCard = cardsInTower[res.fisrtCardIndex];
      const secondCard = cardsInTower[res.secondCardIndex];
      const [{ error: updateCardInTowerFirstError }, { error: updateCardInTowerSecondError }] = await Promise.all([
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ is_protected: true })
          .eq('card_tower_id', cardTower.id)
          .eq('id', firstCard.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ is_protected: true })
          .eq('card_tower_id', cardTower.id)
          .eq('id', secondCard.id),
      ]);
      if (updateCardInTowerFirstError) throw new Error(updateCardInTowerFirstError.message);
      if (updateCardInTowerSecondError) throw new Error(updateCardInTowerSecondError.message);
      break;
    }
    case 'Swap_neighbours': {
      if (Math.abs(res.fisrtCardIndex - res.secondCardIndex) !== 1)
        throw new Error('Can not swap cards that are not next to each other');
      const firstCard = cardsInTower[res.fisrtCardIndex];
      const secondCard = cardsInTower[res.secondCardIndex];
      const [{ error: updateCardInTowerFirstError }, { error: updateCardInTowerSecondError }] = await Promise.all([
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: secondCard.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', firstCard.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: firstCard.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', secondCard.id),
      ]);
      if (updateCardInTowerFirstError) throw new Error(updateCardInTowerFirstError.message);
      if (updateCardInTowerSecondError) throw new Error(updateCardInTowerSecondError.message);
      break;
    }
    case 'Swap_through_one': {
      if (Math.abs(res.fisrtCardIndex - res.secondCardIndex) !== 2)
        throw new Error('Can not swap cards that are not next to each other through one card');
      const firstCard = cardsInTower[res.fisrtCardIndex];
      const secondCard = cardsInTower[res.secondCardIndex];
      const [{ error: updateCardInTowerFirstError }, { error: updateCardInTowerSecondError }] = await Promise.all([
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: secondCard.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', firstCard.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: firstCard.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', secondCard.id),
      ]);
      if (updateCardInTowerFirstError) throw new Error(updateCardInTowerFirstError.message);
      if (updateCardInTowerSecondError) throw new Error(updateCardInTowerSecondError.message);
      break;
    }
    case 'Move_down_by_two': {
      const card = cardsInTower[res.cardIndex];
      const nextCard1 = cardsInTower[res.cardIndex - 1];
      const nextCard2 = cardsInTower[res.cardIndex - 2];
      if (!nextCard1 || !nextCard2)
        throw new Error('Can not move down by two cards because there are not enough cards below');
      const [
        { error: updateCardInTowerFirstError },
        { error: updateCardInTowerSecondError },
        { error: updateCardInTowerThirdError },
      ] = await Promise.all([
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: nextCard1.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', card.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: nextCard2.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', nextCard1.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: card.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', nextCard2.id),
      ]);
      if (updateCardInTowerFirstError) throw new Error(updateCardInTowerFirstError.message);
      if (updateCardInTowerSecondError) throw new Error(updateCardInTowerSecondError.message);
      if (updateCardInTowerThirdError) throw new Error(updateCardInTowerThirdError.message);
      break;
    }
    case 'Move_up_by_two': {
      const card = cardsInTower[res.cardIndex];
      const nextCard1 = cardsInTower[res.cardIndex + 1];
      const nextCard2 = cardsInTower[res.cardIndex + 2];
      if (!nextCard1 || !nextCard2)
        throw new Error('Can not move down by two cards because there are not enough cards above');
      const [
        { error: updateCardInTowerFirstError },
        { error: updateCardInTowerSecondError },
        { error: updateCardInTowerThirdError },
      ] = await Promise.all([
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: nextCard1.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', card.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: nextCard2.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', nextCard1.id),
        await supabaseServiceClient
          .from('card_in_tower')
          .update({ card_number: card.card_number })
          .eq('card_tower_id', cardTower.id)
          .eq('id', nextCard2.id),
      ]);
      if (updateCardInTowerFirstError) throw new Error(updateCardInTowerFirstError.message);
      if (updateCardInTowerSecondError) throw new Error(updateCardInTowerSecondError.message);
      if (updateCardInTowerThirdError) throw new Error(updateCardInTowerThirdError.message);
      break;
    }
    case 'Remove_top': {
      await removeCard({ cardIndex: cardsInTower.length - 1, boardId, cardTowers, cardVariants });
      break;
    }
    case 'Remove_middle': {
      await removeCard({ cardIndex: (cardsInTower.length - 1) / 2, boardId, cardTowers, cardVariants });
      break;
    }
    case 'Remove_bottom': {
      await removeCard({ cardIndex: 0, boardId, cardTowers, cardVariants });
      break;
    }
    default: {
      const unhandledPower: never = resPower;
      throw new Error(`Unhandled power "${unhandledPower}"`);
    }
  }

  const { error: boardUpdateError } = await supabaseServiceClient
    .from('board')
    .update({ opened_card_number_to_use: null })
    .eq('id', boardId)
    .eq('turn_user_id', user.id);
  if (boardUpdateError) throw new Error(boardUpdateError.message);

  await passTurnToNextUser(boardId, user.id, cardTowers);

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
