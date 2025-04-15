import { inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/trpc/routers/_app'

export type UserGetOneOutputs = inferRouterOutputs<AppRouter>['users']['getOne']
