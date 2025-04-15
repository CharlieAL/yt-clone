import { cn } from '~/lib/utils'
import { Button, buttonProps } from '~/components/ui/button'

interface SubscriptionsButtonProps {
  onClick: buttonProps['onClick']
  disabled?: boolean
  isSubscribed?: boolean
  className?: string
  size?: buttonProps['size']
}

export const SubscriptionsButton = ({
  onClick,
  disabled = false,
  isSubscribed = false,
  className,
  size
}: SubscriptionsButtonProps) => {
  return (
    <Button
      size={size}
      variant={isSubscribed ? 'secondary' : 'default'}
      className={cn('rounded-full', className)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className='px-3'>{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
    </Button>
  )
}
