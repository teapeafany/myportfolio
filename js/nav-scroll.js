/* Hide top nav when scrolling down, show when scrolling up (or near top of page). */
(function () {
    var nav = document.getElementById('navigation-container');
    if (!nav) return;

    var lastY = window.scrollY || document.documentElement.scrollTop || 0;
    var ticking = false;
    var TOP_REVEAL = 56;
    /* Hiding needs a threshold so tiny jitter doesn’t flash the bar. */
    var DELTA_HIDE = 6;

    function apply() {
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        var dy = y - lastY;
        lastY = y;

        if (y < TOP_REVEAL) {
            nav.classList.remove('nav-scroll-hidden');
        } else if (dy < 0) {
            /* Any upward movement brings the nav back (trackpads often use small steps). */
            nav.classList.remove('nav-scroll-hidden');
        } else if (dy > DELTA_HIDE) {
            nav.classList.add('nav-scroll-hidden');
        }
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(apply);
        }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
})();
