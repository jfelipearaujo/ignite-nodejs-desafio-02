// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      first_name: string
      last_name: string
      email: string
      created_at: string
      updated_at: string
    }

    meals: {
      id: string
      user_id: string
      title: string
      description: string
      date: string
      time: string
      is_on_diet: boolean
      created_at: string
      updated_at: string
    }
  }
}
