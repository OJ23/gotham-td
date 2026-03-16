import anime from 'animejs/lib/anime.es.js'

export function runBatSwarm() {
  document.querySelector('.bat-swarm-overlay')?.remove()

  const batCount = anime.random(15, 20)
  const container = document.createElement('div')
  container.className = 'bat-swarm-overlay'
  document.body.appendChild(container)
  const loopAnimations = []
  const delayStep = 140

  const bats = Array.from({ length: batCount }, (_, index) => {
    const bat = document.createElement('div')
    const wave = anime.random(18, 70)
    const startOffsetY = anime.random(-36, 24)
    const endOffsetY = anime.random(90, 180)

    bat.className = 'bat-swarm-bat'
    bat.innerHTML =
      '<svg viewBox="0 0 64 32" aria-hidden="true" class="bat-swarm-svg"><path fill="currentColor" d="M2 18c4-7 10-10 16-10 3 0 6 1 9 3l5 4 5-4c3-2 6-3 9-3 6 0 12 3 16 10-4-2-7-3-10-3-2 0-4 0-6 1l-4 2 2 6-8-4-8 4 2-6-4-2c-2-1-4-1-6-1-3 0-6 1-10 3Z"/></svg>'
    bat.style.top = `${anime.random(18, Math.max(80, Math.round(window.innerHeight * 0.24)))}px`
    bat.style.left = '-96px'
    bat.style.width = `${anime.random(28, 46)}px`
    bat.style.opacity = String(anime.random(72, 100) / 100)
    bat.style.zIndex = String(index + 1)
    bat.dataset.wave = String(wave)
    bat.dataset.startOffsetY = String(startOffsetY)
    bat.dataset.endOffsetY = String(endOffsetY)
    container.appendChild(bat)

    return bat
  })

  anime({
    targets: bats,
    translateX: () => window.innerWidth + anime.random(140, 280),
    translateY: (element) => [
      Number(element.dataset.startOffsetY || 0),
      Number(element.dataset.endOffsetY || 140),
    ],
    easing: 'linear',
    duration: () => anime.random(2200, 3400),
    delay: anime.stagger(140),
    complete: () => {
      loopAnimations.forEach((animation) => animation.pause?.())
      container.remove()
    },
  })

  bats.forEach((bat, index) => {
    const wave = Number(bat.dataset.wave || 32)
    const delay = index * delayStep

    loopAnimations.push(
      anime({
        targets: bat,
        translateY: [0, -wave, wave * 0.72, -wave * 0.36, 0],
        easing: 'inOutSine',
        duration: anime.random(900, 1400),
        loop: true,
        delay,
      }),
    )

    loopAnimations.push(
      anime({
        targets: bat,
        scaleY: [1, 0.72, 1.14, 1],
        scaleX: [1, 1.08, 0.92, 1],
        rotate: [0, anime.random(-10, 10), anime.random(-6, 6), 0],
        easing: 'inOutSine',
        duration: 360,
        loop: true,
        delay,
      }),
    )
  })
}
