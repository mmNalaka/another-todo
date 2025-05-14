import { Hono } from 'hono'

import {
  authMeHandler,
  authRefreshHandler,
  authSignHandler,
  authSignupHandler,
} from '@/controllers/auth.controller'

// /api/auth
const authRouter = new Hono()

// GET /me - Get current user details
authRouter.get('/me', ...authMeHandler)
// POST /signup - Sign up using email and password
authRouter.post('/signup', ...authSignupHandler)
// POST /signin - Sign in using email and password
authRouter.post('/signin', ...authSignHandler)
// POST /refresh - Refresh access token using refresh token
authRouter.post('/refresh', ...authRefreshHandler)

export default authRouter
