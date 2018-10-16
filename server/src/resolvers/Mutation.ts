import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'
import * as assert from 'assert'

export const Mutation = {
  signup: async (_, { password, name, email }, ctx) => {
    const hashedPassword = await hash(password, 10)
    const user = await ctx.db.createUser({
      name,
      email,
      password: hashedPassword,
    })

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },
  login: async (_, { email, password }, ctx) => {
    const user = await ctx.db.user({ email })

    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }

    const valid = await compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },
  createOffer: async (_, {}, ctx ) => {
    const id = getUserId(ctx)
    const offer = await ctx.db.createOffer({
      user: {
        connect: {
          id: id
        }
      }
    })
    return offer
  },
  deleteOffer: async(_, { id }, ctx) => {
    const userId = getUserId(ctx)
    await ctx.db.user({ id: userId }).offers({
      where: {
        id: id
      }
    })

    return await ctx.db.deleteOffer({
      id: id
    })
    
  },
  createTouring: async (_, {}, ctx ) => {
    const id = getUserId(ctx)
    const touring = await ctx.db.createTouring({
      user: {
        connect: {
          id: id
        }
      }
    })
    return touring
  }
}
