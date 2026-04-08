<template>
  <canvas ref="canvas" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const el = canvas.value
  if (!el || typeof window === 'undefined') return

  const ctx = el.getContext('2d')
  if (!ctx) return

  let animId = 0

  interface Particle {
    x: number; y: number; vx: number; vy: number
    r: number; hue: number; phase: number
  }

  const particles: Particle[] = []

  const resize = () => {
    el.width = el.offsetWidth * devicePixelRatio
    el.height = el.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)
  }

  const spawn = () => {
    const w = el.offsetWidth
    const h = el.offsetHeight
    particles.length = 0
    const count = Math.min(180, Math.round((w * h) / 5800))
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.2 + 0.4,
        hue: Math.random() < 0.6 ? 186 : 260,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  const onResize = () => {
    resize()
    spawn()
  }

  onResize()
  window.addEventListener('resize', onResize, { passive: true })

  let t = 0
  const draw = () => {
    const w = el.offsetWidth
    const h = el.offsetHeight
    ctx.clearRect(0, 0, w, h)
    t += 0.012

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = w
      else if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      else if (p.y > h) p.y = 0

      const alpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t + p.phase))
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`
      ctx.fill()
    }

    // subtle connecting lines between near particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = dx * dx + dy * dy
        if (dist < 8000) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(34,211,238,${0.04 * (1 - dist / 8000)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animId = requestAnimationFrame(draw)
  }

  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', onResize)
  })
})
</script>
