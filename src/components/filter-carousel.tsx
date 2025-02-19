'use client'

interface FilterCarouselProps {
  value?: string | null
  isLoading?: boolean
  onSelect?: (value: string | null) => void
  data?: {
    label: string
    value: string
  }[]
}

const FilterCarousel = ({
  value,
  isLoading,
  onSelect,
  data
}: FilterCarouselProps) => {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
    </div>
  )
}

export default FilterCarousel
