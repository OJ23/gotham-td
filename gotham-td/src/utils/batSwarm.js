function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function animateBatFlight(bat, startOffsetY, endOffsetY, duration, delay) {
  return bat.animate(
    [
      { transform: `translate3d(0px, ${startOffsetY}px, 0) rotate(0deg)` },
      {
        transform: `translate3d(${window.innerWidth + randomBetween(140, 280)}px, ${endOffsetY}px, 0) rotate(${randomBetween(-8, 8)}deg)`,
      },
    ],
    {
      duration,
      delay,
      easing: 'linear',
      fill: 'forwards',
    },
  )
}

function animateBatFlap(bat, delay) {
  return bat.animate(
    [
      { transform: 'scale(1, 1) rotate(0deg)' },
      { transform: 'scale(1.08, 0.72) rotate(-8deg)' },
      { transform: 'scale(0.92, 1.14) rotate(8deg)' },
      { transform: 'scale(1, 1) rotate(0deg)' },
    ],
    {
      duration: 360,
      delay,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  )
}

function animateBatWave(bat, wave, delay) {
  return bat.animate(
    [
      { marginTop: '0px' },
      { marginTop: `${-wave}px` },
      { marginTop: `${wave * 0.72}px` },
      { marginTop: `${-wave * 0.36}px` },
      { marginTop: '0px' },
    ],
    {
      duration: randomBetween(900, 1400),
      delay,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  )
}

export function runBatSwarm() {
  document.querySelector('.bat-swarm-overlay')?.remove()

  const container = document.createElement('div')
  container.className = 'bat-swarm-overlay'
  document.body.appendChild(container)

  const batCount = Math.round(randomBetween(15, 20))
  const animations = []
  const cleanup = () => {
    animations.forEach((animation) => animation.cancel())
    container.remove()
  }

  Array.from({ length: batCount }, (_, index) => {
    const bat = document.createElement('div')
    const delay = index * 140
    const wave = randomBetween(18, 70)
    const startOffsetY = randomBetween(-36, 24)
    const endOffsetY = randomBetween(90, 180)

    bat.className = 'bat-swarm-bat'
    bat.innerHTML =
      '<svg viewBox="0 0 64 32" aria-hidden="true" class="bat-swarm-svg"><path fill="currentColor" d="M2 18c4-7 10-10 16-10 3 0 6 1 9 3l5 4 5-4c3-2 6-3 9-3 6 0 12 3 16 10-4-2-7-3-10-3-2 0-4 0-6 1l-4 2 2 6-8-4-8 4 2-6-4-2c-2-1-4-1-6-1-3 0-6 1-10 3Z"/></svg>'
    bat.style.top = `${randomBetween(18, Math.max(80, Math.round(window.innerHeight * 0.24)))}px`
    bat.style.left = '-96px'
    bat.style.width = `${randomBetween(28, 46)}px`
    bat.style.opacity = String(randomBetween(0.72, 1))
    bat.style.zIndex = String(index + 1)
    container.appendChild(bat)

    animations.push(animateBatWave(bat, wave, delay))
    animations.push(animateBatFlap(bat, delay))

    const flight = animateBatFlight(bat, startOffsetY, endOffsetY, randomBetween(2200, 3400), delay)
    flight.addEventListener('finish', () => {
      if (index === batCount - 1) {
        cleanup()
      }
    })
    animations.push(flight)

    return bat
  })
}
