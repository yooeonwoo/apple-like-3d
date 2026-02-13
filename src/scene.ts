import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// Apple-like: big typography + precise motion + minimal palette.
// Original art + copy. No Apple trademarks.

gsap.registerPlugin(ScrollTrigger)

function makeSoftSprite(size = 128) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.65)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.16)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function buildStudioEnv(renderer: THREE.WebGLRenderer) {
  // cheap procedural env map (no external HDR)
  const rt = new THREE.WebGLCubeRenderTarget(256)
  rt.texture.type = THREE.HalfFloatType
  const pmrem = new THREE.PMREMGenerator(renderer)

  const scene = new THREE.Scene()
  const cam = new THREE.CubeCamera(0.1, 50, rt)

  const base = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x05060a, side: THREE.BackSide })
  )
  scene.add(base)

  const makePanel = (w: number, h: number, color: number, intensity: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color })
    )
    ;(m.material as THREE.MeshBasicMaterial).color.multiplyScalar(intensity)
    return m
  }

  const key = makePanel(6, 3.5, 0xffffff, 1.1)
  key.position.set(3, 1.8, -1)
  key.lookAt(0, 0.6, 0)
  scene.add(key)

  const fill = makePanel(6, 3.5, 0x9ae6ff, 0.55)
  fill.position.set(-3.2, 1.1, -0.6)
  fill.lookAt(0, 0.5, 0)
  scene.add(fill)

  const rim = makePanel(7.5, 3.0, 0xb794ff, 0.75)
  rim.position.set(0.2, 0.9, 3.2)
  rim.lookAt(0, 0.55, 0)
  scene.add(rim)

  cam.update(renderer, scene)
  const env = pmrem.fromCubemap(rt.texture).texture
  rt.dispose()
  pmrem.dispose()
  return env
}

function roundedRectShape(w: number, h: number, r: number) {
  const x = -w / 2
  const y = -h / 2
  const s = new THREE.Shape()
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

function makePhone() {
  const g = new THREE.Group()

  const metal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#9aa0a6'),
    metalness: 1,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  })

  const glass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0b0d14'),
    metalness: 0.1,
    roughness: 0.12,
    transmission: 0.02,
    transparent: true,
    opacity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.35,
  })

  const accent = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#a78bfa'),
    emissive: new THREE.Color('#7c3aed'),
    emissiveIntensity: 0.28,
    metalness: 0.45,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.2,
  })

  // body
  const W = 1.1
  const H = 2.25
  const T = 0.16
  const shape = roundedRectShape(W, H, 0.22)
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: T,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 6,
    curveSegments: 22,
  })
  bodyGeo.translate(0, 0, -T / 2)

  const body = new THREE.Mesh(bodyGeo, metal)
  body.rotation.x = Math.PI // extrude faces
  g.add(body)

  // screen
  const screenGeo = new THREE.PlaneGeometry(W * 0.86, H * 0.84)
  const screen = new THREE.Mesh(screenGeo, glass)
  screen.position.set(0, 0, T * 0.52)
  g.add(screen)

  // camera bump
  const bump = new THREE.Group()
  bump.position.set(-0.25, 0.55, -T * 0.2)
  g.add(bump)

  const bumpPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.54, 0.08, 10, 10, 10),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#cbd5e1'),
      metalness: 1,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
    })
  )
  bumpPlate.position.z = -0.03
  bump.add(bumpPlate)

  const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 36)
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0a0a0f'),
    metalness: 0.25,
    roughness: 0.08,
    transmission: 0.65,
    thickness: 0.25,
    ior: 1.5,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1.25,
  })

  const lens1 = new THREE.Mesh(lensGeo, lensMat)
  lens1.rotation.x = Math.PI / 2
  lens1.position.set(-0.14, 0.12, 0.02)
  bump.add(lens1)

  const lens2 = new THREE.Mesh(lensGeo, lensMat)
  lens2.rotation.x = Math.PI / 2
  lens2.position.set(0.14, 0.12, 0.02)
  bump.add(lens2)

  const lens3 = new THREE.Mesh(lensGeo, lensMat)
  lens3.rotation.x = Math.PI / 2
  lens3.position.set(0, -0.14, 0.02)
  bump.add(lens3)

  // accent ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.02, 18, 220), accent)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.0
  ring.position.z = -0.08
  g.add(ring)

  g.scale.setScalar(1.45)
  g.rotation.set(-0.12, 0.55, 0.04)

  return { group: g, ring, screen }
}

function makeMistField() {
  const tex = makeSoftSprite(128)
  const mat = new THREE.PointsMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color('#dbeafe'),
    opacity: 0.0,
    size: 0.08,
    sizeAttenuation: true,
  })

  const count = 2200
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const vel = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    pos[i3 + 0] = (Math.random() - 0.5) * 0.35
    pos[i3 + 1] = 0.0 + (Math.random() - 0.5) * 0.25
    pos[i3 + 2] = 0.1 + Math.random() * 0.2

    vel[i3 + 0] = (Math.random() - 0.5) * 1.2
    vel[i3 + 1] = (Math.random() - 0.15) * 0.6
    vel[i3 + 2] = -Math.random() * 2.0 - 0.6
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aVel', new THREE.BufferAttribute(vel, 3))

  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return { points, mat }
}

export function initScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60)
  camera.position.set(0, 0.4, 7.2)

  // env + lights
  scene.environment = buildStudioEnv(renderer)

  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(3.5, 4.4, 2.5)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xaad9ff, 0.85)
  fill.position.set(-4.2, 1.6, 2.0)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xb794ff, 1.7)
  rim.position.set(1.2, 0.8, -4.7)
  scene.add(rim)

  scene.add(new THREE.AmbientLight(0xffffff, 0.08))

  // background glow
  const bg = new THREE.Mesh(
    new THREE.SphereGeometry(18, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x05060a, side: THREE.BackSide })
  )
  scene.add(bg)

  // phone hero
  const phone = makePhone()
  scene.add(phone.group)

  // mist
  const mist = makeMistField()
  mist.points.position.set(0.0, 0.25, 0.8)
  scene.add(mist.points)

  // micro particles (static points) to add depth
  const starGeo = new THREE.BufferGeometry()
  const starCount = 900
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    starPos[i3 + 0] = (Math.random() - 0.5) * 18
    starPos[i3 + 1] = (Math.random() - 0.5) * 10
    starPos[i3 + 2] = -2 - Math.random() * 18
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const star = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.35 })
  )
  scene.add(star)

  // post
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.65, 0.85)
  composer.addPass(bloom)

  const sizes = { w: 1, h: 1, dpr: 1 }
  const resize = () => {
    sizes.w = window.innerWidth
    sizes.h = window.innerHeight
    sizes.dpr = Math.min(window.devicePixelRatio || 1, 1.65)
    camera.aspect = sizes.w / sizes.h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(sizes.dpr)
    renderer.setSize(sizes.w, sizes.h)
    composer.setPixelRatio(sizes.dpr)
    composer.setSize(sizes.w, sizes.h)
    bloom.setSize(sizes.w, sizes.h)

    const minSide = Math.min(sizes.w, sizes.h)
    const perf = minSide < 720 ? 0.78 : 1.0
    bloom.strength = 0.55 * perf
  }
  window.addEventListener('resize', resize)
  resize()

  // pointer parallax
  const pointer = new THREE.Vector2(0, 0)
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    pointer.set(x, y)
  })

  // Scroll timeline
  const state = { t: 0, mistOn: 0 }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.05,
    },
  })

  // Act 1: hero reveal
  tl.to(camera.position, { x: 0.2, y: 0.55, z: 6.1 }, 0.0)
  tl.to(phone.group.rotation, { y: 1.25, x: -0.05 }, 0.0)

  // Act 2: precision orbit
  tl.to(camera.position, { x: -0.55, y: 0.28, z: 4.85 }, 0.25)
  tl.to(phone.group.rotation, { y: 2.35, x: -0.12 }, 0.25)
  tl.to(phone.ring.rotation, { z: Math.PI * 0.75 }, 0.25)

  // Act 3: close-up + mist
  tl.to(camera.position, { x: 0.25, y: 0.18, z: 3.85 }, 0.55)
  tl.to(phone.group.rotation, { y: 3.35, x: 0.02 }, 0.55)
  tl.to(mist.mat, { opacity: 0.85 }, 0.60)
  tl.to(state, { mistOn: 1.0 }, 0.60)

  // Act 4: final lockup
  tl.to(camera.position, { x: 0.0, y: 0.52, z: 3.15 }, 0.82)
  tl.to(phone.group.rotation, { y: 4.05, x: -0.02 }, 0.82)
  tl.to(mist.mat, { opacity: 1.0 }, 0.86)
  tl.to(state, { mistOn: 2.0 }, 0.86)

  // mist simulation
  const posAttr = mist.points.geometry.getAttribute('position') as THREE.BufferAttribute
  const velAttr = mist.points.geometry.getAttribute('aVel') as THREE.BufferAttribute

  const clock = new THREE.Clock()
  const tick = () => {
    const dt = clock.getDelta()
    state.t += dt

    // parallax (subtle)
    const px = pointer.x * 0.12
    const py = pointer.y * 0.06
    phone.group.rotation.y += (px - phone.group.rotation.y * 0.0) * 0.02
    phone.group.rotation.x += (-py - phone.group.rotation.x * 0.0) * 0.02

    // calm idle
    phone.group.position.y = Math.sin(state.t * 0.8) * 0.018

    // animate mist
    const strength = THREE.MathUtils.clamp(state.mistOn, 0, 2)
    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3
      const x = posAttr.array[i3 + 0] as number
      const y = posAttr.array[i3 + 1] as number
      const z = posAttr.array[i3 + 2] as number

      const vx = (velAttr.array[i3 + 0] as number) * (0.25 + strength * 0.55)
      const vy = (velAttr.array[i3 + 1] as number) * (0.18 + strength * 0.45)
      const vz = (velAttr.array[i3 + 2] as number) * (0.35 + strength * 0.65)

      posAttr.array[i3 + 0] = x + vx * dt
      posAttr.array[i3 + 1] = y + vy * dt
      posAttr.array[i3 + 2] = z + vz * dt

      if (posAttr.array[i3 + 2] < -6.0 || Math.abs(posAttr.array[i3 + 0]) > 5.2 || Math.abs(posAttr.array[i3 + 1]) > 3.8) {
        posAttr.array[i3 + 0] = (Math.random() - 0.5) * 0.35
        posAttr.array[i3 + 1] = (Math.random() - 0.5) * 0.25
        posAttr.array[i3 + 2] = 0.1 + Math.random() * 0.2
      }
    }
    posAttr.needsUpdate = true

    // slow star drift
    star.rotation.y += dt * 0.02

    composer.render()
    requestAnimationFrame(tick)
  }

  tick()
}
