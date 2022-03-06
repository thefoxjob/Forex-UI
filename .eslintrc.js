module.exports = {
  extends: [require.resolve('@thirtyfox/starbase.eslint-config-react/javascript')],
  overrides: [
    {
      extends: [require.resolve('@thirtyfox/starbase.eslint-config-react/typescript')],
      files: ['**/*.d.ts', '**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
      },
      settings: {
        'import/resolver': {
          typescript: {},
        },
      },
    },
  ],
  rules: {
    'func-names': ['warn', 'as-needed'],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'gulpfile.ts', 'postcss.config.js', './tailwind.config.js', './vite.config.ts',
      ],
    }],
    'object-curly-newline': ['error', {
      ObjectExpression: { minProperties: 8, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 8, multiline: true, consistent: true },
      ImportDeclaration: { minProperties: 8, multiline: true, consistent: true },
      ExportDeclaration: { minProperties: 8, multiline: true, consistent: true },
    }],
    'react/jsx-props-no-spreading': ['off'],
  },
};
