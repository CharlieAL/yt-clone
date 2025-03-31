import { eq, getTableColumns } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { comments, users } from '~/db/schema'
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure
} from '~/trpc/init'

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const { videoId, content } = input
      const [comment] = await db
        .insert(comments)
        .values({
          videoId,
          userId,
          content
        })
        .returning()

      return comment
    }),
  getMany: baseProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const { videoId } = input
      const data = await db
        .select({
          ...getTableColumns(comments),
          user: {
            name: users.name,
            imageUrl: users.imageUrl
          }
        })
        .from(comments)
        .where(eq(comments.videoId, videoId))
        .innerJoin(users, eq(comments.userId, users.id))
      // .orderBy(comments.createdAt)

      return data
    })
})
