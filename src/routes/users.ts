import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
    })

    const { firstName, lastName, email } = createUserSchema.parse(request.body)

    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
    })

    reply.cookie('session_id', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(201).send()
  })
}
