import { AuthLayout } from '~/modules/auth/ui/layouts/auth-layout'

interface AuthLayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: AuthLayoutProps) => {
  return <AuthLayout>{children}</AuthLayout>
}

export default Layout
