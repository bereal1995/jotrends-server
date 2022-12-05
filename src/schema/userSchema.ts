import { Static, Type } from '@sinclair/typebox'

export const UserSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String(),
  authId: Type.String(),
})

export type UserSchemaType = Static<typeof UserSchema>
