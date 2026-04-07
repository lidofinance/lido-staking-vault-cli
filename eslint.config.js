// @ts-check
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import importX from 'eslint-plugin-import-x'
import promise from 'eslint-plugin-promise'
import vitest from '@vitest/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig(
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'docs/**', 'scripts/**', 'coverage/**', '**/*.cjs'],
  },

  // ── TypeScript source files ──────────────────────────────────────────────────
  // `files` + `extends` scopes every extended config to *.ts only —
  // prevents type-checking rules from firing on plain .js files.
  {
    files: ['**/*.ts'],
    extends: [
      // typescript-eslint/recommended (non-type-aware base).
      // We deliberately avoid recommendedTypeChecked: the codebase predates
      // no-unsafe-* enforcement; those ~500 issues are tracked separately.
      ...tseslint.configs.recommended,
      // SonarJS (flat-config native in v4)
      // @ts-expect-error - sonarjs v4 has configs but types are incomplete
      sonarjs.configs.recommended,
      // Import analysis with TypeScript resolver
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      // Promise best-practices
      promise.configs['flat/recommended'],
    ],
    plugins: { unicorn },
    languageOptions: {
      // projectService uses TypeScript's native Project Service APIs (same as VS Code)
      // for type-aware rules (no-misused-promises, switch-exhaustiveness-check, etc.)
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ── Unicorn (selective) ──────────────────────────────────────────────────
      // Spread the full recommended set then disable what's too noisy or not
      // relevant for this CLI codebase.
      ...unicorn.configs.recommended.rules,

      'unicorn/expiring-todo-comments': 'off',
      // Style — 234 existing numeric literals would need separators; defer.
      'unicorn/numeric-separators-style': 'off',
      // Paradigm shift; codebase uses null extensively.
      'unicorn/no-null': 'off',
      // Too noisy in CLI codebases; abbreviations are common.
      'unicorn/prevent-abbreviations': 'off',
      // process.exit() is intentional in CLI tools.
      'unicorn/no-process-exit': 'off',
      // Common pattern throughout the codebase.
      'unicorn/no-await-expression-member': 'off',
      // Not always safe in ESM libraries called by consumers.
      'unicorn/prefer-top-level-await': 'off',
      // Too opinionated; leads to less readable code in some cases.
      'unicorn/no-negated-condition': 'off',
      // Overly strict; useful callbacks like `Boolean` are not always replaceable.
      'unicorn/no-array-callback-reference': 'off',
      // Used intentionally in functional pipelines throughout the codebase.
      'unicorn/no-array-reduce': 'off',
      // Codebase uses Array#sort() in-place; migration to toSorted() tracked separately.
      'unicorn/no-array-sort': 'off',
      // BigInt literal syntax (1n) may not always be preferred over BigInt().
      'unicorn/prefer-bigint-literals': 'off',
      // PascalCase ABI/contract files are conventional in this project.
      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, pascalCase: true } },
      ],
      // Allow 'error', 'err' and 'e' as catch variable names.
      'unicorn/catch-error-name': [
        'error',
        { name: 'error', ignore: ['^err$', '^e$'] },
      ],

      // ── TypeScript (explicit set — not from recommendedTypeChecked) ──────────
      '@typescript-eslint/no-explicit-any': 'off', // legacy any usage in codebase
      '@typescript-eslint/require-await': 'off',
      // Allow `!flag && doThing()` short-circuit patterns used throughout the code
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Type-aware rules we explicitly want (need parserOptions.project above)
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // ban-ts-comment is already 'error' in tseslint.configs.recommended

      // ── Core ESLint rules ────────────────────────────────────────────────────
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'info', 'debug', 'table'] },
      ],
      'func-style': ['error', 'expression'],
      'no-var': 'error',
      'prefer-const': 'error',

      // ── Import-x ─────────────────────────────────────────────────────────────
      // False positives: import-x can't resolve *.js→*.ts re-exports
      'import-x/export': 'off',
      'import-x/no-named-as-default-member': 'off', // noisy with re-exports
      'import-x/no-named-as-default': 'off', // noisy with TypeScript re-exports
      'import-x/no-cycle': ['error', { maxDepth: 1 }],

      // ── SonarJS overrides ───────────────────────────────────────────────────
      // Duplicate of @typescript-eslint/no-unused-vars
      'sonarjs/no-unused-vars': 'off',
      // False positives: SonarJS does not read TypeScript types/narrowing,
      // null safety is already enforced by TypeScript strictNullChecks.
      'sonarjs/null-dereference': 'off',
      // False positives on generics: TypeScript enforces argument types natively.
      'sonarjs/argument-type': 'off',
      // False positives on `keyof T & string` pattern — standard TS idiom
      // for narrowing keyof to string keys; use Extract<keyof T, string> as alternative.
      'sonarjs/no-useless-intersection': 'off',
      // "Hard" ruleset only; too strict for migration
      'sonarjs/cognitive-complexity': 'off',
      // Informational; not an actionable lint error
      'sonarjs/todo-tag': 'off',
      // Too noisy; commented-out code is common during dev
      'sonarjs/no-commented-code': 'off',
      // Math.random() used for non-security purposes (chart colors); suppress inline
      'sonarjs/pseudo-random': 'warn',
      // Nested ternaries are style choice; codebase uses them intentionally
      'sonarjs/no-nested-conditional': 'off',
      // reduce() initial value is context-dependent
      'sonarjs/reduce-initial-value': 'off',
      // Computed namespace access is a valid TypeScript pattern
      'import-x/namespace': 'off',
      // Defensive bigint/type checks trigger false positives
      'sonarjs/different-types-comparison': 'off',
      // Suppress inline where needed (e.g. Anvil spawn in dev-tools)
      // 'sonarjs/no-os-command-from-path' — uses recommended default (enabled)
      // void operator used intentionally for fire-and-forget
      'sonarjs/void-use': 'off',
      // Always-same return is intentional in some callbacks
      'sonarjs/no-invariant-returns': 'off',
      // Named import style for node built-ins is project convention
      'unicorn/import-style': 'off',

      // ── Promise overrides ───────────────────────────────────────────────────
      'promise/param-names': [
        'warn',
        {
          resolvePattern: '^_?(resolve)$|^_$',
          rejectPattern: '^_?(reject)$|^_$',
        },
      ],
    },
  },

  // ── Test file overrides ──────────────────────────────────────────────────────
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    extends: [vitest.configs.recommended],
    rules: {
      // Stricter than recommended defaults
      'vitest/max-nested-describe': ['error', { max: 3 }],
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expect*'] },
      ],
      'vitest/no-standalone-expect': [
        'error',
        {
          additionalTestBlockFunctions: [
            'testSpending',
            'testSpending.concurrent',
            'testSpending.skip',
            'testSpending.only',
            'testSpending.todo',
          ],
        },
      ],
      'vitest/no-commented-out-tests': 'warn',
      'vitest/no-done-callback': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-test-prefixes': 'error',
      'vitest/prefer-called-with': 'off',
      'vitest/prefer-spy-on': 'warn',
      'vitest/prefer-to-have-length': 'off',
      'vitest/require-top-level-describe': 'off',

      // Relax strictness for test files
      'sonarjs/no-identical-expressions': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/error-message': 'off',
    },
  },

  // ── Prettier: must be last (disables conflicting formatting rules) ───────────
  prettierConfig,
)
