// src: ./configs/commitlint.config.mjs
// @(#) : commitlint configuration
//
// Copyright (c) 2026- atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default {
  extends: ['@commitlint/config-conventional'],

  parserPreset: {
    parserOpts: {
      headerPattern: /^(?:(merge)\s+\(#(\d+)\):\s+)?(\w+)(?:\(([^)]+)\))?!?: (.+)$/,
      headerCorrespondence: [
        'merge',
        'pr',
        'type',
        'scope',
        'subject',
      ],
    },
  },

  rules: {
    'type-enum': [2, 'always', [
      'feat',
      'fix',
      'chore',
      'docs',
      'test',
      'refactor',
      'perf',
      'ci',
      'build',
      'style',

      // Project-specific types
      'config',
      'release',
      'merge',
      'deps',
    ]],

    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'header-max-length': [2, 'always', 76],
  },
};
