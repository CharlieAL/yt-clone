import { Sidebar, SidebarContent, SidebarHeader } from '~/components/ui/sidebar'

import { Separator } from '~/components/ui/separator'
import Link from 'next/link'
import { LogoSvg } from './home-navbar'
import { MainItems } from './main-items'
import { PersonalItems } from './personal-items'
import { SubscriptionsItems } from './subscriptions-items'
import { SignedIn } from '@clerk/nextjs'

export const HomeSidebar = () => {
  return (
    <Sidebar
      className='pt-16 z-40 border-none max-w-[200px] bg-red-300'
      collapsible='icon'
    >
      <SidebarHeader className='pl-2.5 pt-5 pb-3 md:hidden'>
        <div className='flex items-center shrink-0 flex-grow basis-0 gap-x-3 min-w-20'>
          <Link prefetch href='/' className='flex items-center gap-2'>
            <LogoSvg />
          </Link>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className='bg-background'>
        <MainItems />
        <Separator />
        <PersonalItems />
        <SignedIn>
          <Separator />
          <SubscriptionsItems />
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  )
}
