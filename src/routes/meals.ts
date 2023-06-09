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

  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('user_id', sessionId).select()

    return {
      meals,
    }
  })

  app.get('/:id', async (request, reply) => {
    const { sessionId } = request.cookies

    const getMealSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealSchema.parse(request.params)

    const meal = await knex('meals')
      .where('user_id', sessionId)
      .where('id', id)
      .first()

    if (meal) {
      return {
        meal,
      }
    }

    return reply.status(404).send()
  })

  app.put('/:id', async (request, reply) => {
    const { sessionId } = request.cookies

    const getMealSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMealSchema = z.object({
      title: z.string(),
      description: z.string(),
      date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
      time: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
      isOnDiet: z.boolean(),
    })

    const { id } = getMealSchema.parse(request.params)

    const meal = await knex('meals')
      .where('user_id', sessionId)
      .where('id', id)
      .first()

    if (!meal) {
      return reply.status(404).send()
    }

    const { title, description, date, time, isOnDiet } = updateMealSchema.parse(
      request.body,
    )

    await knex('meals').update({
      title,
      description,
      date,
      time,
      is_on_diet: isOnDiet,
      updated_at: new Date().toISOString(),
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const { sessionId } = request.cookies

    const getMealSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealSchema.parse(request.params)

    const meal = await knex('meals')
      .where('user_id', sessionId)
      .where('id', id)
      .first()

    if (meal) {
      await knex('meals').where('user_id', sessionId).where('id', id).delete()

      return reply.status(204).send()
    }

    return reply.status(404).send()
  })

  app.get('/metrics', async (request, reply) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('user_id', sessionId).select()

    let bestSequence = 0
    let currentSequence = 0
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].is_on_diet) {
        currentSequence++
      } else {
        currentSequence = 0
      }

      if (currentSequence > bestSequence) {
        bestSequence = currentSequence
      }
    }

    const onDiet = meals.filter((m) => m.is_on_diet)

    return {
      metrics: {
        total: meals.length,
        best_sequence: bestSequence,
        on_diet: onDiet.length,
        off_diet: meals.length - onDiet.length,
      },
    }
  })
}
