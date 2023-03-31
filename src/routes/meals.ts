import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/', async (request, reply) => {
    const createMealSchema = z.object({
      title: z.string(),
      description: z.string(),
      date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
      time: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
      isOnDiet: z.boolean(),
    })

    const { title, description, date, time, isOnDiet } = createMealSchema.parse(
      request.body,
    )

    const { sessionId } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      user_id: sessionId,
      title,
      description,
      date,
      time,
      is_on_diet: isOnDiet,
    })

    return reply.status(201).send()
  })
}
