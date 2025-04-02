import { createTRPCRouter } from '../init'

import { studioRouter } from '~/modules/studio/server/procedures'
import { videosRouter } from '~/modules/videos/server/procedures'
import { videoViewRouter } from '~/modules/video-views/server/procedures'
import { categoriesRouter } from '~/modules/categories/server/procedures'
import { videoReactionsRouter } from '~/modules/video-reactions/server/procedures'
import { subscriptionsRouter } from '~/modules/subscriptions/server/procedures'
import { commentsRouter } from '~/modules/comments/server/procedures'
import { commentReactionsRouter } from '~/modules/comment-reactions/server/procedures'
import { suggestionsRouter } from '~/modules/suggestion/server/procedures'

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  comments: commentsRouter,
  categories: categoriesRouter,
  videoViews: videoViewRouter,
  suggestions: suggestionsRouter,
  videoReaction: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  commentReaction: commentReactionsRouter
})
// export type definition of API
export type AppRouter = typeof appRouter
