import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// =============================================
// Hero — Neural Network (WebGL)
// =============================================
const PARTICLE_COUNT  = 60;
const CONNECTION_DIST = 2.2;
const SPEED           = 0.004;

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
  camera.position.z = 9;

  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const vel = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 14;
    pos[i*3+1] = (Math.random() - 0.5) * 10;
    pos[i*3+2] = (Math.random() - 0.5) * 5;
    vel.push({
      x: (Math.random() - 0.5) * SPEED,
      y: (Math.random() - 0.5) * SPEED,
      z: (Math.random() - 0.5) * SPEED * 0.25,
    });
  }

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.1, transparent: true, opacity: 1, sizeAttenuation: true,
  })));

  const maxLines  = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2;
  const linePos   = new Float32Array(maxLines * 6);
  const lineColor = new Float32Array(maxLines * 6);
  const lineGeo   = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColor, 3));
  scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.65,
  })));

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx =  (e.clientX / window.innerWidth  - 0.5) * 2;
    my = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  (function animate() {
    requestAnimationFrame(animate);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i*3]   += vel[i].x;
      pos[i*3+1] += vel[i].y;
      pos[i*3+2] += vel[i].z;
      if (Math.abs(pos[i*3])   > 7)   vel[i].x *= -1;
      if (Math.abs(pos[i*3+1]) > 5)   vel[i].y *= -1;
      if (Math.abs(pos[i*3+2]) > 2.5) vel[i].z *= -1;
    }
    ptGeo.attributes.position.needsUpdate = true;

    let li = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
        const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < CONNECTION_DIST) {
          const a = (1 - d / CONNECTION_DIST) * 0.55, b = li * 6;
          linePos[b]=pos[i*3]; linePos[b+1]=pos[i*3+1]; linePos[b+2]=pos[i*3+2];
          linePos[b+3]=pos[j*3]; linePos[b+4]=pos[j*3+1]; linePos[b+5]=pos[j*3+2];
          lineColor[b]=lineColor[b+1]=lineColor[b+2]=a;
          lineColor[b+3]=lineColor[b+4]=lineColor[b+5]=a;
          li++;
        }
      }
    }
    linePos.fill(0, li*6); lineColor.fill(0, li*6);
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate    = true;

    camera.position.x += (mx * 0.9 - camera.position.x) * 0.025;
    camera.position.y += (my * 0.6 - camera.position.y) * 0.025;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();
}

// =============================================
// Project Carousel (CSS3DRenderer)
// =============================================
const PROJECTS = [
  {
    icon: 'fa-magnifying-glass-chart', num: '01',
    img: 'images/research.jpg',
    title: 'RAG Research Paper Gap Finder',
    desc: 'Local RAG pipeline ingesting hundreds of academic PDFs, chunking by section, and surfacing research gaps — no context window limits, no API costs.',
    tags: ['Python', 'RAG', 'ChromaDB', 'Ollama', 'LLaMA 3.2'],
    link: 'https://github.com/bistadinank/RAG_Research_Paper_Gap_Finder',
    linkText: 'View on GitHub',
  },
  {
    icon: 'fa-server', num: '02',
    img: 'images/reddit.png',
    title: 'Reddit Clone — Distributed Actor System',
    desc: 'Stateless REST API on Proto.Actor with distributed message handling and crash recovery — 35% faster than monolith baseline.',
    tags: ['Go', 'Proto.Actor', 'REST API', 'Distributed Systems'],
    link: 'https://github.com/bistadinank/Reddit-Clone-API',
    linkText: 'View on GitHub',
  },
  {
    icon: 'fa-code', num: '03',
    img: 'images/algo.jpg',
    title: 'DS&A Prep Kit',
    desc: 'Comprehensive Data Structures & Algorithms in Java — trees, graphs, DP, sorting, searching. Built for structured interview prep.',
    tags: ['Java', 'Algorithms', 'Data Structures'],
    link: 'https://github.com/danebista/Prep-Kit/tree/Main/PrepKit-Java/src',
    linkText: 'View on GitHub',
  },
  {
    icon: 'fa-rocket', num: '04',
    img: 'images/spaceship.png',
    title: 'Spaceship Tower Defense',
    desc: 'Goal-based pathfinding AI, dynamic difficulty via cheat slider, real-time enemy tracking — built entirely in Vanilla JS, no libraries.',
    tags: ['Vanilla JS', 'Canvas API', 'Pathfinding'],
    link: 'https://danebista.github.io/JS-Project/',
    linkText: 'Play Now',
  },
  {
    icon: 'fa-gamepad', num: '05',
    img: 'images/dave.png',
    title: 'Dangerous Dave',
    desc: 'Classic platformer rebuilt from scratch — sprite animation, collision detection, and level progression. Zero external libraries.',
    tags: ['Vanilla JS', 'Canvas API', 'Sprites'],
    link: 'https://danebista.github.io/Dangerous-Dave-Game-PureVanillaJs/',
    linkText: 'Play Now',
  },
  {
    icon: 'fa-feather', num: '06',
    img: 'images/4.png',
    title: 'Flappy Bird',
    desc: 'Physics simulation with procedural obstacles and score tracking. No game engine — just math and canvas.',
    tags: ['Vanilla JS', 'Canvas API', 'Physics'],
    link: 'https://danebista.github.io/JS-Experiements/Assignment-4.flappy-bird/index.html',
    linkText: 'Play Now',
  },
];

function initProjectCarousel() {
  const container = document.getElementById('carousel-container');
  if (!container) return;
  const interactionArea = container.closest('.carousel-wrapper') || container;

  const n    = PROJECTS.length;
  const STEP = (Math.PI * 2) / n;
  const TAU  = Math.PI * 2;
  const AUTO_ROTATE_SPEED = 0.005;
  const HOVER_ROTATE_SPEED = 0.0018;

  function getRadius() { return Math.max(container.clientWidth * 0.42, 520); }

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 10000);

  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(container.clientWidth, container.clientHeight);
  Object.assign(cssRenderer.domElement.style, { position: 'absolute', top: '0', left: '0' });
  container.appendChild(cssRenderer.domElement);

  let currentStep = 0;
  let currentAngle = 0;
  let targetAngle  = 0;
  let pointerInside = false;
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  // Dots
  const dotsEl = document.getElementById('carousel-dots');
  const dots = PROJECTS.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'c-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to project ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl?.appendChild(d);
    return d;
  });

  function goTo(i) {
    currentStep = ((i % n) + n) % n;
    const baseAngle = -currentStep * STEP;
    const closestTurn = Math.round((currentAngle - baseAngle) / TAU);
    targetAngle = baseAngle + closestTurn * TAU;
    dots.forEach((d, j) => d.classList.toggle('active', j === currentStep));
  }

  function syncActiveDot() {
    const step = ((Math.round(-currentAngle / STEP) % n) + n) % n;
    if (step === currentStep) return;
    currentStep = step;
    dots.forEach((d, j) => d.classList.toggle('active', j === currentStep));
  }

  document.getElementById('carousel-prev')?.addEventListener('click', () => goTo(currentStep - 1));
  document.getElementById('carousel-next')?.addEventListener('click', () => goTo(currentStep + 1));

  interactionArea.addEventListener('pointerenter', () => {
    pointerInside = true;
  });
  interactionArea.addEventListener('pointerleave', () => {
    pointerInside = false;
  });
  interactionArea.addEventListener('touchstart', () => {
    pointerInside = true;
  }, { passive: true });

  // Build cards
  let RADIUS = getRadius();
  camera.position.z = RADIUS * 2.3;

  const objects = PROJECTS.map((p, i) => {
    const el = document.createElement('div');
    el.className = 'p3d-card';
    el.innerHTML = `
      <div class="p3d-img-wrap">
        <img src="${p.img}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="p3d-body">
        <div class="p3d-head">
          <i class="fa-solid ${p.icon} p3d-icon"></i>
          <span class="p3d-num">${p.num}</span>
        </div>
        <h3 class="p3d-title">${p.title}</h3>
        <p class="p3d-desc">${p.desc}</p>
        <div class="p3d-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <a href="${p.link}" target="_blank" rel="noopener" class="p3d-link">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> ${p.linkText}
        </a>
      </div>
    `;

    const angle = i * STEP;
    const obj   = new CSS3DObject(el);
    obj.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
    obj.rotation.y = angle;
    scene.add(obj);
    return { obj, el, angle };
  });

  function updatePositions() {
    RADIUS = getRadius();
    camera.position.z = RADIUS * 2.3;
    objects.forEach(({ obj, angle }) => {
      obj.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
    });
  }

  (function animate() {
    requestAnimationFrame(animate);
    const rotateSpeed = (isTouchDevice || pointerInside) ? HOVER_ROTATE_SPEED : AUTO_ROTATE_SPEED;
    targetAngle -= rotateSpeed;
    currentAngle += (targetAngle - currentAngle) * 0.08;
    scene.rotation.y = currentAngle;
    syncActiveDot();

    objects.forEach(({ el, angle }) => {
      const worldAngle = angle + currentAngle;
      const depth = Math.cos(worldAngle);           // 1=front, -1=back
      const t     = (depth + 1) / 2;               // 0→1
      el.style.opacity      = String(0.35 + t * 0.65);
      el.style.filter       = t > 0.85 ? '' : `blur(${((1 - t) * 5).toFixed(1)}px)`;
      el.style.pointerEvents = t > 0.75 ? 'auto' : 'none';
    });

    cssRenderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    cssRenderer.setSize(w, h);
    updatePositions();
  });
}

// =============================================
// Skill Sphere (CSS3DRenderer)
// =============================================
const SKILLS = [
  'Python','JavaScript','TypeScript','Java','Go','C#','C++','MATLAB',
  'PyTorch','TensorFlow','Keras','LangChain','CUDA','OpenCV','scikit-learn','RAG',
  'React','Next.js','Node.js','AWS Lambda','DynamoDB','Firebase','GCP',
  'Pandas','SciPy','ChromaDB','R','Qualtrics',
  'Git','Docker','MS SQL','Unity',
  'User Studies','UX Design','HCI','Statistical Analysis',
];

function initSkillSphere() {
  const container = document.getElementById('skills-sphere');
  if (!container) return;

  const w = container.clientWidth;
  const h = container.clientHeight;
  const RADIUS = Math.min(w * 0.42, 380);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, w / h, 1, 10000);
  camera.position.z = RADIUS * 3;

  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(w, h);
  Object.assign(cssRenderer.domElement.style, { position: 'absolute', top: '0', left: '0' });
  container.appendChild(cssRenderer.domElement);

  // Fibonacci sphere — store original position for depth calc
  const sphereObjects = SKILLS.map((skill, i) => {
    const phi   = Math.acos(-1 + (2 * i) / SKILLS.length);
    const theta = Math.sqrt(SKILLS.length * Math.PI) * phi;

    const pos = new THREE.Vector3(
      RADIUS * Math.cos(theta) * Math.sin(phi),
      RADIUS * Math.sin(theta) * Math.sin(phi),
      RADIUS * Math.cos(phi),
    );

    const el = document.createElement('div');
    el.className = 'skill-3d-tag';
    el.textContent = skill;

    const obj = new CSS3DObject(el);
    obj.position.copy(pos);
    scene.add(obj);

    obj._targetScale = 1.0;
    el.addEventListener('mouseenter', () => { obj._targetScale = 1.45; });
    el.addEventListener('mouseleave', () => { obj._targetScale = 1.0; });

    return { obj, el, pos };
  });

  let mx = 0, my = 0, hovered = false;
  container.addEventListener('mousemove', e => {
    const r = container.getBoundingClientRect();
    mx = (e.clientX - r.left - r.width / 2) / r.width;
    my = (e.clientY - r.top  - r.height / 2) / r.height;
  });
  container.addEventListener('mouseenter', () => hovered = true);
  container.addEventListener('mouseleave', () => { hovered = false; mx = 0; my = 0; });

  let autoY = 0, autoX = 0;

  // Reusable quaternion objects — avoid allocation in loop
  const sceneQuat = new THREE.Quaternion();
  const invQuat   = new THREE.Quaternion();
  const worldPos  = new THREE.Vector3();

  (function animate() {
    requestAnimationFrame(animate);

    const spd = hovered ? 0.001 : 0.005;
    autoY += spd;
    autoX += spd * 0.25;
    const tY = autoY + (hovered ? mx * 1.5 : 0);
    const tX = autoX + (hovered ? -my * 0.8 : 0);
    scene.rotation.y += (tY - scene.rotation.y) * 0.03;
    scene.rotation.x += (tX - scene.rotation.x) * 0.03;

    // Billboard: cancel out the scene rotation so every tag faces the camera.
    // Depth fade: tags on the front hemisphere are opaque, back hemisphere invisible.
    sceneQuat.setFromEuler(scene.rotation);
    invQuat.copy(sceneQuat).invert();

    sphereObjects.forEach(({ obj, el, pos }) => {
      // Always face the camera
      obj.quaternion.copy(invQuat);

      // Smooth scale lerp toward target
      const ts = obj._targetScale ?? 1.0;
      obj.scale.setScalar(obj.scale.x + (ts - obj.scale.x) * 0.14);

      // World-space Z position drives opacity
      worldPos.copy(pos).applyQuaternion(sceneQuat);
      const t = (worldPos.z / RADIUS + 1) / 2; // 0 = back, 1 = front
      const opacity = Math.max(0, t * 1.6 - 0.25);
      el.style.opacity       = opacity.toFixed(2);
      el.style.pointerEvents = opacity > 0.3 ? 'auto' : 'none';
    });

    cssRenderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    const nw = container.clientWidth, nh = container.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    cssRenderer.setSize(nw, nh);
  });
}

// =============================================
// Custom Cursor
// =============================================
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on true pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let cx = -200, cy = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));

  document.querySelectorAll('a, button, .demo-card, .p3d-card, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  (function tick() {
    requestAnimationFrame(tick);
    rx += (cx - rx) * 0.4;
    ry += (cy - ry) * 0.4;
    dot.style.transform  = `translate(${cx}px, ${cy}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
  })();
}

// =============================================
// Full-page Distortion Mesh (WebGL ShaderMaterial)
// =============================================
function initDistortionMesh() {
  const canvas = document.getElementById('distortion-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Color(0x0D9488) },
    },
    vertexShader: `
      uniform float uTime;
      uniform vec2  uMouse;
      varying float vStrength;
      void main() {
        vec2 uv   = uv;
        float dist   = distance(uv, uMouse);
        float ripple = sin(dist * 22.0 - uTime * 4.5) * exp(-dist * 5.5) * 0.022;
        vStrength = abs(ripple) * 45.0;
        vec3 pos  = position;
        pos.z    += ripple;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vStrength;
      void main() {
        float a = clamp(vStrength * 0.07, 0.0, 0.065);
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 80, 80), material));

  let mx = 0.5, my = 0.5, cx = 0.5, cy = 0.5;
  document.addEventListener('mousemove', e => {
    mx =       e.clientX / window.innerWidth;
    my = 1.0 - e.clientY / window.innerHeight;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const start = performance.now();
  (function animate() {
    requestAnimationFrame(animate);
    cx += (mx - cx) * 0.045;
    cy += (my - cy) * 0.045;
    material.uniforms.uTime.value = (performance.now() - start) / 1000;
    material.uniforms.uMouse.value.set(cx, cy);
    renderer.render(scene, camera);
  })();
}

// =============================================
// Magnetic Buttons
// =============================================
function initMagneticButtons() {
  document.querySelectorAll('.btn, #carousel-prev, #carousel-next').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
      btn.style.transition = 'transform 0.15s ease, box-shadow 0.3s ease';
      btn.style.transform  = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease';
      btn.style.transform  = '';
    });
  });
}

// =============================================
// Navbar
// =============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// =============================================
// Section Anchor Scrolling
// =============================================
function initSectionAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top + window.scrollY;
      const viewportRoom = Math.max((window.innerHeight - targetRect.height) * 0.22, 0);
      const offset = navH + 28 - viewportRoom;

      window.scrollTo({
        top: Math.max(targetTop - offset, 0),
        behavior: 'smooth',
      });
      history.pushState(null, '', hash);
    });
  });
}

// =============================================
// Contact Signal Rings (WebGL)
// =============================================
function initContactCanvas() {
  const canvas = document.getElementById('contact-canvas');
  const section = document.getElementById('contact');
  if (!canvas || !section) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 8;

  const group = new THREE.Group();
  scene.add(group);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x0D9488,
    transparent: true,
    opacity: 0.12,
    wireframe: true,
  });
  const accentMaterial = new THREE.MeshBasicMaterial({
    color: 0x0891B2,
    transparent: true,
    opacity: 0.16,
    wireframe: true,
  });
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0D9488,
    transparent: true,
    opacity: 0.12,
  });

  const rings = [-3.35, 0, 3.35].map((x, i) => {
    const node = new THREE.Group();
    node.position.set(x, -3.1 + Math.sin(i) * 0.12, 0);

    const outer = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.016, 12, 96), ringMaterial.clone());
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.012, 10, 80), accentMaterial.clone());
    const tilted = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.01, 10, 80), ringMaterial.clone());

    inner.rotation.x = Math.PI / 2.8;
    tilted.rotation.y = Math.PI / 2.4;
    node.add(outer, inner, tilted);
    group.add(node);
    return { node, outer, inner, tilted };
  });

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.35, -3.1, -0.15),
    new THREE.Vector3(-1.6, -2.65, 0.15),
    new THREE.Vector3(0, -3, -0.1),
    new THREE.Vector3(1.6, -3.4, 0.15),
    new THREE.Vector3(3.35, -3, -0.15),
  ]);
  const curveLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(120)),
    lineMaterial,
  );
  group.add(curveLine);

  let mx = 0;
  let my = 0;
  let visible = true;
  let activeRing = -1;

  document.querySelectorAll('.contact-link').forEach((link, i) => {
    link.addEventListener('mouseenter', () => { activeRing = i; });
    link.addEventListener('mouseleave', () => { activeRing = -1; });
    link.addEventListener('focus', () => { activeRing = i; });
    link.addEventListener('blur', () => { activeRing = -1; });
  });

  section.addEventListener('mousemove', e => {
    const r = section.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = -((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  section.addEventListener('mouseleave', () => {
    mx = 0;
    my = 0;
  });

  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0.05 });
  observer.observe(section);

  function resize() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.scale.setScalar(w < 700 ? 0.26 : 0.46);
    group.position.y = w < 700 ? -3.35 : -2.48;
  }
  resize();
  window.addEventListener('resize', resize);

  (function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    const time = performance.now() * 0.001;
    rings.forEach(({ node, outer, inner, tilted }, i) => {
      const baseY = -3.1 + Math.sin(i) * 0.12;
      const isActive = activeRing === i;
      const spinBoost = isActive ? 2.8 : 1;
      const targetScale = isActive ? 1.45 : 1;
      const targetY = baseY + Math.sin(time * 0.8 + i) * 0.05 + (isActive ? 0.18 : 0);
      node.position.y += (targetY - node.position.y) * 0.04;
      node.scale.setScalar(node.scale.x + (targetScale - node.scale.x) * 0.1);
      outer.material.opacity += ((isActive ? 0.48 : 0.12) - outer.material.opacity) * 0.1;
      inner.material.opacity += ((isActive ? 0.58 : 0.16) - inner.material.opacity) * 0.1;
      tilted.material.opacity += ((isActive ? 0.4 : 0.12) - tilted.material.opacity) * 0.1;
      outer.rotation.z += (0.003 + i * 0.0008) * spinBoost;
      inner.rotation.x += 0.004 * spinBoost;
      inner.rotation.z -= 0.002 * spinBoost;
      tilted.rotation.y += 0.0035 * spinBoost;
    });

    group.rotation.y += (mx * 0.16 - group.rotation.y) * 0.035;
    group.rotation.x += (my * 0.08 - group.rotation.x) * 0.035;
    renderer.render(scene, camera);
  })();
}

// =============================================
// Research Orbit Field (WebGL)
// =============================================
function initResearchCanvas() {
  const canvas = document.getElementById('research-canvas');
  const section = document.getElementById('research');
  if (!canvas || !section) return;
  const pubCards = [...section.querySelectorAll('.pub-card')];
  const container = section.querySelector('.container');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 8;

  const group = new THREE.Group();
  scene.add(group);

  const orbitMat = new THREE.LineBasicMaterial({
    color: 0x5EEAD4,
    transparent: true,
    opacity: 0.22,
  });
  const faintOrbitMat = new THREE.LineBasicMaterial({
    color: 0x0891B2,
    transparent: true,
    opacity: 0.13,
  });

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xFDBA74, transparent: true, opacity: 0.86 }),
  );
  group.add(sun);

  const sunRays = new THREE.Group();
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xFDBA74,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
  });
  const rayShape = new THREE.Shape();
  rayShape.moveTo(-0.026, 0.19);
  rayShape.lineTo(0.026, 0.19);
  rayShape.lineTo(0, 0.31);
  rayShape.lineTo(-0.026, 0.19);
  const rayGeo = new THREE.ShapeGeometry(rayShape);
  for (let i = 0; i < 16; i++) {
    const ray = new THREE.Mesh(rayGeo, rayMat.clone());
    const angle = (i / 16) * Math.PI * 2;
    ray.rotation.z = angle;
    sunRays.add(ray);
  }
  group.add(sunRays);

  const sunLabel = document.createElement('span');
  sunLabel.className = 'planet-label sun-label';
  sunLabel.textContent = 'Sun';
  section.appendChild(sunLabel);

  const planetConfigs = [
    { name: 'Mercury', radius: 0.45, size: 0.045, speed: 0.011, color: 0xB7B1A6 },
    { name: 'Venus', radius: 0.7, size: 0.07, speed: 0.008, color: 0xD9A441, pubIndex: 0 },
    { name: 'Earth', radius: 0.96, size: 0.105, speed: 0.0063, color: 0x14B8A6, pubIndex: 1 },
    { name: 'Mars', radius: 1.24, size: 0.075, speed: 0.0051, color: 0xC2410C },
    { name: 'Jupiter', radius: 1.62, size: 0.145, speed: 0.0038, color: 0x06B6D4 },
    { name: 'Saturn', radius: 2.04, size: 0.13, speed: 0.0030, color: 0xF59E0B, pubIndex: 2 },
  ];

  const planetLabels = planetConfigs.map(p => {
    const label = document.createElement('span');
    label.className = 'planet-label' + (p.pubIndex !== undefined ? ' research-planet' : '');
    label.textContent = p.name;
    section.appendChild(label);
    return label;
  });

  const hitTargets = [];
  const planets = planetConfigs.map((p, i) => {
    const curve = new THREE.EllipseCurve(0, 0, p.radius, p.radius, 0, Math.PI * 2);
    const points = curve.getPoints(140).map(p => new THREE.Vector3(p.x, p.y, 0));
    const orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      p.pubIndex !== undefined ? orbitMat.clone() : faintOrbitMat.clone(),
    );
    group.add(orbit);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(p.size, 24, 24),
      new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: p.pubIndex !== undefined ? 0.95 : 0.62 }),
    );
    planet.userData = {
      angle: (i / planetConfigs.length) * Math.PI * 2,
      name: p.name,
      radius: p.radius,
      speed: p.speed,
      pubIndex: p.pubIndex,
      baseSize: p.size,
      isResearch: p.pubIndex !== undefined,
    };
    group.add(planet);

    if (p.pubIndex !== undefined) {
      const highlight = new THREE.Mesh(
        new THREE.RingGeometry(p.size * 1.42, p.size * 1.62, 48),
        new THREE.MeshBasicMaterial({ color: 0xFDE68A, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
      );
      group.add(highlight);
      planet.userData.highlight = highlight;

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(p.size * 1.32, 24, 24),
        new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.08 }),
      );
      glow.userData.follow = planet;
      group.add(glow);
      planet.userData.glow = glow;

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(p.size * 3.4, 16, 16),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
      );
      hitTarget.userData = { pubIndex: p.pubIndex, isResearch: true, source: planet };
      group.add(hitTarget);
      planet.userData.hitTarget = hitTarget;
      hitTargets.push(hitTarget);
    }

    return planet;
  });

  let mx = 0;
  let my = 0;
  let visible = true;
  let activeCard = -1;
  let hoveredPlanet = -1;
  let cardHover = false;
  let closeTimer = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-2, -2);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function clearCloseTimer() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
  }

  function scheduleClose(delay = 4200) {
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      if (!cardHover) activeCard = -1;
    }, delay);
  }

  pubCards.forEach((card, i) => {
    card.querySelector('.pub-close')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      activeCard = -1;
      cardHover = false;
      clearCloseTimer();
    });
    card.addEventListener('mouseenter', () => {
      activeCard = i;
      cardHover = true;
      clearCloseTimer();
    });
    card.addEventListener('mouseleave', () => {
      cardHover = false;
      scheduleClose(1600);
    });
    card.addEventListener('focusin', () => {
      activeCard = i;
      clearCloseTimer();
    });
    card.addEventListener('focusout', () => { scheduleClose(800); });
  });

  section.addEventListener('mousemove', e => {
    const r = section.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = -((e.clientY - r.top) / r.height - 0.5) * 2;
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  });
  section.addEventListener('mouseleave', () => {
    mx = 0;
    my = 0;
    pointer.set(-2, -2);
    hoveredPlanet = -1;
    cardHover = false;
    scheduleClose(900);
  });

  section.addEventListener('click', () => {
    if (hoveredPlanet >= 0) {
      activeCard = hoveredPlanet;
      scheduleClose();
    }
  });

  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0.05 });
  observer.observe(section);

  function resize() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.set(0, w < 760 ? -0.22 : -0.58, 0);
    group.scale.setScalar(w < 760 ? 0.72 : 1.24);
  }
  resize();
  window.addEventListener('resize', resize);

  (function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    sun.scale.setScalar(1 + Math.sin(performance.now() * 0.002) * 0.08);
    sunRays.rotation.z += 0.0022;
    sunRays.scale.setScalar(1 + Math.sin(performance.now() * 0.0017) * 0.07);
    const sunProjected = sun.position.clone();
    group.localToWorld(sunProjected);
    sunProjected.project(camera);
    const sectionRect = section.getBoundingClientRect();
    sunLabel.style.left = `${clamp((sunProjected.x * 0.5 + 0.5) * sectionRect.width, 28, sectionRect.width - 28)}px`;
    sunLabel.style.top = `${clamp((-sunProjected.y * 0.5 + 0.5) * sectionRect.height, 28, sectionRect.height - 28)}px`;
    sunLabel.style.opacity = window.innerWidth > 768 ? '1' : '0';

    planets.forEach((planet, i) => {
      const data = planet.userData;
      const isActive = activeCard === data.pubIndex || hoveredPlanet === data.pubIndex;
      data.angle += isActive ? data.speed * 0.45 : data.speed;
      const x = Math.cos(data.angle) * data.radius;
      const y = Math.sin(data.angle) * data.radius;
      planet.position.set(x, y, 0);
      planet.scale.setScalar(planet.scale.x + ((isActive ? 1.65 : 1) - planet.scale.x) * 0.12);
      planet.material.opacity += (((isActive || data.isResearch) ? 0.95 : 0.62) - planet.material.opacity) * 0.08;

      if (data.highlight) {
        data.highlight.position.copy(planet.position);
        data.highlight.scale.setScalar(data.highlight.scale.x + ((isActive ? 1.18 : 1) - data.highlight.scale.x) * 0.1);
        data.highlight.material.opacity += ((isActive ? 0.7 : 0.38) - data.highlight.material.opacity) * 0.08;
      }

      if (data.glow) {
        data.glow.position.copy(planet.position);
        data.glow.scale.setScalar(data.glow.scale.x + ((isActive ? 1.28 : 1) - data.glow.scale.x) * 0.1);
        data.glow.material.opacity += ((isActive ? 0.18 : 0.08) - data.glow.material.opacity) * 0.08;
      }
      if (data.hitTarget) {
        data.hitTarget.position.copy(planet.position);
        data.hitTarget.scale.copy(planet.scale);
      }

      const label = planetLabels[i];
      if (label) {
        const projected = planet.position.clone();
        group.localToWorld(projected);
        projected.project(camera);
        const rect = sectionRect;
        const px = clamp((projected.x * 0.5 + 0.5) * rect.width, 34, rect.width - 34);
        const py = clamp((-projected.y * 0.5 + 0.5) * rect.height, 34, rect.height - 34);
        label.style.left = `${px}px`;
        label.style.top = `${py}px`;
        label.style.opacity = window.innerWidth > 768 ? '1' : '0';
      }
    });

    if (window.innerWidth > 768) {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets)[0];
      if (hit) {
        hoveredPlanet = hit.object.userData.pubIndex;
        section.style.cursor = 'pointer';
      } else if (!cardHover) {
        hoveredPlanet = -1;
        section.style.cursor = '';
      }

      pubCards.forEach((card, i) => {
        card.classList.toggle('active', activeCard === i);
      });
    } else {
      pubCards.forEach(card => card.classList.remove('active'));
    }

    group.rotation.y += (mx * 0.16 - group.rotation.y) * 0.03;
    group.rotation.x += (my * 0.08 - group.rotation.x) * 0.03;

    renderer.render(scene, camera);
  })();
}

// =============================================
// Scroll Reveal
// =============================================
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 5) * 75}ms`;
    obs.observe(el);
  });
}

// =============================================
// Theme Toggle
// =============================================
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const label = btn.querySelector('.theme-toggle-text');
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  function setTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    btn.setAttribute('aria-pressed', String(isDark));
    if (label) label.textContent = isDark ? 'Light theme' : 'Dark theme';
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  }

  setTheme(shouldUseDark);
  btn.addEventListener('click', e => {
    e.stopPropagation();
    setTheme(!document.body.classList.contains('dark-theme'));
  });
}

// =============================================
// Boot
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-loaded');
  initCursor();
  initDistortionMesh();
  initMagneticButtons();
  initHeroCanvas();
  initProjectCarousel();
  initSkillSphere();
  initContactCanvas();
  initResearchCanvas();
  initNavbar();
  initSectionAnchors();
  initReveal();
  initThemeToggle();
});
