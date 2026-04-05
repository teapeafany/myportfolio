/* Shared EchoSphere-style case study shell: nav, bubbles, scroll fade, typing kickers, image zoom.
 * Each page sets window.CaseStudyShell before loading this script. */
(function () {
    'use strict';

    var CS = window.CaseStudyShell || {};

    function includeNavigation() {
        var el = document.getElementById('navigation-container');
        if (!el) return;
        el.innerHTML =
            '<nav class="nav-menu">' +
            '<a href="index.html" class="nav-item" id="nav-home">home</a>' +
            '<a href="work.html" class="nav-item" id="nav-work">work</a>' +
            '<a href="headspace.html" class="nav-item" id="nav-headspace">headspace</a>' +
            '<a href="cinema.html" class="nav-item" id="nav-cinema">the cinema</a>' +
            '</nav>';
        var workLink = document.getElementById('nav-work');
        if (workLink) workLink.classList.add('active');
    }

    function initVideos() {
        var vids = document.querySelectorAll('video');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            vids.forEach(function (v) {
                v.removeAttribute('autoplay');
                v.pause();
            });
            return;
        }
        vids.forEach(function (v) {
            if (v.hasAttribute('autoplay') && v.muted) v.play().catch(function () {});
        });
    }

    function mulberry32(seed) {
        var a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    window.echosphereSpawnBubbles = function (container, bubbles, opts) {
        if (!container) return;
        opts = opts || {};
        var seedMul = opts.seedMul != null ? opts.seedMul : 99991;
        var seedAdd = opts.seedAdd != null ? opts.seedAdd : 0;
        var driftScale = opts.driftScale != null ? opts.driftScale : 1;
        var bubbleClass = opts.bubbleClass || 'bubble';
        var panel = !!opts.panel;

        container.innerHTML = '';

        for (var bi = 0; bi < bubbles.length; bi++) {
            var b = bubbles[bi];
            var el = document.createElement('div');
            el.className = bubbleClass;
            el.style.setProperty('--size', b.size + 'px');
            el.style.setProperty('--left', b.left);
            el.style.setProperty('--top', b.top);
            el.style.setProperty('--delay', b.delay + 's');
            el.style.setProperty('--duration', b.duration + 's');
            el.style.setProperty('--grad', b.gradient);

            var rand = mulberry32((b.id * seedMul + seedAdd) >>> 0);
            var dxRange = driftScale * (18 + (b.size / 320) * 28);
            var dyRange = driftScale * (28 + (b.size / 320) * 55);
            var x1 = (rand() * 2 - 1) * dxRange;
            var y1 = -(0.35 + rand() * 0.65) * dyRange;
            var x2 = (rand() * 2 - 1) * dxRange * 0.85;
            var y2 = (rand() * 2 - 1) * dyRange * 0.45;
            var x3 = (rand() * 2 - 1) * dxRange * 0.95;
            var y3 = (0.15 + rand() * 0.85) * dyRange * 0.35;
            var s0 = 1 + rand() * 0.12;
            var s1 = 1 + rand() * 0.15;
            var s2 = 1 - rand() * 0.1;
            var s3 = 1 + rand() * 0.1;
            var r1 = (rand() * 2 - 1) * 7;
            var r2 = (rand() * 2 - 1) * 5;
            var r3 = (rand() * 2 - 1) * 6;
            var sizeNorm = Math.min(1, b.size / 360);
            var o0 = Math.min(0.95, 0.38 + sizeNorm * 0.42 + rand() * 0.1);
            if (panel) o0 = Math.min(0.98, o0 + 0.12);
            var o1 = Math.max(0.18, o0 - (0.06 + rand() * 0.08));
            var o2 = Math.min(0.95, o0 + (rand() * 0.1 - 0.03));
            var o3 = Math.max(0.18, o0 - (0.05 + rand() * 0.06));
            var isFront = panel
                ? b.id === 1 || b.id === 3 || b.id === 5 || b.id === 7
                : b.id === 2 || b.id === 4 || b.id === 6 || b.id === 10;
            var blur = isFront
                ? Math.max(3.5, 8 + rand() * 6 - sizeNorm * 5.5)
                : Math.max(panel ? 10 : 14, (panel ? 16 : 24) + rand() * (panel ? 10 : 14) - sizeNorm * 9);
            var vo0 = o0;
            var vo1 = o1;
            var vo2 = o2;
            var vo3 = o3;
            if (isFront) {
                vo0 = Math.min(0.98, o0 + 0.08);
                vo1 = Math.min(0.98, o1 + 0.06);
                vo2 = Math.min(0.98, o2 + 0.06);
                vo3 = Math.min(0.98, o3 + 0.05);
            }
            el.style.setProperty('--blur', blur + 'px');
            el.style.setProperty('--x1', x1.toFixed(1) + 'px');
            el.style.setProperty('--y1', y1.toFixed(1) + 'px');
            el.style.setProperty('--x2', x2.toFixed(1) + 'px');
            el.style.setProperty('--y2', y2.toFixed(1) + 'px');
            el.style.setProperty('--x3', x3.toFixed(1) + 'px');
            el.style.setProperty('--y3', y3.toFixed(1) + 'px');
            el.style.setProperty('--s0', s0.toFixed(3));
            el.style.setProperty('--s1', s1.toFixed(3));
            el.style.setProperty('--s2', s2.toFixed(3));
            el.style.setProperty('--s3', s3.toFixed(3));
            el.style.setProperty('--r1', r1.toFixed(2) + 'deg');
            el.style.setProperty('--r2', r2.toFixed(2) + 'deg');
            el.style.setProperty('--r3', r3.toFixed(2) + 'deg');
            el.style.setProperty('--o0', vo0.toFixed(3));
            el.style.setProperty('--o1', vo1.toFixed(3));
            el.style.setProperty('--o2', vo2.toFixed(3));
            el.style.setProperty('--o3', vo3.toFixed(3));
            el.style.setProperty(
                '--z',
                panel ? String(50 + Math.round(b.size / 8)) : String(1000 + Math.round(b.size))
            );
            container.appendChild(el);
        }
    };

    var DEFAULT_PAGE_BUBBLES = [
        {
            id: 1,
            size: 300,
            left: '2%',
            top: '12%',
            delay: 0,
            duration: 20,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(150, 190, 255, 0.55), rgba(175, 135, 255, 0.25) 55%, rgba(150, 190, 255, 0.12) 72%, transparent 100%)'
        },
        {
            id: 2,
            size: 360,
            left: '88%',
            top: '6%',
            delay: 2,
            duration: 28,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(140, 170, 255, 0.52), rgba(190, 155, 255, 0.22) 58%, rgba(150, 200, 255, 0.12) 74%, transparent 100%)'
        },
        {
            id: 3,
            size: 200,
            left: '10%',
            top: '48%',
            delay: 4,
            duration: 18,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(165, 200, 255, 0.48), rgba(185, 150, 255, 0.2) 60%, rgba(170, 190, 255, 0.1) 76%, transparent 100%)'
        },
        {
            id: 4,
            size: 300,
            left: '78%',
            top: '32%',
            delay: 1,
            duration: 25,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(155, 210, 255, 0.46), rgba(175, 155, 255, 0.18) 58%, rgba(155, 210, 255, 0.1) 74%, transparent 100%)'
        },
        {
            id: 5,
            size: 230,
            left: '22%',
            top: '18%',
            delay: 3,
            duration: 20,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(160, 215, 255, 0.42), rgba(190, 160, 255, 0.16) 62%, rgba(160, 215, 255, 0.09) 76%, transparent 100%)'
        },
        {
            id: 6,
            size: 320,
            left: '92%',
            top: '60%',
            delay: 5,
            duration: 24,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(150, 185, 255, 0.46), rgba(190, 140, 255, 0.2) 58%, rgba(165, 205, 255, 0.1) 75%, transparent 100%)'
        },
        {
            id: 7,
            size: 210,
            left: '6%',
            top: '78%',
            delay: 2.5,
            duration: 18,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(165, 200, 255, 0.38), rgba(185, 150, 255, 0.14) 62%, rgba(165, 205, 255, 0.08) 78%, transparent 100%)'
        },
        {
            id: 8,
            size: 280,
            left: '64%',
            top: '72%',
            delay: 1.5,
            duration: 22,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(170, 205, 255, 0.44), rgba(190, 160, 255, 0.18) 60%, rgba(170, 205, 255, 0.1) 76%, transparent 100%)'
        },
        {
            id: 9,
            size: 260,
            left: '20%',
            top: '58%',
            delay: 4.5,
            duration: 20,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(155, 190, 255, 0.40), rgba(190, 155, 255, 0.14) 62%, rgba(170, 200, 255, 0.08) 78%, transparent 100%)'
        },
        {
            id: 10,
            size: 260,
            left: '95%',
            top: '20%',
            delay: 3.5,
            duration: 18,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(175, 210, 255, 0.34), rgba(205, 170, 255, 0.12) 62%, rgba(175, 210, 255, 0.07) 80%, transparent 100%)'
        }
    ];

    function initPageBubbles() {
        var container = document.getElementById('floating-bubbles');
        if (!container || typeof window.echosphereSpawnBubbles !== 'function') return;
        var bubbles = CS.pageBubbles && CS.pageBubbles.length ? CS.pageBubbles : DEFAULT_PAGE_BUBBLES;
        window.echosphereSpawnBubbles(container, bubbles, CS.pageBubbleOpts || {});
    }

    var DEFAULT_CONCEPT_BUBBLES = [
        {
            id: 2,
            size: 340,
            left: '72%',
            top: '4%',
            delay: 0,
            duration: 26,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(140, 170, 255, 0.58), rgba(190, 155, 255, 0.28) 58%, rgba(150, 200, 255, 0.14) 74%, transparent 100%)'
        },
        {
            id: 4,
            size: 300,
            left: '6%',
            top: '18%',
            delay: 1.4,
            duration: 30,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(155, 210, 255, 0.52), rgba(175, 155, 255, 0.22) 58%, rgba(155, 210, 255, 0.12) 74%, transparent 100%)'
        },
        {
            id: 6,
            size: 348,
            left: '10%',
            top: '68%',
            delay: 2.2,
            duration: 32,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(150, 185, 255, 0.5), rgba(190, 140, 255, 0.24) 58%, rgba(165, 205, 255, 0.12) 75%, transparent 100%)'
        },
        {
            id: 10,
            size: 280,
            left: '52%',
            top: '8%',
            delay: 0.8,
            duration: 24,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(165, 200, 255, 0.48), rgba(185, 150, 255, 0.2) 60%, rgba(170, 190, 255, 0.1) 76%, transparent 100%)'
        },
        {
            id: 1,
            size: 220,
            left: '-6%',
            top: '52%',
            delay: 3,
            duration: 22,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(150, 190, 255, 0.44), rgba(175, 135, 255, 0.2) 55%, rgba(150, 190, 255, 0.1) 72%, transparent 100%)'
        },
        {
            id: 3,
            size: 260,
            left: '88%',
            top: '42%',
            delay: 1.2,
            duration: 28,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(165, 200, 255, 0.46), rgba(185, 150, 255, 0.2) 60%, rgba(170, 190, 255, 0.1) 76%, transparent 100%)'
        },
        {
            id: 5,
            size: 200,
            left: '44%',
            top: '-12%',
            delay: 2.6,
            duration: 20,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(160, 215, 255, 0.42), rgba(190, 160, 255, 0.18) 62%, rgba(160, 215, 255, 0.09) 76%, transparent 100%)'
        }
    ];

    var PANEL_BUBBLES = [
        {
            id: 1,
            size: 100,
            left: '6%',
            top: '10%',
            delay: 0,
            duration: 16,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(150, 190, 255, 0.5), rgba(175, 135, 255, 0.22) 55%, rgba(150, 190, 255, 0.1) 72%, transparent 100%)'
        },
        {
            id: 2,
            size: 130,
            left: '78%',
            top: '8%',
            delay: 1.2,
            duration: 20,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(140, 170, 255, 0.48), rgba(190, 155, 255, 0.2) 58%, rgba(150, 200, 255, 0.1) 74%, transparent 100%)'
        },
        {
            id: 3,
            size: 72,
            left: '12%',
            top: '58%',
            delay: 2,
            duration: 14,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(165, 200, 255, 0.44), rgba(185, 150, 255, 0.18) 60%, rgba(170, 190, 255, 0.09) 76%, transparent 100%)'
        },
        {
            id: 4,
            size: 110,
            left: '70%',
            top: '42%',
            delay: 0.6,
            duration: 18,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(155, 210, 255, 0.42), rgba(175, 155, 255, 0.16) 58%, rgba(155, 210, 255, 0.09) 74%, transparent 100%)'
        },
        {
            id: 5,
            size: 88,
            left: '38%',
            top: '18%',
            delay: 2.8,
            duration: 15,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(160, 215, 255, 0.4), rgba(190, 160, 255, 0.15) 62%, rgba(160, 215, 255, 0.08) 76%, transparent 100%)'
        },
        {
            id: 6,
            size: 95,
            left: '52%',
            top: '62%',
            delay: 1.8,
            duration: 17,
            gradient:
                'radial-gradient(circle at 35% 35%, rgba(150, 185, 255, 0.42), rgba(190, 140, 255, 0.18) 58%, rgba(165, 205, 255, 0.09) 75%, transparent 100%)'
        },
        {
            id: 7,
            size: 64,
            left: '4%',
            top: '38%',
            delay: 3.2,
            duration: 13,
            gradient:
                'radial-gradient(circle at 30% 30%, rgba(165, 200, 255, 0.36), rgba(185, 150, 255, 0.12) 62%, rgba(165, 205, 255, 0.07) 78%, transparent 100%)'
        },
        {
            id: 8,
            size: 118,
            left: '58%',
            top: '28%',
            delay: 0.4,
            duration: 19,
            gradient:
                'radial-gradient(circle at 40% 40%, rgba(170, 205, 255, 0.4), rgba(190, 160, 255, 0.16) 60%, rgba(170, 205, 255, 0.09) 76%, transparent 100%)'
        }
    ];

    function initPanelAmbientBubbles() {
        if (typeof window.echosphereSpawnBubbles !== 'function') return;
        var insightEl = document.getElementById('echosphere-insight-ambient-bubbles');
        var conceptEl = document.getElementById('echosphere-concept-ambient-bubbles');
        var panelBubbles = CS.panelBubbles && CS.panelBubbles.length ? CS.panelBubbles : PANEL_BUBBLES;
        var baseOpts = { panel: true, driftScale: 0.38, seedMul: 77801, seedAdd: 11 };
        if (insightEl) window.echosphereSpawnBubbles(insightEl, panelBubbles, baseOpts);
        if (conceptEl) {
            var conceptBubbles = CS.conceptBubbles && CS.conceptBubbles.length ? CS.conceptBubbles : DEFAULT_CONCEPT_BUBBLES;
            window.echosphereSpawnBubbles(
                conceptEl,
                conceptBubbles,
                CS.conceptBubbleOpts || { panel: false, driftScale: 1.05, seedMul: 91273, seedAdd: 29 }
            );
        }
    }

    function handleScrollAnimation() {
        var sections = document.querySelectorAll('.fade-in-section');
        var windowHeight = window.innerHeight;
        sections.forEach(function (section) {
            var sectionTop = section.getBoundingClientRect().top;
            var sectionHeight = section.getBoundingClientRect().height;
            var isInView = sectionTop <= windowHeight * 0.3 && sectionTop >= -sectionHeight * 0.7;
            if (isInView) section.classList.add('is-visible');
        });
    }

    window.enlargeImage = function (img) {
        var overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        overlay.onclick = function (e) {
            if (e.target === overlay) closeImageOverlay();
        };
        var enlargedImg = document.createElement('img');
        enlargedImg.src = img.src;
        enlargedImg.alt = img.alt || '';
        enlargedImg.className = 'enlarged-image';
        var closeBtn = document.createElement('span');
        closeBtn.className = 'image-overlay-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeImageOverlay;
        overlay.appendChild(enlargedImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    };

    window.closeImageOverlay = function () {
        var overlay = document.querySelector('.image-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    };

    window.toggleCodingChart = function () {
        var chartContent = document.getElementById('codingChartContent');
        if (chartContent) chartContent.classList.toggle('active');
    };

    function initIntroTyping() {
        var intro = CS.intro;
        if (!intro || !intro.main) return;

        var section = document.getElementById('next-section');
        var letterRoot = document.getElementById('echosphere-research-letter');
        var headingEl = document.getElementById('echosphere-post-hero-heading');
        if (!section || !letterRoot) return;

        var MAIN = intro.main;
        var DATE = intro.date || '';
        var PHASE_GOAL = intro.goal || '';
        var LINE_GAP_MS = intro.lineGapMs != null ? intro.lineGapMs : 720;
        var FULL_ARIA = intro.fullAria || MAIN + ' ' + DATE + '. ' + PHASE_GOAL;
        var TYPING_ARIA_START = intro.typingAriaStart || MAIN + ' ' + DATE;

        var ran = false;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var ioRootMargin = '-32% 0px -32% 0px';

        function sectionIntersectsEnough() {
            var r = section.getBoundingClientRect();
            if (r.height <= 0) return false;
            var vh = window.innerHeight || document.documentElement.clientHeight;
            var bandTop = vh * 0.32;
            var bandBottom = vh * 0.68;
            var overlap = Math.min(r.bottom, bandBottom) - Math.max(r.top, bandTop);
            return overlap > 12;
        }

        function setHeadingAria(label) {
            if (headingEl) headingEl.setAttribute('aria-label', label);
        }

        function createResearchLine(alignMod, withDate, opts) {
            opts = opts || {};
            var p = document.createElement('p');
            var cls = 'echosphere-research-line echosphere-research-line--' + alignMod;
            if (opts.support) cls += ' echosphere-research-line--support';
            p.className = cls;
            var wrap = document.createElement('span');
            wrap.className = 'echosphere-research-type-wrap';
            var main = document.createElement('span');
            wrap.appendChild(main);
            var date = null;
            if (withDate) {
                date = document.createElement('span');
                date.className = 'echosphere-research-heading-date';
                wrap.appendChild(date);
            }
            p.appendChild(wrap);
            var caretEl = document.createElement('span');
            caretEl.className = 'echosphere-research-type-caret';
            caretEl.setAttribute('aria-hidden', 'true');
            caretEl.textContent = '|';
            p.appendChild(caretEl);
            letterRoot.appendChild(p);
            return { p: p, main: main, date: date, caret: caretEl };
        }

        function typeInto(line, text, msPerChar, onDone) {
            line.main.textContent = '';
            if (line.date) line.date.textContent = '';
            line.caret.classList.remove('echosphere-research-type-caret--done');
            var j = 0;
            function step() {
                if (j < text.length) {
                    line.main.textContent += text.charAt(j);
                    j += 1;
                    window.setTimeout(step, msPerChar);
                } else if (onDone) onDone();
            }
            step();
        }

        function typeMainThenDate(line, mainText, dateText, onDone, ariaAtStart) {
            line.main.textContent = '';
            if (line.date) line.date.textContent = '';
            line.caret.classList.remove('echosphere-research-type-caret--done');
            var i = 0;
            var msMain = intro.msMain != null ? intro.msMain : 36;
            var msDate = intro.msDate != null ? intro.msDate : 30;

            function stepMain() {
                if (i < mainText.length) {
                    line.main.textContent += mainText.charAt(i);
                    i += 1;
                    window.setTimeout(stepMain, msMain);
                } else {
                    i = 0;
                    window.setTimeout(stepDate, 100);
                }
            }

            function stepDate() {
                if (!line.date) {
                    if (onDone) onDone();
                    return;
                }
                if (i < dateText.length) {
                    line.date.textContent += dateText.charAt(i);
                    i += 1;
                    window.setTimeout(stepDate, msDate);
                } else if (onDone) onDone();
            }

            if (ariaAtStart) setHeadingAria(ariaAtStart);
            stepMain();
        }

        function finishCaret(line) {
            line.caret.classList.add('echosphere-research-type-caret--done');
        }

        function finishStaticReduced() {
            letterRoot.innerHTML = '';
            var l0 = createResearchLine('center', !!DATE, { support: true });
            l0.main.textContent = MAIN;
            if (l0.date) l0.date.textContent = DATE;
            finishCaret(l0);
            if (PHASE_GOAL) {
                var l1 = createResearchLine('goal-centerpiece', false);
                l1.main.textContent = PHASE_GOAL;
                finishCaret(l1);
            }
            setHeadingAria(FULL_ARIA);
        }

        function tryStart() {
            if (ran || !sectionIntersectsEnough()) return;
            ran = true;
            if (reducedMotion) {
                finishStaticReduced();
                return;
            }
            letterRoot.innerHTML = '';
            var line0 = createResearchLine('center', !!DATE, { support: true });
            var line1 = PHASE_GOAL ? createResearchLine('goal-centerpiece', false) : null;
            if (line1) {
                line1.main.textContent = '';
                finishCaret(line1);
            }

            typeMainThenDate(
                line0,
                MAIN,
                DATE,
                function () {
                    finishCaret(line0);
                    setHeadingAria(MAIN + ' ' + DATE + '. ' + PHASE_GOAL + '…');
                    if (!line1 || !PHASE_GOAL) {
                        setHeadingAria(FULL_ARIA);
                        return;
                    }
                    window.setTimeout(function () {
                        line1.caret.classList.remove('echosphere-research-type-caret--done');
                        typeInto(line1, PHASE_GOAL, intro.msGoal != null ? intro.msGoal : 22, function () {
                            finishCaret(line1);
                            setHeadingAria(FULL_ARIA);
                        });
                    }, LINE_GAP_MS);
                },
                TYPING_ARIA_START
            );
        }

        var scrollOpts = { passive: true };
        function nudgeTryStart() {
            tryStart();
        }
        window.addEventListener('scroll', nudgeTryStart, scrollOpts);
        window.addEventListener('wheel', nudgeTryStart, scrollOpts);
        window.addEventListener('touchmove', nudgeTryStart, scrollOpts);
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) tryStart();
                });
            },
            { root: null, rootMargin: ioRootMargin, threshold: 0 }
        );
        io.observe(section);
    }

    function initKicker(sectionSel, textId, caretId, kickerText) {
        if (!kickerText) return;
        var section = document.querySelector(sectionSel) || document.getElementById(sectionSel);
        var textEl = document.getElementById(textId);
        var caretEl = document.getElementById(caretId);
        if (!section || !textEl || !caretEl) return;

        var KICKER = kickerText;
        var MS_PER_CHAR = 30;
        var ran = false;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var ioRootMargin = '-32% 0px -32% 0px';

        function sectionIntersectsEnough() {
            var r = section.getBoundingClientRect();
            if (r.height <= 0) return false;
            var vh = window.innerHeight || document.documentElement.clientHeight;
            var overlap = Math.min(r.bottom, vh * 0.68) - Math.max(r.top, vh * 0.32);
            return overlap > 12;
        }

        function finishCaret() {
            caretEl.classList.add('echosphere-you-told-us-kicker-caret--done');
        }

        function typeKicker(onDone) {
            textEl.textContent = '';
            caretEl.classList.remove('echosphere-you-told-us-kicker-caret--done');
            var i = 0;
            function step() {
                if (i < KICKER.length) {
                    textEl.textContent += KICKER.charAt(i);
                    i += 1;
                    window.setTimeout(step, MS_PER_CHAR);
                } else if (onDone) onDone();
            }
            step();
        }

        function tryStart() {
            if (ran || !sectionIntersectsEnough()) return;
            ran = true;
            if (reducedMotion) {
                textEl.textContent = KICKER;
                finishCaret();
                return;
            }
            typeKicker(finishCaret);
        }

        var scrollOpts = { passive: true };
        window.addEventListener('scroll', tryStart, scrollOpts);
        window.addEventListener('wheel', tryStart, scrollOpts);
        window.addEventListener('touchmove', tryStart, scrollOpts);
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) tryStart();
                });
            },
            { root: null, rootMargin: ioRootMargin, threshold: 0 }
        );
        io.observe(section);
    }

    document.addEventListener('DOMContentLoaded', function () {
        includeNavigation();
        initVideos();
        initPageBubbles();
        initPanelAmbientBubbles();

        var scrollTimeout;
        window.addEventListener('scroll', function () {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScrollAnimation, 10);
        });
        var sections = document.querySelectorAll('.fade-in-section');
        if (sections[0]) sections[0].classList.add('is-visible');
        handleScrollAnimation();

        document.addEventListener('keydown', function (e) {
            var sections = document.querySelectorAll('.fade-in-section');
            var currentScroll = window.pageYOffset;
            var windowHeight = window.innerHeight;
            var currentSection = Math.round(currentScroll / windowHeight);
            if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
                e.preventDefault();
                window.scrollTo({ top: (currentSection + 1) * windowHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp' && currentSection > 0) {
                e.preventDefault();
                window.scrollTo({ top: (currentSection - 1) * windowHeight, behavior: 'smooth' });
            }
        });

        setTimeout(function () {
            document.body.classList.add('loaded');
        }, 100);

        initIntroTyping();
        initKicker(
            '#you-told-us-section',
            'echosphere-you-told-us-kicker-text',
            'echosphere-you-told-us-kicker-caret',
            CS.kickerYouToldUs
        );
        initKicker(
            '#echosphere-insights-cinema-section',
            'echosphere-insights-kicker-text',
            'echosphere-insights-kicker-caret',
            CS.kickerInsights
        );
    });
})();
