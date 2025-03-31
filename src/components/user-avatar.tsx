import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { cn } from '~/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const avatarVariants = cva('', {
  variants: {
    size: {
      default: 'size-9',
      xs: 'size-4',
      sm: 'size-6',
      lg: 'size-10',
      xl: 'size-[160px]'
    }
  },
  defaultVariants: { size: 'default' }
})

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string
  name: string
  className?: string
  onClick?: () => void
}
export const UserAvatar = ({
  imageUrl,
  name,
  className,
  onClick,
  size
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onClick}
    >
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback>
        {name ? name.charAt(0).toUpperCase() : 'DF'}
      </AvatarFallback>
    </Avatar>
  )
}
