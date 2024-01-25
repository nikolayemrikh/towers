alter table "public"."card_in_tower" drop constraint "card_in_tower_pkey";

alter table "public"."card_in_board_deck" drop constraint "card_in_board_deck_pkey";

alter table "public"."card_in_board_discard_deck" drop constraint "card_in_board_discard_deck_pkey";

drop index if exists "public"."card_in_tower_pkey";

drop index if exists "public"."card_in_board_deck_pkey";

drop index if exists "public"."card_in_board_discard_deck_pkey";

alter table "public"."card_in_board_deck" add column "id" bigint generated by default as identity not null;

alter table "public"."card_in_board_discard_deck" add column "id" bigint generated by default as identity not null;

alter table "public"."card_in_tower" add column "id" bigint generated by default as identity not null;

alter table "public"."card_in_tower" alter column "card_number" drop identity;

CREATE UNIQUE INDEX card_in_tower_2_pkey ON public.card_in_tower USING btree (id);

CREATE UNIQUE INDEX card_in_board_deck_pkey ON public.card_in_board_deck USING btree (id);

CREATE UNIQUE INDEX card_in_board_discard_deck_pkey ON public.card_in_board_discard_deck USING btree (id);

alter table "public"."card_in_tower" add constraint "card_in_tower_2_pkey" PRIMARY KEY using index "card_in_tower_2_pkey";

alter table "public"."card_in_board_deck" add constraint "card_in_board_deck_pkey" PRIMARY KEY using index "card_in_board_deck_pkey";

alter table "public"."card_in_board_discard_deck" add constraint "card_in_board_discard_deck_pkey" PRIMARY KEY using index "card_in_board_discard_deck_pkey";

