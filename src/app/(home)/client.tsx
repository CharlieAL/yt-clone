'use client'

import { trpc } from '~/trpc/client'

export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({
    text: ', YT clone 😈 from the server'
  })
  return (
    <div>
      <h1>{data.greeting}</h1>
    </div>
  )
}
