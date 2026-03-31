/* Hide top nav when scrolling down, show when scrolling up (or near top of page). */
(function () {
    var nav = document.getElementById('navigation-container');
    if (!nav) return;

    var lastY = window.scrollY || document.documentElement.scrollTop || 0;
    var ticking = false;
    var TOP_REVEAL = 56;
    var DELTA = 5;

    function apply() {
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        var dy = y - lastY;
        lastY = y;

        if (y < TOP_REVEAL) {
            nav.classList.remove('nav-scroll-hidden');
        } else if (dy > DELTA) {
            nav.classList.add('nav-scroll-hidden');
        } else if (dy < -DELTA) {
            nav.classList.remove('nav-scroll-hidden');
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
