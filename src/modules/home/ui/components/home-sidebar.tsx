import { Sidebar, SidebarContent } from '~/components/ui/sidebar'
import { MainSection, PersonalSection } from './sidebar-sections'
import { Separator } from '~/components/ui/separator'

export const HomeSidebar = () => {
  return (
    <Sidebar
      className='pt-16 z-40 border-none max-w-[200px] bg-red-300'
      collapsible='icon'
    >
      <SidebarContent className='bg-background'>
        <MainSection />
        <Separator />
        <PersonalSection />
      </SidebarContent>
    </Sidebar>
  )
}
