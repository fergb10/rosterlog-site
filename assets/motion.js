// Motion de la landing: reveals por scroll, inclinación del mockup del hero,
// barra de progreso y reflector de las tarjetas. Todo lo visual vive en
// motion.css; aquí solo se ponen clases y variables CSS.
(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Índice por hijo para escalonar con calc(var(--i) * …)
    document.querySelectorAll('[data-stagger]').forEach(function (parent) {
        // Los decorativos (aria-hidden) no cuentan para el orden.
        let i = 0;
        Array.prototype.forEach.call(parent.children, function (child) {
            if (child.getAttribute('aria-hidden') !== 'true') child.style.setProperty('--i', i++);
        });
    });

    // Reveal-on-scroll. Sin IntersectionObserver se muestra todo de inmediato.
    const targets = document.querySelectorAll('[data-reveal], [data-stagger], .showcase-row');
    const show = function (el) {
        el.classList.add(el.classList.contains('showcase-row') ? 'visible' : 'in');
        // Terminada la cascada, el hover ya no debe heredar su retraso.
        if (el.hasAttribute('data-stagger')) setTimeout(function () { el.classList.add('done'); }, 2000);
    };
    if (!('IntersectionObserver' in window) || reduced) {
        targets.forEach(show);
    } else {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    show(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        targets.forEach(function (t) { io.observe(t); });
    }

    // Scroll: barra de progreso + mockup del hero que se endereza.
    const root = document.documentElement;
    const tilt = document.querySelector('.hero-mockup .tilt');
    let ticking = false;
    const onScroll = function () {
        ticking = false;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty('--scroll', max > 0 ? Math.min(1, window.scrollY / max) : 0);
        if (tilt && !reduced) {
            const vh = window.innerHeight;
            const top = tilt.getBoundingClientRect().top;
            // 1 = recién asomando abajo; 0 = ya subió a 35% del viewport.
            const t = Math.max(0, Math.min(1, (top - vh * 0.35) / (vh * 0.6)));
            tilt.style.setProperty('--tilt', t.toFixed(3));
        }
    };
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // Reflector que sigue al cursor en las tarjetas (solo con mouse).
    if (!reduced && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.feature-card').forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    // El avión del hero es SMIL; CSS no lo detiene, así que se pausa aquí.
    const sky = document.querySelector('.hero-sky');
    if (sky && reduced && sky.pauseAnimations) sky.pauseAnimations();
})();
