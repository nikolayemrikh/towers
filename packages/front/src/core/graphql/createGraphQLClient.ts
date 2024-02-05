import { GraphQLClient } from 'graphql-request';

import { supabase } from '../../supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const url = `${supabaseUrl}/graphql/v1`;

export const createGraphQLClient = (): GraphQLClient => {
  return new GraphQLClient(url, {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    requestMiddleware: async (req) => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      return {
        ...req,
        headers: {
          ...req.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    },
  });
};
