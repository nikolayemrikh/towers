alter table "public"."board" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."card_in_board_deck" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."card_in_board_discard_deck" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."card_in_tower" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."card_tower" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."user_in_lobby" alter column "created_at" set default (now() AT TIME ZONE 'utc'::text);


