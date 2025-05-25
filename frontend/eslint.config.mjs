//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Add ignores configuration
  {
    ignores: ['public/config.js']
  },
  // Include the original TanStack config
  ...tanstackConfig
]
