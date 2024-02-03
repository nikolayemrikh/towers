import { graphql } from '../../__generated__/graphql';

export const boardQueryDocument = graphql(/* GraphQL */ `
  query boardCollection($boardId: BigInt!) {
    boardCollection(filter: { id: { eq: $boardId } }) {
      edges {
        node {
          id
          pulled_card_number_to_change
          opened_card_number_to_use
          turn_user_id
          card_towerCollection {
            edges {
              node {
                id
                user_id
                card_in_towerCollection {
                  edges {
                    node {
                      id
                      card_number
                      is_protected
                    }
                  }
                }
              }
            }
          }
          card_in_board_deckCollection {
            edges {
              node {
                id
                card_number
              }
            }
          }
          card_in_board_openedCollection {
            edges {
              node {
                id
                card_number
              }
            }
          }
          card_in_board_discard_deckCollection {
            edges {
              node {
                id
                card_number
              }
            }
          }
        }
      }
    }
  }
`);
