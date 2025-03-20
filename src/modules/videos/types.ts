import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/trpc/routers/_app'

export type VideoGetOneOutputs =
  inferRouterOutputs<AppRouter>['videos']['getOne']
