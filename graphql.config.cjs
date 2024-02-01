// .js file because VSCode extension doesn't support .ts
module.exports = {
  projects: {
    'towers': {
      schema: ['http://localhost:54321/graphql/v1'],
      documents: ['./packages/front/src/**/*.{ts,tsx}'],
    },
  },
};
