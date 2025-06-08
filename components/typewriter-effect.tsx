"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function TypewriterEffect() {
  const phrases = [
    "Organize my therapy notes...",
    "Book sessions without back-and-forth...",
    "Track client payments in one place...",
    "Replace WhatsApp and Gmail chaos...",
    "Feel confident running my practice...",
  ]

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(35)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(() => {
      // Typing
      if (!isDeleting && currentText !== currentPhrase) {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1))
        setTypingSpeed(35)
      }
      // Deleting
      else if (isDeleting && currentText !== "") {
        setCurrentText(currentPhrase.substring(0, currentText.length - 1))
        setTypingSpeed(5)
      }
      // Pause at end of typing
      else if (!isDeleting && currentText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1000)
      }
      // Move to next phrase
      else if (isDeleting && currentText === "") {
        setIsDeleting(false)
        setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length)
        setTypingSpeed(100)
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentPhraseIndex, typingSpeed, phrases])

  return (
    <div className="flex items-center justify-center">
      <div className="relative text-center">
        <p className="text-2xl md:text-3xl font-medium text-mint-dark">
          {currentText}
          <span
            className={cn("inline-block w-1 h-8 ml-1 bg-mint-dark/80", {
              "animate-blink": !isDeleting,
            })}
          ></span>
        </p>
      </div>
    </div>
  )
}
