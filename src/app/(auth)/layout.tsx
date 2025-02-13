interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className='flex w-full min-h-screen justify-center items-center'>
      {children}
    </main>
  )
}

export default AuthLayout
