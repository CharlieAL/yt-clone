import { createTRPCRouter } from '../init'

import { studioRouter } from '~/modules/studio/server/procedures'
import { videosRouter } from '~/modules/videos/server/procedures'
import { videoViewRouter } from '~/modules/video-views/server/procedures'
import { categoriesRouter } from '~/modules/categories/server/procedures'
import { videoReactionsRouter } from '~/modules/video-reactions/server/procedures'
import { subscriptionsRouter } from '~/modules/subscriptions/server/procedures'

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewRouter,
  videoReaction: videoReactionsRouter,
  subscriptions: subscriptionsRouter
})
// export type definition of API
export type AppRouter = typeof appRouter
