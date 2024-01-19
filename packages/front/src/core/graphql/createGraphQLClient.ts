import { GraphQLClient } from 'graphql-request';
import { supabase } from '../../supabaseClient';

const url = 'http://localhost:54321/graphql/v1'

export const createGraphQLClient = (): GraphQLClient => {
  return new GraphQLClient(url, {
    requestMiddleware: async (req) => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      return {
        ...req,
        headers: {
          ...req.headers,
          Authorization: `Bearer ${token}`
        }
      };
    },
  });
};