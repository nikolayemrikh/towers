import { graphql } from '../../__generated__/graphql';

export const cardVariantsQueryDocument = graphql(/* GraphQL */ `
  query cardVariants {
    card_variantCollection(first: 100, after: null) {
      edges {
        node {
          power
          number
        }
      }
    }
  }
`);
