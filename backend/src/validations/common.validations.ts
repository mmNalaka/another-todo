import { z } from 'zod'

import { paginationConfig } from '@/config/app.config'

export const genericPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z
    .number()
    .min(1)
    .max(paginationConfig.MaxLimit)
    .default(paginationConfig.DefaultLimit),
  offset: z.number().min(0).default(0),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})
