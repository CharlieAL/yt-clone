import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/trpc/routers/_app'

export type CommnetGetManyOutputs =
  inferRouterOutputs<AppRouter>['comments']['getMany']
