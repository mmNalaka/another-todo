import { Hono } from 'hono'

import {
  authSignHandler,
  authSignupHandler,
} from '@/controllers/auth.controller'

// /api/auth
const authRouter = new Hono()

// POST /signup - Sign up using email and password
authRouter.post('/signup', ...authSignupHandler)
// POST /signin - Sign in using email and password
authRouter.post('/signin', ...authSignHandler)

export default authRouter
