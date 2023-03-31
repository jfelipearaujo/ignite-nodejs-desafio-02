import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'

const baseRoute = '/daily-diet'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: `${baseRoute}/users`,
})

app.register(mealsRoutes, {
  prefix: `${baseRoute}/meals`,
})
