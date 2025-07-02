"use client"

import type React from "react"

import { useRef, useEffect, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PinInputProps {
  value: string
  onChange: (value: string) => void
  length: number
  disabled?: boolean
  className?: string
}

export function PinInput({ value, onChange, length, disabled, className }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const handleChange = (index: number, digit: string) => {
    // Only allow single digits
    if (digit.length > 1) {
      digit = digit.slice(-1)
    }

    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) {
      return
    }

    const newValue = value.split("")
    newValue[index] = digit
    const updatedValue = newValue.join("").slice(0, length)

    onChange(updatedValue)

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        const newValue = value.split("")
        newValue[index - 1] = ""
        onChange(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newValue = value.split("")
        newValue[index] = ""
        onChange(newValue.join(""))
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, length)
        onChange(digits)

        // Focus the next empty input or the last input
        const nextIndex = Math.min(digits.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
      })
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text")
    const digits = paste.replace(/\D/g, "").slice(0, length)
    onChange(digits)

    // Focus the next empty input or the last input
    const nextIndex = Math.min(digits.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold",
            "border-2 border-mint/30 focus:border-mint-dark focus:ring-mint-dark",
            "transition-all duration-200",
            value[index] && "border-mint-dark bg-mint/5",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          autoComplete="off"
        />
      ))}
    </div>
  )
}
