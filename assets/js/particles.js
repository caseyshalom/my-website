/* ========================================
   Project Canvas - Shape-shifting Sphere
   ======================================== */
(function () {
    const canvas = document.getElementById('project-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = 760, H = 760;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const TOTAL = 1800;
    const R = 320;
    let frame = 0;
    let morphProgress = 1;
    let targetShape = -1;
    const mouse = { x: W / 2, y: H / 2, active: false };

    function sphere(i, n) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return {
            x: R * Math.sin(phi) * Math.cos(theta),
            y: R * Math.sin(phi) * Math.sin(theta),
            z: R * Math.cos(phi)
        };
    }

    function fract(value) {
        return value - Math.floor(value);
    }

    function pointNoise(i, seed) {
        return fract(Math.sin(i * 127.1 + seed * 311.7) * 43758.5453123);
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svgHost = document.createElementNS(svgNS, 'svg');
    svgHost.setAttribute('width', '0');
    svgHost.setAttribute('height', '0');
    svgHost.setAttribute('aria-hidden', 'true');
    svgHost.style.position = 'absolute';
    svgHost.style.width = '0';
    svgHost.style.height = '0';
    svgHost.style.overflow = 'hidden';
    svgHost.style.left = '-9999px';
    svgHost.style.top = '-9999px';
    document.body.appendChild(svgHost);

    function createPathSampler(d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        svgHost.appendChild(path);
        return { path, length: Math.max(path.getTotalLength(), 1) };
    }

    function pointOnPath(sampler, t) {
        const p = sampler.path.getPointAtLength(sampler.length * t);
        return { x: p.x, y: p.y };
    }

    function distributeSamples(localT, samplers) {
        const totalWeight = samplers.reduce((sum, item) => sum + item.weight, 0);
        let acc = 0;
        for (let i = 0; i < samplers.length; i++) {
            const item = samplers[i];
            const next = acc + item.weight / totalWeight;
            if (localT <= next || i === samplers.length - 1) {
                const innerT = (localT - acc) / Math.max(item.weight / totalWeight, 0.0001);
                const point = item.sample(Math.min(Math.max(innerT, 0), 1), item);
                return {
                    x: point.x + (item.cx || 0),
                    y: point.y + (item.cy || 0),
                    z: (point.z || 0) + (item.cz || 0),
                    depth: item.depth || 0,
                    jitter: item.jitter || 0
                };
            }
            acc = next;
        }
        const fallback = samplers[0].sample(localT, samplers[0]);
        return {
            x: fallback.x + (samplers[0].cx || 0),
            y: fallback.y + (samplers[0].cy || 0),
            z: (fallback.z || 0) + (samplers[0].cz || 0),
            depth: samplers[0].depth || 0,
            jitter: samplers[0].jitter || 0
        };
    }

    const geminiMain = createPathSampler(
        'M 0 -148 C 22 -122 40 -102 58 -72 C 82 -32 112 -14 148 0 C 112 14 82 32 58 72 C 40 102 22 122 0 148 C -22 122 -40 102 -58 72 C -82 32 -112 14 -148 0 C -112 -14 -82 -32 -58 -72 C -40 -102 -22 -122 0 -148 Z'
    );
    const geminiSpark = createPathSampler(
        'M 0 -54 C 8 -42 16 -32 24 -18 C 36 -6 46 0 56 4 C 46 8 36 14 24 28 C 16 42 8 52 0 64 C -8 52 -16 42 -24 28 C -36 14 -46 8 -56 4 C -46 0 -36 -6 -24 -18 C -16 -32 -8 -42 0 -54 Z'
    );

    const javaSteamLeft = createPathSampler(
        'M -44 -146 C -70 -112 -70 -86 -42 -58'
    );
    const javaSteamCenter = createPathSampler(
        'M 0 -156 C -18 -118 -18 -90 0 -60'
    );
    const javaSteamRight = createPathSampler(
        'M 44 -146 C 70 -112 70 -86 42 -58'
    );
    const javaCup = createPathSampler(
        'M -92 -10 C -92 -64 -48 -100 0 -100 C 48 -100 92 -64 92 -10 C 92 30 66 66 24 80 C 8 86 -8 86 -24 80 C -66 66 -92 30 -92 -10 Z'
    );
    const javaHandle = createPathSampler(
        'M 92 -38 C 132 -38 136 16 102 28 C 114 6 112 -18 92 -38 Z'
    );
    const codeLeft = createPathSampler(
        'M -108 0 L -22 -84 L -6 -66 L -70 0 L -6 66 L -22 84 Z'
    );
    const codeSlash = createPathSampler(
        'M -16 100 L 16 -100 L 44 -100 L 12 100 Z'
    );
    const codeRight = createPathSampler(
        'M 108 0 L 22 -84 L 6 -66 L 70 0 L 6 66 L 22 84 Z'
    );

    function geminiShape(i) {
        const t = (i + 0.5) / TOTAL;
        return distributeSamples(t, [
            { weight: 0.84, sample: (u) => pointOnPath(geminiMain, u), depth: 60, cx: 0, cy: 0, cz: 0, jitter: 0.14 },
            { weight: 0.16, sample: (u) => pointOnPath(geminiSpark, u), depth: 30, cx: 0, cy: -86, cz: 0, jitter: 0.1 }
        ]);
    }

    function javaShape(i) {
        const t = (i + 0.5) / TOTAL;
        return distributeSamples(t, [
            { weight: 0.14, sample: (u) => pointOnPath(javaSteamLeft, u), depth: 22, cx: 0, cy: -2, cz: 0, jitter: 0.12 },
            { weight: 0.14, sample: (u) => pointOnPath(javaSteamCenter, u), depth: 22, cx: 0, cy: 0, cz: 0, jitter: 0.12 },
            { weight: 0.14, sample: (u) => pointOnPath(javaSteamRight, u), depth: 22, cx: 0, cy: -2, cz: 0, jitter: 0.12 },
            { weight: 0.44, sample: (u) => pointOnPath(javaCup, u), depth: 58, cx: 0, cy: 52, cz: 0, jitter: 0.16 },
            { weight: 0.14, sample: (u) => pointOnPath(javaHandle, u), depth: 28, cx: 0, cy: 52, cz: 0, jitter: 0.14 }
        ]);
    }

    function codeShape(i) {
        const t = (i + 0.5) / TOTAL;
        return distributeSamples(t, [
            { weight: 0.34, sample: (u) => pointOnPath(codeLeft, u), depth: 42, cx: 0, cy: 0, cz: 0, jitter: 0.14 },
            { weight: 0.32, sample: (u) => pointOnPath(codeSlash, u), depth: 34, cx: 0, cy: 0, cz: 0, jitter: 0.12 },
            { weight: 0.34, sample: (u) => pointOnPath(codeRight, u), depth: 42, cx: 0, cy: 0, cz: 0, jitter: 0.14 }
        ]);
    }

    const shapeFns = [geminiShape, javaShape, codeShape];
    const shapeCache = new Map();
    const particles = Array.from({ length: TOTAL }, (_, i) => {
        const p = sphere(i, TOTAL);
        return {
            x: p.x, y: p.y, z: p.z,
            sx: p.x, sy: p.y, sz: p.z,
            tx: p.x, ty: p.y, tz: p.z,
            size: Math.random() * 1.8 + 0.4,
            op: Math.random() * 0.5 + 0.5
        };
    });

    window.setProjectShape = function (idx) {
        const s = idx % shapeFns.length;
        if (s === targetShape && morphProgress >= 1) return;
        targetShape = s;
        morphProgress = 0;
        if (!shapeCache.has(s)) {
            shapeCache.set(s, Array.from({ length: TOTAL }, (_, i) => shapeFns[s](i, TOTAL)));
        }
        const targets = shapeCache.get(s);
        const bounds = targets.reduce((acc, t) => {
            acc.minX = Math.min(acc.minX, t.x);
            acc.minY = Math.min(acc.minY, t.y);
            acc.minZ = Math.min(acc.minZ, t.z);
            acc.maxX = Math.max(acc.maxX, t.x);
            acc.maxY = Math.max(acc.maxY, t.y);
            acc.maxZ = Math.max(acc.maxZ, t.z);
            acc.sumX += t.x;
            acc.sumY += t.y;
            acc.sumZ += t.z;
            return acc;
        }, {
            minX: Infinity, minY: Infinity, minZ: Infinity,
            maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity,
            sumX: 0, sumY: 0, sumZ: 0
        });
        const centerX = bounds.sumX / TOTAL;
        const centerY = bounds.sumY / TOTAL;
        const centerZ = bounds.sumZ / TOTAL;
        const span = Math.max(
            bounds.maxX - bounds.minX,
            bounds.maxY - bounds.minY,
            bounds.maxZ - bounds.minZ,
            1
        );
        const scale = (R * 1.92) / span;
        particles.forEach((p, i) => {
            p.sx = p.x; p.sy = p.y; p.sz = p.z;
            const t = targets[i];
            p.tx = (t.x - centerX) * scale;
            p.ty = (t.y - centerY) * scale;
            p.tz = ((t.z - centerZ) * scale) + ((pointNoise(i, s + 11.7) - 0.5) * (t.depth || 0));
        });
    };

    function ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) * (W / r.width);
        mouse.y = (e.clientY - r.top) * (H / r.height);
        mouse.active = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;

        if (morphProgress < 1) {
            morphProgress = Math.min(1, morphProgress + 0.014);
            const e = ease(morphProgress);
            particles.forEach((p) => {
                p.x = p.sx + (p.tx - p.sx) * e;
                p.y = p.sy + (p.ty - p.sy) * e;
                p.z = p.sz + (p.tz - p.sz) * e;
            });
        }

        const rotY = frame * 0.0035;
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        const projected = particles.map((p) => {
            let px = p.x, py = p.y, pz = p.z;
            if (mouse.active) {
                const x1t = px * cosY - pz * sinY;
                const z1t = px * sinY + pz * cosY;
                const sc = (z1t + R * 1.6) / (R * 2.6);
                const sx = W / 2 + x1t * sc;
                const sy = H / 2 + py * sc;
                const dx = sx - mouse.x;
                const dy = sy - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0 && dist < 140) {
                    const force = ((140 - dist) / 140) * 28;
                    px += (dx / dist) * force;
                    py += (dy / dist) * force;
                }
            }

            const x1 = px * cosY - pz * sinY;
            const z1 = px * sinY + pz * cosY;
            const scale = (z1 + R * 1.55) / (R * 2.55);
            return {
                sx: W / 2 + x1 * scale,
                sy: H / 2 + py * scale,
                scale,
                size: p.size,
                op: p.op * scale
            };
        });

        projected.sort((a, b) => a.scale - b.scale);
        projected.forEach((p) => {
            if (p.scale > 0.6) {
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, p.size * p.scale * 6.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(132,138,230,${(p.op * 0.04).toFixed(3)})`;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, p.size * p.scale * 1.12, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(238,241,255,${Math.min(p.op * 0.92, 1).toFixed(3)})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    draw();
})();

/* ========================================
   GSAP ScrollTrigger - Project Showcase
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const showcase = document.getElementById('projects-showcase');
    if (!showcase) return;

    const canvas = document.getElementById('project-canvas');
    const intro = showcase.querySelector('.projects-showcase__intro');
    const cards = gsap.utils.toArray('.pcard');
    const N = cards.length;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const peekX = isMobile ? 42 : 430;
    const exitX = isMobile ? -74 : -150;
    const exitY = isMobile ? -96 : -128;
    const cardLift = isMobile ? -10 : -96;
    const sphereLift = isMobile ? -14 : -108;
    let activeIndex = -1;

    function setActiveCard(index) {
        const clamped = Math.max(0, Math.min(N - 1, index));
        if (clamped === activeIndex) return;
        activeIndex = clamped;

        cards.forEach((card, i) => {
            const isActive = i === clamped;
            card.classList.toggle('is-active', isActive);
            gsap.to(card.querySelector('.pcard__inner'), {
                duration: 0.25,
                ease: 'power2.out',
                boxShadow: isActive
                    ? '0 34px 90px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.12)'
                    : '0 24px 70px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)'
            });
        });

        if (window.setProjectShape) window.setProjectShape(clamped);
    }

    gsap.set(canvas, { opacity: 0, scale: 0.82, x: isMobile ? -10 : -48, y: sphereLift });
    gsap.set(intro, { opacity: 0, y: 0 });

    cards.forEach((card, i) => {
        gsap.set(card, {
            opacity: i === 1 ? 0.35 : 0,
            x: i === 1 ? peekX : peekX + 80,
            y: cardLift,
            yPercent: -50,
            scale: i === 1 ? 0.95 : 0.88,
            rotateY: i === 1 && !isMobile ? -7 : 0,
            zIndex: N - i
        });
        gsap.set(card.querySelector('.pcard__title'), { y: '110%' });
        gsap.set(card.querySelector('.pcard__desc'), { opacity: 0, y: 28 });
        gsap.set(card.querySelector('.pcard__footer'), { opacity: 0, y: 18 });
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: showcase,
            start: 'top top',
            end: `+=${N * 105}%`,
            scrub: 0.85,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
                const idx = Math.min(N - 1, Math.floor(self.progress * N));
                setActiveCard(idx);
            }
        }
    });

    tl.to(intro, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0)
      .to(canvas, { opacity: 1, scale: 1, x: 0, y: sphereLift, duration: 0.55, ease: 'power2.out' }, 0);

    cards.forEach((card, i) => {
        const title = card.querySelector('.pcard__title');
        const desc = card.querySelector('.pcard__desc');
        const footer = card.querySelector('.pcard__footer');
        const next = cards[i + 1];
        const start = i * 1.05;
        const settle = start + 0.1;
        const exit = start + 0.78;

        tl.to(card, {
            opacity: 1,
            x: 0,
            y: cardLift,
            yPercent: -50,
            scale: 1,
            rotateY: 0,
            duration: 0.52,
            ease: 'power3.out'
        }, start)
          .to(title, { y: '0%', duration: 0.46, ease: 'power3.out' }, start + 0.08)
          .to(desc, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }, start + 0.18)
          .to(footer, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }, start + 0.26)
          .to({}, { duration: 0.25 }, settle);

        if (next) {
            gsap.set(next, { zIndex: N + i + 1 });
            tl.to(next, {
                opacity: 0.52,
                x: peekX,
                y: cardLift,
                yPercent: -50,
                scale: 0.97,
                rotateY: isMobile ? 0 : -7,
                duration: 0.45,
                ease: 'power2.out'
            }, start + 0.18)
              .to(title, { y: '-110%', duration: 0.35, ease: 'power3.in' }, exit)
              .to(desc, { opacity: 0, y: -24, duration: 0.28, ease: 'power2.in' }, exit + 0.02)
              .to(footer, { opacity: 0, y: -16, duration: 0.24, ease: 'power2.in' }, exit + 0.04)
              .to(card, {
                  opacity: 0,
                  x: exitX,
                  y: exitY,
                  yPercent: -50,
                  scale: 0.92,
                  rotateY: isMobile ? 0 : 8,
                  duration: 0.4,
                  ease: 'power3.in'
              }, exit + 0.05)
              .to(next, {
                  opacity: 1,
                  x: 0,
                  y: cardLift,
                  yPercent: -50,
                  scale: 1,
                  rotateY: 0,
                  duration: 0.52,
                  ease: 'power3.out'
              }, exit + 0.08);
        }

        if (i === N - 1) {
            tl.to({}, { duration: 0.45 }, exit)
              .to(canvas, { opacity: 0.38, scale: 0.94, y: sphereLift, duration: 0.42, ease: 'power2.inOut' }, exit + 0.45)
              .to(intro, { opacity: 0.28, y: -18, duration: 0.34, ease: 'power2.inOut' }, exit + 0.45);
        }
    });

    setActiveCard(0);
});
