import { z } from 'zod'

// Schema for adding a collaborator to a list
export const addCollaboratorSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']).default('viewer'),
})

// Schema for updating a collaborator's role
export const updateCollaboratorRoleSchema = z.object({
  role: z.enum(['editor', 'viewer']),
})

// Schema for removing a collaborator
export const removeCollaboratorSchema = z.object({
  userId: z.string().min(1),
})
