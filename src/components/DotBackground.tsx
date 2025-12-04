import { useEffect, useRef, useState } from 'react'

interface DotBackgroundProps {
  onMouseMove?: (pos: { x: number; y: number }) => void
}

const DotBackground = ({ onMouseMove }: DotBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let dots: { x: number; y: number }[] = []

    // Dot configuration
    const dotSpacing = 30
    const dotRadius = 1.5
    const highlightRadius = 120
    const maxHighlightSize = 1.5

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)

      // Recreate dots grid
      dots = []
      for (let x = 0; x < window.innerWidth; x += dotSpacing) {
        for (let y = 0; y < window.innerHeight; y += dotSpacing) {
          dots.push({ x, y })
        }
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Cache dark mode check
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const baseColor = isDark ? { r: 148, g: 163, b: 184 } : { r: 100, g: 116, b: 139 }

    // Animation loop with performance optimization
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Only calculate for dots within viewport + margin
      const viewportMargin = 200

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        // Skip dots far from viewport
        if (dot.x < -viewportMargin || dot.x > window.innerWidth + viewportMargin ||
            dot.y < -viewportMargin || dot.y > window.innerHeight + viewportMargin) {
          continue
        }

        // Calculate distance from mouse
        const dx = mousePos.x - dot.x
        const dy = mousePos.y - dot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Only process dots near mouse or draw basic dots
        if (distance < highlightRadius) {
          const factor = 1 - distance / highlightRadius
          const size = dotRadius + (maxHighlightSize - dotRadius) * factor
          const opacity = 0.15 + 0.85 * factor

          // Interpolate towards orange
          const orangeFactor = factor * 0.6
          const r = Math.round(baseColor.r + (249 - baseColor.r) * orangeFactor)
          const g = Math.round(baseColor.g + (115 - baseColor.g) * orangeFactor)
          const b = Math.round(baseColor.b + (22 - baseColor.b) * orangeFactor)

          ctx.beginPath()
          ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
          ctx.fill()
        } else {
          // Draw basic dot
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.15)`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePos])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      })
      if (onMouseMove) {
        onMouseMove({ x: e.clientX, y: e.clientY })
      }
    }

    const handleGlobalMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 })
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseleave', handleGlobalMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseleave', handleGlobalMouseLeave)
    }
  }, [onMouseMove])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

export default DotBackground
