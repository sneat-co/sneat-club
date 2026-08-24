import nx from '@nx/eslint-plugin';
import baseConfig from '../../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // The paired contract/UI packages are deliberately external to this
          // starter workspace and are installed after their first publication.
          ignoredDependencies: [
            'vitest',
            '@sneat/extension-contactus-ui',
            '@sneat/extension-sneatclub-contract',
          ],
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vitest.config.{js,cjs,mjs,ts,cts,mts}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'sneatclub',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'sneatclub',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // Migrated templates predate these a11y rules; tracked for a later pass.
      '@angular-eslint/sneatclub/click-events-have-key-events': 'off',
      '@angular-eslint/sneatclub/interactive-supports-focus': 'off',
    },
  },
];
