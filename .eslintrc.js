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
    'react/jsx-props-no-spreading': ['off'],
  },
};
