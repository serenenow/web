"use client"

import Image from 'next/image'

interface ToolIconProps {
  name: string
  size?: number
  className?: string
}

export function ToolIcon({ name, size = 24, className = '' }: ToolIconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
    />
  )
}
