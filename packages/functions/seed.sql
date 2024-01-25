--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000000', '897cbd2d-d1d4-4c34-ab9e-9c735426bcc7', 'authenticated', 'authenticated', 'redishko@gmail.com', '$2a$10$qX5rpXgtFTVa960oO1vcmeTefFQZXOMfclH0/ix08BROgGRDKPQXq', '2023-12-30 00:13:29.21078+00', NULL, '', NULL, '', '2023-12-30 01:04:10.362261+00', '', '', NULL, '2023-12-30 01:04:20.416901+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-12-30 00:13:29.204753+00', '2023-12-30 01:04:20.418497+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('897cbd2d-d1d4-4c34-ab9e-9c735426bcc7', '897cbd2d-d1d4-4c34-ab9e-9c735426bcc7', '{"sub": "897cbd2d-d1d4-4c34-ab9e-9c735426bcc7", "email": "redishko@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2023-12-30 00:13:29.207087+00', '2023-12-30 00:13:29.207161+00', '2023-12-30 00:13:29.207161+00', '0240ef5c-e603-4eff-84fa-66bf455cea22');



--
-- Data for Name: card_variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."card_variant" ("number", "power") VALUES
	(1, 'Move_up_by_two'),
	(2, 'Remove_top'),
	(68, 'Move_down_by_two'),
	(47, 'Move_up_by_two'),
	(17, 'Swap_through_one'),
	(66, 'Move_up_by_two'),
	(41, 'Remove_bottom'),
	(13, 'Remove_bottom'),
	(29, 'Move_up_by_two'),
	(74, 'Remove_middle'),
	(52, 'Swap_neighbours'),
	(14, 'Protect'),
	(46, 'Remove_middle'),
	(83, 'Remove_bottom'),
	(57, 'Move_up_by_two'),
	(42, 'Protect'),
	(48, 'Remove_bottom'),
	(37, 'Remove_top'),
	(58, 'Remove_top'),
	(71, 'Swap_neighbours'),
	(43, 'Swap_neighbours'),
	(39, 'Remove_middle'),
	(60, 'Remove_middle'),
	(24, 'Swap_neighbours'),
	(12, 'Move_down_by_two'),
	(32, 'Remove_middle'),
	(59, 'Move_down_by_two'),
	(79, 'Remove_top'),
	(19, 'Move_up_by_two'),
	(25, 'Remove_middle'),
	(82, 'Swap_through_one'),
	(55, 'Remove_bottom'),
	(33, 'Swap_neighbours'),
	(67, 'Remove_middle'),
	(5, 'Swap_neighbours'),
	(75, 'Move_up_by_two'),
	(54, 'Swap_through_one'),
	(23, 'Remove_top'),
	(22, 'Move_down_by_two'),
	(44, 'Remove_top'),
	(16, 'Remove_top'),
	(50, 'Move_down_by_two'),
	(21, 'Protect'),
	(49, 'Protect'),
	(76, 'Remove_bottom'),
	(8, 'Swap_through_one'),
	(31, 'Move_down_by_two'),
	(35, 'Protect'),
	(9, 'Remove_top'),
	(15, 'Swap_neighbours'),
	(30, 'Remove_top'),
	(61, 'Swap_neighbours'),
	(53, 'Remove_middle'),
	(63, 'Protect'),
	(6, 'Remove_bottom'),
	(80, 'Swap_neighbours'),
	(72, 'Remove_top'),
	(7, 'Protect'),
	(84, 'Protect'),
	(26, 'Swap_through_one'),
	(77, 'Protect'),
	(70, 'Protect'),
	(51, 'Remove_top'),
	(3, 'Move_down_by_two'),
	(81, 'Remove_middle'),
	(11, 'Remove_middle'),
	(18, 'Remove_middle'),
	(64, 'Swap_through_one'),
	(65, 'Remove_top'),
	(4, 'Remove_middle'),
	(69, 'Remove_bottom'),
	(20, 'Remove_bottom'),
	(10, 'Move_up_by_two'),
	(62, 'Remove_bottom'),
	(40, 'Move_down_by_two'),
	(38, 'Move_up_by_two'),
	(28, 'Protect'),
	(78, 'Move_down_by_two'),
	(27, 'Remove_bottom'),
	(34, 'Remove_bottom'),
	(36, 'Swap_through_one'),
	(45, 'Swap_through_one'),
	(56, 'Protect'),
	(73, 'Swap_through_one');

INSERT INTO "public"."user_in_lobby" ("user_id") VALUES ('897cbd2d-d1d4-4c34-ab9e-9c735426bcc7');