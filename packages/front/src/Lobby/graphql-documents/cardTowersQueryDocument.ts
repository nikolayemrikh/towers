import { graphql } from '../../__generated__/graphql';

export const cardTowersQueryDocument = graphql(/* GraphQL */ `
  query cardTowers($userId: UUID!) {
    card_towerCollection(filter: { user_id: { eq: $userId } }, orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          created_at
          board {
            id
            turn_user_id
            created_at
          }
        }
      }
    }
  }
`);
