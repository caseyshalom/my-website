/* ========================================
   Personal Portfolio — Main Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Global features
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initCustomCursor();
    initInteractiveBackground();
    initParticleBackground();
    initMagneticElements();
    updateActiveNavLink();
    initCertFilters();

    // Page-specific features
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        const limit = (page === 'index.html' || page === '') ? 3 : 100;
        initGitHubProjects('caseyshalom', limit);
    }

    const terminal = document.querySelector('.terminal');
    if (terminal) {
        initTerminalTyping();
    }
});

function updateActiveNavLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* ========================================
   Navbar scroll behavior
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/* ========================================
   Mobile Menu Toggle
   ======================================== */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}



/* ========================================
   Scroll Reveal Animation
   ======================================== */
function initScrollReveal() {
    const revealTargets = [
        '.project-card',
        '.timeline__item',
        '.contact-card',
        '.section__header',
        '.experience-hero__title',
        '.experience-hero__subtitle',
        '.experience-hero__badge',
        '.cert-card',
        '.academy__card',
        '.academy__header',
        '.cert-filters',
        '.community-card'
    ];

    const elements = document.querySelectorAll(revealTargets.join(', '));

    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    elements.forEach(el => observer.observe(el));
}

/* ========================================
   Terminal Typing Effect
   ======================================== */
function initTerminalTyping() {
    const typedElement = document.getElementById('typed-text');
    const outputElement = document.getElementById('terminal-output');
    const cursorElement = document.querySelector('.terminal__cursor');

    const commands = [
        {
            command: 'whoami',
            output: [
                { text: '→ Name:     ', highlight: 'Casey Shalom' },
                { text: '→ Role:     ', highlight: 'Student' },
                { text: '→ Location: ', highlight: 'Indonesia' },
                { text: '→ Status:   ', highlight: 'Open to opportunities', class: 'success' },
            ]
        },
        {
            command: 'cat skills.json',
            output: [
                { text: '{' },
                { text: '  "languages": ', highlight: '["Python", "Go", "Java"]' },
                { text: '  "cloud":     ', highlight: '["AWS", "GCP"]' },
                { text: '  "tools":      ', highlight: '["Docker", "Git", "Terraform"]' },
                { text: '}' },
            ]
        },
        {
            command: 'echo "Hello, World!"',
            output: [
                { text: '', highlight: 'Hello, World!' },
                { text: '', success: 'Thanks for visiting my portfolio ✨' },
            ]
        }
    ];

    let commandIndex = 0;

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function typeCommand(text) {
        typedElement.textContent = '';
        for (let i = 0; i < text.length; i++) {
            typedElement.textContent += text[i];
            await sleep(45 + Math.random() * 35);
        }
    }

    async function showOutput(outputLines) {
        outputElement.innerHTML = '';
        for (const line of outputLines) {
            const p = document.createElement('p');
            if (line.highlight) {
                p.innerHTML = `<span style="color: var(--text-muted)">${line.text}</span><span class="${line.class || 'highlight'}">${line.highlight}</span>`;
            } else if (line.success) {
                p.innerHTML = `<span class="success">${line.success}</span>`;
            } else {
                p.innerHTML = `<span style="color: var(--text-muted)">${line.text}</span>`;
            }
            outputElement.appendChild(p);
            await sleep(80);
        }
    }

    async function runTerminalLoop() {
        while (true) {
            const cmd = commands[commandIndex];

            // Type the command
            await typeCommand(cmd.command);
            await sleep(400);

            // Hide cursor briefly, show output
            cursorElement.style.display = 'none';
            await showOutput(cmd.output);

            // Wait before next command
            await sleep(3000);

            // Clear and move to next
            cursorElement.style.display = 'inline';
            outputElement.innerHTML = '';
            typedElement.textContent = '';

            commandIndex = (commandIndex + 1) % commands.length;
            await sleep(500);
        }
    }

    // Start with a small delay
    setTimeout(runTerminalLoop, 800);
}

/* ========================================
   Interactive Features
   ======================================== */

function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    const links = document.querySelectorAll('a, button, .project-card, .marquee-item');

    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        cursor.style.transform = `translate(${x}px, ${y}px)`;
        follower.style.transform = `translate(${x - 11}px, ${y - 11}px)`;
    });

    document.body.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .project-card, .marquee-item');
        if (!target) return;

        document.body.classList.add('cursor-active');
        
        const color = target.getAttribute('data-cursor-color');
        if (color) {
            follower.style.borderColor = color;
            follower.style.background = `${color}22`;
            cursor.style.background = color;
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, .project-card, .marquee-item');
        if (!target) return;

        document.body.classList.remove('cursor-active');
        follower.style.borderColor = '';
        follower.style.background = '';
        cursor.style.background = '';
    });
}

function initInteractiveBackground() {
    const glows = document.querySelectorAll('.bg-glow');

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        glows.forEach((glow, index) => {
            const speed = (index + 1) * 30;
            const xOffset = x * speed;
            const yOffset = y * speed;

            // Combine with existing floating animation via CSS variables if preferred, 
            // but simple transform is easier for direct follow
            glow.style.marginLeft = `${xOffset}px`;
            glow.style.marginTop = `${yOffset}px`;
        });
    });
}

async function initGitHubProjects(username, limit = 100) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    try {
        // Fetch repositories from GitHub API
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
        const repos = await response.json();

        if (!Array.isArray(repos)) throw new Error('Could not fetch repos');

        let displayRepos = [];

        if (limit <= 3) {
            const priority = ['evergreen', 'demo', 'chatbot'];
            priority.forEach(key => {
                const found = repos.find(repo => {
                    const name = repo.name.toLowerCase();
                    if (key === 'evergreen') return name.includes('evergreen');
                    return name.includes(key);
                });
                if (found) displayRepos.push(found);
            });
        } else {
            displayRepos = repos.filter(repo => !repo.name.toLowerCase().includes('unified'));
        }

        const finalRepos = displayRepos.slice(0, limit);

        // Clear existing static projects
        projectsGrid.innerHTML = '';

        finalRepos.forEach((repo, index) => {
            const card = document.createElement('a');
            card.href = repo.html_url;
            card.target = '_blank';
            card.className = 'project-card reveal';

            // Determine icon and color based on name/description/language
            let iconClass = 'fas fa-code';
            let cursorColor = '#6c63ff'; // Default accent

            const name = repo.name.toLowerCase();
            const desc = (repo.description || '').toLowerCase();
            const lang = (repo.language || '').toLowerCase();

            if (name.includes('evergreen')) {
                iconClass = 'fas fa-tree';
                cursorColor = '#10b981'; // Emerald Green
            } else if (name.includes('bot') || desc.includes('bot')) {
                iconClass = 'fas fa-robot';
                cursorColor = '#00d2ff'; // Cyan
            } else if (name.includes('demo') || lang === 'java') {
                iconClass = 'fab fa-java';
                cursorColor = '#f89820'; // Java Orange
            } else if (name.includes('chat') || name.includes('ai') || desc.includes('ai')) {
                iconClass = 'fas fa-brain';
                cursorColor = '#a78bfa'; // Purple
            } else if (lang === 'javascript' || lang === 'typescript' || name.includes('web') || name.includes('site')) {
                iconClass = 'fas fa-globe';
                cursorColor = '#3b82f6'; // Blue
            } else if (name.includes('tool') || name.includes('cli') || name.includes('automation')) {
                iconClass = 'fas fa-terminal';
                cursorColor = '#94a3b8'; // Slate
            } else if (lang === 'python') {
                iconClass = 'fab fa-python';
                cursorColor = '#3776ab'; // Python Blue
            }

            card.setAttribute('data-cursor-color', cursorColor);
            card.style.setProperty('--hover-color', cursorColor);
            card.style.setProperty('--hover-glow', `${cursorColor}33`); // ~20% opacity glow

            // Format tags (using languages and topics)
            let tags = repo.language ? `<span>${repo.language}</span>` : '';
            if (repo.topics && repo.topics.length > 0) {
                tags += repo.topics.slice(0, 2).map(t => `<span>${t}</span>`).join('');
            }

            const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            }).toUpperCase();

            card.innerHTML = `
                <div class="project-card__header">
                    <div class="project-card__icon-box">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="project-card__arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
                <h3 class="project-card__title">${repo.name}</h3>
                <p class="project-card__desc">${repo.description || 'Professional repository showcasing clean architecture and efficient digital solutions.'}</p>
                <div class="project-card__tags">
                    ${tags}
                </div>
                <div class="project-card__footer">
                    <div class="project-card__stats-left">
                        <div class="project-card__stat">
                            <i class="far fa-star"></i> ${repo.stargazers_count}
                        </div>
                        <div class="project-card__stat">
                            <i class="fas fa-code-branch"></i> ${repo.forks_count}
                        </div>
                    </div>
                    <div class="project-card__date">
                        <i class="far fa-calendar-alt"></i> ${updatedDate}
                    </div>
                </div>
            `;

            projectsGrid.appendChild(card);
        });

        // Re-run scroll reveal for new items
        const newElements = projectsGrid.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, index * 100);
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        newElements.forEach(el => revealObserver.observe(el));

        // Re-run tilt for new cards
        initTiltForCards(newElements);

    } catch (error) {
        console.error('Error loading GitHub projects:', error);
        projectsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load projects from GitHub. Please try again later.</p>
            </div>
        `;
    }
}

function initTiltForCards(cards) {
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xRotation = 15 * ((y - rect.height / 2) / rect.height);
            const yRotation = -15 * ((x - rect.width / 2) / rect.width);

            card.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function initMagneticElements() {
    const elements = document.querySelectorAll('.btn, .nav-link, .navbar__logo');

    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

function initCertFilters() {
    const filters = document.querySelector('.cert-filters');
    const cards = document.querySelectorAll('.cert-card');
    if (!filters || !cards.length) return;

    const filterBtns = filters.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter cards
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    // Trigger a small entrance animation
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/* ========================================
   Advanced 3D Particle Background (Vanta.js)
   ======================================== */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initParticleBackground() {
    try {
        // Load Three.js and Vanta.js dynamically
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js');
        
        // Remove old static background elements if they exist
        const oldCanvas = document.getElementById('bg-canvas');
        if (oldCanvas) oldCanvas.remove();
        
        document.querySelectorAll('.bg-glow').forEach(el => el.remove());

        // Create Vanta container
        let vantaBg = document.getElementById('vanta-bg');
        if (!vantaBg) {
            vantaBg = document.createElement('div');
            vantaBg.id = 'vanta-bg';
            vantaBg.style.position = 'fixed';
            vantaBg.style.zIndex = '0';
            vantaBg.style.top = '0';
            vantaBg.style.left = '0';
            vantaBg.style.width = '100vw';
            vantaBg.style.height = '100vh';
            vantaBg.style.opacity = '0.4'; // Make it subtle and fade into background
            // We keep pointer-events active to allow interaction, 
            // but z-index:0 keeps it behind content.
            document.body.prepend(vantaBg);
        }

        // Initialize Vanta NET with more elegant parameters
        if (window.VANTA && window.VANTA.NET) {
            window.VANTA.NET({
                el: "#vanta-bg",
                mouseControls: false,
                touchControls: false,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x6c63ff, // Primary accent
                backgroundColor: 0x0a0a0f, // Primary bg color
                points: 9.00,      // Fewer points for less clutter
                maxDistance: 24.00, // Longer connection distance
                spacing: 20.00,    // More space between nodes
                showDots: true
            });
        }
        
    } catch (e) {
        console.error("Failed to load Vanta.js for advanced background", e);
    }
}