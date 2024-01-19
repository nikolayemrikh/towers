import type { DefinitionNode, OperationDefinitionNode } from 'graphql/language/ast';

export const getGraphqlQueryKey = (queryDocument: { definitions: readonly DefinitionNode[] }): string => {
  const key = (queryDocument.definitions[0] as OperationDefinitionNode)?.name?.value;

  if (!key) {
    const error = new Error('Query should have name');
    throw error;
  }

  return key;
};
