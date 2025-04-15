import { createTRPCRouter } from '../init'

import { usersRouter } from '~/modules/users/server/procedures'
import { studioRouter } from '~/modules/studio/server/procedures'
import { videosRouter } from '~/modules/videos/server/procedures'
import { searchRouter } from '~/modules/search/server/procedure'
import { commentsRouter } from '~/modules/comments/server/procedures'
import { playlistRouter } from '~/modules/playlists/server/procedures'
import { videoViewRouter } from '~/modules/video-views/server/procedures'
import { categoriesRouter } from '~/modules/categories/server/procedures'
import { suggestionsRouter } from '~/modules/suggestion/server/procedures'
import { subscriptionsRouter } from '~/modules/subscriptions/server/procedures'
import { videoReactionsRouter } from '~/modules/video-reactions/server/procedures'
import { commentReactionsRouter } from '~/modules/comment-reactions/server/procedures'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  studio: studioRouter,
  videos: videosRouter,
  search: searchRouter,
  comments: commentsRouter,
  playlist: playlistRouter,
  categories: categoriesRouter,
  videoViews: videoViewRouter,
  suggestions: suggestionsRouter,
  videoReaction: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  commentReaction: commentReactionsRouter
})
// export type definition of API
export type AppRouter = typeof appRouter
