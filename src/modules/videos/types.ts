import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/trpc/routers/_app'

export type VideoGetOneOutputs =
  inferRouterOutputs<AppRouter>['videos']['getOne']

// TODO: change to videos getMany
export type VideoGetManyOutputs =
  inferRouterOutputs<AppRouter>['suggestions']['getMany']
