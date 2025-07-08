"use client"

import { FileText } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ToolIcon } from "./tool-icons"

export function ToolReplacement() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const animate = () => {
      // Show for 3 seconds
      setIsCollapsed(false)
      setTimeout(() => {
        // Collapse for 1 second
        setIsCollapsed(true)
      }, 3000)
    }

    // Start immediately
    animate()
    // Then repeat every 4 seconds (3s show + 1s collapsed)
    const interval = setInterval(animate, 4500)

    return () => clearInterval(interval)
  }, [])

  // Tools data with icons and labels
  const tools = [
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="whatsapp" size={32} /></div>, 
      label: "WhatsApp", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="gmail" size={32} /></div>, 
      label: "Gmail", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="calendar" size={32} /></div>, 
      label: "Google Calendar", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="meet" size={32} /></div>, 
      label: "Google Meet", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><FileText className="h-8 w-8 text-[#F4B400]" /></div>, 
      label: "Notes App", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="sheets" size={32} /></div>, 
      label: "Spreadsheets", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300"><ToolIcon name="payments" size={32} /></div>, 
      label: "Payments", 
      color: "bg-[#f4f0ee]" 
    },
    { 
      icon: <div className="scale-100 transition-transform duration-300">
        <Image src="/icons/timezone.png" width={32} height={32} alt="Timezone Management" />
      </div>,
      label: "Timezone Management", 
      color: "bg-[#f4f0ee]" 
    },
  ]

  // Calculate positions in a circle for larger screens
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6">
        {/* Text Content */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Everything you need. All in one place.</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Less juggling. More focus.
          </p>
        </div>

        {/* Desktop Layout - Circular */}
        <div className="hidden lg:block relative h-[500px] flex items-center justify-center">
          {/* Tools positioned in a circle */}
          {tools.map((tool, index) => {
            const { x, y } = getPosition(index, tools.length, 220)
            return (
              <div
                key={tool.label}
                className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out"
                style={{
                  transform: `translate(${isCollapsed ? '0px, 0px' : `${x}px, ${y}px`}) ${isCollapsed ? 'scale(0)' : 'scale(1)'}`,
                  opacity: isCollapsed ? 0 : 1,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-40px",
                  marginTop: "-50px",
                }}
              >
                <div
                  className={`w-20 h-20 ${tool.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  {tool.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 mt-3 text-center max-w-20">{tool.label}</span>
              </div>
            )
          })}

          {/* SereneNow logo in the center */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-36 h-36 bg-[#f4f0ee] rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
              <Image 
                src="/icons/serenenow.png" 
                width={96} 
                height={96} 
                alt="SereneNow" 
                className={`transition-transform duration-300 ${isCollapsed ? 'scale-125' : ''}`}
              />
            </div>
            <div className="text-center mt-4">
              <span className="text-xl font-bold text-mint-dark">SereneNow</span>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Circular but smaller */}
        <div className="lg:hidden relative h-[400px] flex items-center justify-center">
          {/* Tools positioned in a circle */}
          {tools.map((tool, index) => {
            const { x, y } = getPosition(index, tools.length, 160) // Smaller radius for mobile
            return (
              <div
                key={tool.label}
                className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-32px",
                  marginTop: "-40px",
                  opacity: isCollapsed ? (index % 2 === 0 ? 0.2 : 0.8) : 1,
                  scale: isCollapsed ? '0.9' : '1'
                }}
              >
                <div
                  className={`w-16 h-16 ${tool.color} rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-300`}
                >
                  {/* Scale down icons for mobile */}
                  <div className="scale-75">
                    {tool.icon}
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-700 mt-2 text-center max-w-[80px]">{tool.label}</span>
              </div>
            )
          })}

          {/* SereneNow logo in the center */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className="w-24 h-24 bg-[#f4f0ee] rounded-full flex items-center justify-center shadow-2xl overflow-hidden transition-all duration-500"
              style={{ transform: `scale(${isCollapsed ? 1.1 : 1})` }}
            >
              <Image 
                src="/icons/serenenow.png" 
                width={48} 
                height={48} 
                alt="SereneNow" 
                className={`transition-transform duration-300 ${isCollapsed ? 'scale-110' : ''}`}
              />
            </div>
            <div className="text-center mt-3">
              <span className="text-base font-bold text-mint-dark">SereneNow</span>
            </div>
          </div>
        </div>


      </div>
    </section>
  )
}
