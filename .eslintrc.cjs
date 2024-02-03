module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
    'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh', 'react', '@typescript-eslint', 'prettier', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    eqeqeq: [1, 'always', { null: 'ignore' }],
    'react-refresh/only-export-components': 'warn',
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    'import/extensions': [
      'error',
      'never',
      {
        'svg': 'always',
        'png': 'always',
        'json': 'always',
      },
    ],
    'import/order': [
      'error',
      {
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'react*',
            group: 'builtin',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['internal', 'builtins'],
        groups: ['builtin', 'external', 'unknown', ['internal', 'parent'], ['sibling', 'index'], 'object'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],
    'react-hooks/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never' }],
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
  overrides: [
    {
      parserOptions: {
        project: ['./packages/front/tsconfig.json', './packages/front/tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
      files: ['./packages/front/**.ts', './packages/front/*.tsx'],
      // Recommended for TS as it has it's own checks - https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      rules: {
        'no-console': 'error',
        'no-undef': 'off',
        '@typescript-eslint/ban-types': 'error',
        /* Naming conventions */
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: true,
            },
          },
          {
            selector: 'typeAlias',
            format: ['PascalCase'],
            custom: {
              regex: '^T[A-Z]',
              match: true,
            },
          },
          {
            selector: 'enum',
            format: ['PascalCase'],
            custom: {
              regex: '^E[A-Z]',
              match: true,
            },
          },
        ],
        '@typescript-eslint/method-signature-style': ['error', 'property'],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'local',
            args: 'after-used',
          },
        ],
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            functions: false,
          },
        ],
        'no-restricted-imports': 'off',
        // '@typescript-eslint/no-restricted-imports': [
        //   'error',
        //   {
        //     patterns: [
        //       {
        //         group: ['../'],
        //         message: 'Usage of relative imports are not allowed',
        //       },
        //     ],
        //   },
        // ],
      },
      // processor: '@graphql-eslint/graphql',
    },
    // {
    //   files: ['*.graphql'],
    //   parser: '@graphql-eslint/eslint-plugin',
    //   plugins: ['@graphql-eslint'],
    //   // rule based on root graphql.config.js
    //   rules: {
    //     '@graphql-eslint/known-type-names': 'error',
    //   },
    // },
    {
      files: ['.eslintrc.cjs'],
      env: { browser: true, es2020: true, node: true },
    },
  ],
};
