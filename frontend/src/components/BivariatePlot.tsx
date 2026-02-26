/**
 * BivariatePlot — interactive 3-D bivariate normal density surface.
 * Extracted from App.tsx so it can be used independently on the home page.
 */

import { useEffect, useRef, useCallback } from "react"
import { useTheme } from "../contexts/ThemeContext.tsx"

export default function BivariatePlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const angleRef = useRef(0.35)
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const { isDark } = useTheme()

  const r = 0.72
  const bivnorm = useCallback((x: number, y: number) => {
    const z = (x * x - 2 * r * x * y + y * y) / (1 - r * r)
    return Math.exp(-z / 2) / (2 * Math.PI * Math.sqrt(1 - r * r))
  }, [])

  const scatterRef = useRef<{ x: number; y: number }[]>([])
  useEffect(() => {
    const pts: { x: number; y: number }[] = []
    const seed = (n: number) => {
      const x = Math.sin(n * 127.1) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < 180; i++) {
      const u1 = seed(i * 2), u2 = seed(i * 2 + 1)
      const z1 = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
      const z2 = Math.sqrt(-2 * Math.log(Math.max(u2, 1e-10))) * Math.cos(2 * Math.PI * u1)
      const x = z1 * 1.1
      const y = (r * z1 + Math.sqrt(1 - r * r) * z2) * 1.1
      if (Math.abs(x) < 2.8 && Math.abs(y) < 2.8) pts.push({ x, y })
    }
    scatterRef.current = pts
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
    }
    resize()
    window.addEventListener("resize", resize)

    const maxDensity = bivnorm(0, 0)
    const GRID = 34
    const RANGE = 2.8
    const accentRgb = isDark ? [45, 212, 191] : [3, 105, 161]

    const project = (x: number, y: number, z: number) => {
      const cosA = Math.cos(angleRef.current), sinA = Math.sin(angleRef.current)
      const rx = x * cosA - z * sinA
      const rz = x * sinA + z * cosA
      const tilt = 0.46
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
      const ry = y * cosT - rz * sinT
      const rz2 = y * sinT + rz * cosT
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      const fov = 5
      const s = fov / (fov + rz2 * 0.3 + 2.5)
      return { sx: W * 0.5 + rx * s * W * 0.26, sy: H * 0.50 - ry * s * H * 0.36, depth: rz2 }
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")!
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = isDark ? "#060a0e" : "#eef6ff"
      ctx.fillRect(0, 0, W, H)

      const [ar, ag, ab] = accentRgb

      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.06 : 0.1})`
      ctx.lineWidth = 0.5
      for (let i = -4; i <= 4; i++) {
        const a = project(i * 0.7, 0, -RANGE), b = project(i * 0.7, 0, RANGE)
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke()
        const c = project(-RANGE, 0, i * 0.7), d = project(RANGE, 0, i * 0.7)
        ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(d.sx, d.sy); ctx.stroke()
      }

      const cells: { pts: { sx: number; sy: number }[]; depth: number; density: number }[] = []
      for (let iz = 0; iz < GRID - 1; iz++) {
        for (let ix = 0; ix < GRID - 1; ix++) {
          const x0 = -RANGE + (ix / (GRID - 1)) * RANGE * 2
          const z0 = -RANGE + (iz / (GRID - 1)) * RANGE * 2
          const x1 = -RANGE + ((ix + 1) / (GRID - 1)) * RANGE * 2
          const z1 = -RANGE + ((iz + 1) / (GRID - 1)) * RANGE * 2
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
          const density = bivnorm(cx, cz) / maxDensity

          const h = (x: number, z: number) => (bivnorm(x, z) / maxDensity) * 1.6
          const p00 = project(x0, h(x0, z0), z0)
          const p10 = project(x1, h(x1, z0), z0)
          const p11 = project(x1, h(x1, z1), z1)
          const p01 = project(x0, h(x0, z1), z1)
          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4
          cells.push({ pts: [p00, p10, p11, p01], depth: avgDepth, density })
        }
      }
      cells.sort((a, b) => b.depth - a.depth)

      cells.forEach(({ pts, density }) => {
        const alpha = isDark ? 0.1 + density * 0.65 : 0.12 + density * 0.55
        const bright = 0.25 + density * 0.75
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha * bright})`
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${alpha * 0.12})`
        ctx.lineWidth = 0.35
        ctx.beginPath()
        ctx.moveTo(pts[0].sx, pts[0].sy)
        pts.slice(1).forEach(p => ctx.lineTo(p.sx, p.sy))
        ctx.closePath(); ctx.fill(); ctx.stroke()
      })

      scatterRef.current.forEach(p => {
        const fp = project(p.x, 0.01, p.y)
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.38 : 0.5})`
        ctx.beginPath()
        ctx.arc(fp.sx, fp.sy, 1.8, 0, Math.PI * 2)
        ctx.fill()
      })

      const peak = project(0, 1.7, 0)
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.9)`
      ctx.font = `600 11px 'IBM Plex Sans', sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(`r = ${r}`, peak.sx, peak.sy - 6)

      ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.3 : 0.45})`
      ctx.font = `10px 'IBM Plex Mono', monospace`
      const xLbl = project(2.4, 0, 0)
      ctx.textAlign = "left"
      ctx.fillText("X₁", xLbl.sx, xLbl.sy)
      const yLbl = project(0, 0, 2.4)
      ctx.fillText("X₂", yLbl.sx, yLbl.sy)

      ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.18 : 0.25})`
      ctx.font = `9px 'IBM Plex Mono', monospace`
      ctx.textAlign = "right"
      ctx.fillText("f(x₁,x₂) — Bivariate Normal · Pearson correlation", W - 10, H - 10)

      if (!isDragging.current) {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},0.25)`
        ctx.font = `9px 'IBM Plex Sans', sans-serif`
        ctx.textAlign = "left"
        ctx.fillText("drag to rotate", 12, H - 10)
      }

      if (!isDragging.current) {
        angleRef.current += 0.003
      }
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [isDark, bivnorm])

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastX.current = e.clientX }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    angleRef.current += (lastX.current - e.clientX) * 0.008
    lastX.current = e.clientX
  }
  const onMouseUp = () => { isDragging.current = false }
  const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; lastX.current = e.touches[0].clientX }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    angleRef.current += (e.touches[0].clientX - lastX.current) * 0.008
    lastX.current = e.touches[0].clientX
  }
  const onTouchEnd = () => { isDragging.current = false }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  )
}