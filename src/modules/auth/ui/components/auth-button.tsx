'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { UserCircle2Icon } from 'lucide-react'
import { Button } from '~/components/ui/button'

export const AuthButton = () => {
  // TODO: Implement auth logic
  return (
    <>
      <SignedOut>
        <SignInButton mode='modal'>
          <Button
            variant='outline'
            size='default'
            className='rounded-full text-blue-500 hover:text-blue-400'
          >
            <UserCircle2Icon />
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  )
}
