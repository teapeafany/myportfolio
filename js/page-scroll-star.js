/* Edge rail star: follows scroll; drag / track click to scroll. Home = letter + dim; other pages = linear. */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const progressBar = document.getElementById('about-progress-bar');
        const homeScrollTrack = document.getElementById('home-scroll-track');
        const homeScrollThumb = document.getElementById('home-scroll-thumb');
        if (!progressBar || !homeScrollTrack || !homeScrollThumb) return;

        const letterParagraphs = document.querySelectorAll('#about-carousel-track .about-text');
        const aboutSection = document.querySelector('.about-scroll-section');
        const carouselTrack = document.getElementById('about-carousel-track');
        const letterMode = letterParagraphs.length > 0 && aboutSection != null;

        let windowHeight = window.innerHeight;
        let maxScroll = 0;
        let letterRevealProgress = 0;

        function recalculateMaxScroll() {
            windowHeight = window.innerHeight;
            maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        }

        function visibleParaCountFromProgress(progress) {
            const n = letterParagraphs.length;
            if (n === 0) return 0;
            const p = Math.max(0, Math.min(1, progress));
            return Math.min(n, Math.max(1, Math.ceil(p * n)));
        }

        function alignCarouselTrack() {
            if (!carouselTrack) return;
            requestAnimationFrame(function () {
                carouselTrack.style.transform = 'translateY(0)';
            });
        }

        function scheduleAlignCarousel() {
            if (!letterMode) return;
            alignCarouselTrack();
            setTimeout(alignCarouselTrack, 60);
            setTimeout(alignCarouselTrack, 400);
        }

        function applyLetterFromProgress(progress) {
            if (!letterMode) return;
            const p = Math.max(0, Math.min(1, progress));
            const visibleCount = visibleParaCountFromProgress(p);
            letterParagraphs.forEach(function (el, i) {
                el.classList.toggle('is-visible', i < visibleCount);
            });
            scheduleAlignCarousel();
        }

        function letterProgressFromScroll() {
            const sy = window.scrollY || document.documentElement.scrollTop;
            if (!letterMode) {
                return maxScroll > 0 ? Math.max(0, Math.min(1, sy / maxScroll)) : 0;
            }
            const vh = window.innerHeight;
            const top = aboutSection.getBoundingClientRect().top + sy;
            const start = top - vh * 0.85;
            const denom = maxScroll - start;
            if (denom <= 0) {
                return sy >= start ? 1 : 0;
            }
            if (sy < start) {
                return 0;
            }
            return Math.max(0, Math.min(1, (sy - start) / denom));
        }

        function getLetterZoneStart() {
            if (!aboutSection) return 0;
            const sy = window.scrollY || document.documentElement.scrollTop;
            const vh = window.innerHeight;
            const top = aboutSection.getBoundingClientRect().top + sy;
            return top - vh * 0.85;
        }

        function scrollYFromLetterProgress(p) {
            recalculateMaxScroll();
            const clamped = Math.max(0, Math.min(1, p));
            if (!letterMode) {
                return maxScroll > 0 ? clamped * maxScroll : 0;
            }
            if (clamped <= 0) {
                return 0;
            }
            const start = getLetterZoneStart();
            const denom = maxScroll - start;
            if (denom <= 0) {
                return maxScroll;
            }
            return Math.min(maxScroll, Math.max(0, start + clamped * denom));
        }

        function setScrollFromLetterProgress(p) {
            const y = scrollYFromLetterProgress(p);
            window.scrollTo({ top: y, behavior: 'auto' });
            document.documentElement.scrollTop = y;
            document.body.scrollTop = y;
            recalculateMaxScroll();
            letterRevealProgress = letterProgressFromScroll();
            if (letterMode) {
                applyLetterFromProgress(letterRevealProgress);
            }
            syncRailThumb();
            if (letterMode) {
                updateFilmDimForLetter();
            }
            checkScrollPosition();
        }

        function getThumbTravel() {
            return Math.max(0, homeScrollTrack.clientHeight - homeScrollThumb.offsetHeight);
        }

        let railDragPointerId = null;
        let railDragOffsetY = 0;

        function endRailDrag(e) {
            if (railDragPointerId === null) return;
            if (e && e.pointerId !== railDragPointerId) return;
            try {
                homeScrollThumb.releasePointerCapture(railDragPointerId);
            } catch (err) { /* ignore */ }
            railDragPointerId = null;
            window.removeEventListener('pointermove', onRailPointerMove);
            window.removeEventListener('pointerup', endRailDrag);
            window.removeEventListener('pointercancel', endRailDrag);
        }

        function onRailPointerMove(e) {
            if (railDragPointerId === null || e.pointerId !== railDragPointerId) return;
            const trackRect = homeScrollTrack.getBoundingClientRect();
            const travel = getThumbTravel();
            if (travel <= 0) return;
            let thumbTop = e.clientY - trackRect.top - railDragOffsetY;
            thumbTop = Math.max(0, Math.min(travel, thumbTop));
            setScrollFromLetterProgress(thumbTop / travel);
            e.preventDefault();
        }

        progressBar.addEventListener('pointerdown', function (e) {
            if (!progressBar.classList.contains('visible')) return;
            if (e.button !== 0) return;
            const onThumb = e.target === homeScrollThumb || homeScrollThumb.contains(e.target);
            const travel = getThumbTravel();
            if (travel <= 0) return;
            const trackRect = homeScrollTrack.getBoundingClientRect();
            if (onThumb) {
                railDragPointerId = e.pointerId;
                const thumbRect = homeScrollThumb.getBoundingClientRect();
                railDragOffsetY = e.clientY - thumbRect.top;
                homeScrollThumb.setPointerCapture(e.pointerId);
                window.addEventListener('pointermove', onRailPointerMove, { passive: false });
                window.addEventListener('pointerup', endRailDrag);
                window.addEventListener('pointercancel', endRailDrag);
                e.preventDefault();
            } else {
                const thumbH = homeScrollThumb.offsetHeight;
                let thumbTop = e.clientY - trackRect.top - thumbH / 2;
                thumbTop = Math.max(0, Math.min(travel, thumbTop));
                setScrollFromLetterProgress(thumbTop / travel);
            }
        });

        function syncRailThumb() {
            const pct = letterRevealProgress;
            const travel = homeScrollTrack.clientHeight - homeScrollThumb.offsetHeight;
            const topPx = travel > 0 ? pct * travel : 0;
            homeScrollThumb.style.top = topPx + 'px';
            homeScrollThumb.setAttribute('aria-valuenow', String(Math.round(pct * 100)));
        }

        function syncLetterFromScroll() {
            recalculateMaxScroll();
            letterRevealProgress = letterProgressFromScroll();
            if (letterMode) {
                applyLetterFromProgress(letterRevealProgress);
            }
            syncRailThumb();
        }

        function updateRailVisibility() {
            const sy = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const vis = sy >= 0 && sy <= maxScroll + 1;
            progressBar.classList.toggle('visible', vis);
            progressBar.setAttribute('aria-hidden', vis ? 'false' : 'true');
        }

        function checkScrollPosition() {
            let scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY > maxScroll) {
                window.scrollTo({ top: maxScroll, behavior: 'auto' });
                scrollY = maxScroll;
            }
            updateRailVisibility();
        }

        function enforceScrollLimit() {
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY > maxScroll) {
                window.scrollTo(0, maxScroll);
                document.documentElement.scrollTop = maxScroll;
                document.body.scrollTop = maxScroll;
                return true;
            }
            return false;
        }

        let ticking = false;

        function updateFilmDimForLetter() {
            if (!letterMode) return;
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const threshold = windowHeight * 0.3;
            document.body.classList.toggle('body--letter-dim', scrollY >= threshold);
        }

        window.addEventListener(
            'scroll',
            function () {
                const clamped = enforceScrollLimit();
                if (clamped) {
                    checkScrollPosition();
                }
                if (letterMode) {
                    updateFilmDimForLetter();
                }
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        checkScrollPosition();
                        syncLetterFromScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            },
            { passive: true }
        );

        window.addEventListener('resize', function () {
            recalculateMaxScroll();
            if (window.scrollY > maxScroll) {
                window.scrollTo(0, maxScroll);
            }
            if (letterMode) {
                updateFilmDimForLetter();
                scheduleAlignCarousel();
            }
            checkScrollPosition();
            syncLetterFromScroll();
        });

        recalculateMaxScroll();
        syncLetterFromScroll();
        if (letterMode) {
            updateFilmDimForLetter();
        }
        checkScrollPosition();
        requestAnimationFrame(function () {
            recalculateMaxScroll();
            syncLetterFromScroll();
        });
    });
})();
