// Work Page — full-tile editorial montage (five anchors; cycles on hover)

(function () {
    const STYLE_CYCLE = [
        'montage--xl',
        'montage--bold',
        'montage--italic',
        'montage--big',
        'montage--wide',
        'montage--boldItalic',
    ];

    const SLOT_ORDER = ['slot-tl', 'slot-tr', 'slot-ct', 'slot-bl', 'slot-br'];

    function parseWords(item) {
        const raw = item.querySelector('.project-montage')?.dataset.montage;
        if (!raw) return [];
        return raw
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function clearLines(item) {
        const lines = item.querySelectorAll('.project-montage-line');
        lines.forEach((line, j) => {
            line.textContent = '';
            line.className = 'project-montage-line ' + (SLOT_ORDER[j] || 'slot-tl');
        });
    }

    function stopMontage(item) {
        if (item._montageTimer) {
            clearInterval(item._montageTimer);
            item._montageTimer = null;
        }
        clearLines(item);
        item._montageIndex = 0;
    }

    function tickMontage(item) {
        const words = item._montageWords;
        const lines = item.querySelectorAll('.project-montage-line');
        if (!words?.length || !lines.length) return;

        const i = item._montageIndex++;

        lines.forEach((line, j) => {
            const w = words[(i + j) % words.length];
            const style = STYLE_CYCLE[(i + j) % STYLE_CYCLE.length];
            const slotClass = SLOT_ORDER[j] || 'slot-tl';

            line.classList.remove('montage--cut');
            line.offsetWidth;
            line.className =
                'project-montage-line ' + slotClass + ' montage--cut ' + style;
            line.textContent = w;
        });
    }

    function startMontage(item, intervalMs) {
        const words = parseWords(item);
        if (!words.length) return;

        item._montageWords = words;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const lines = item.querySelectorAll('.project-montage-line');
            lines.forEach((line, j) => {
                line.textContent = words[j % words.length];
                line.className =
                    'project-montage-line ' +
                    (SLOT_ORDER[j] || 'slot-tl') +
                    ' montage--xl';
            });
            return;
        }

        if (item._montageTimer) return;

        item._montageIndex = 0;
        tickMontage(item);

        const ms =
            typeof intervalMs === 'number'
                ? intervalMs
                : 720 + Math.floor(Math.random() * 200);
        item._montageTimer = setInterval(() => tickMontage(item), ms);
    }

    function shouldUseTouchMontage() {
        return (
            window.matchMedia('(hover: none)').matches &&
            window.matchMedia('(pointer: coarse)').matches
        );
    }

    function initTouchMontage(projectItems) {
        if (!shouldUseTouchMontage()) return;

        projectItems.forEach((item) => {
            const words = parseWords(item);
            const lines = item.querySelectorAll('.project-montage-line');
            if (!words.length || !lines.length) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                lines.forEach((line, j) => {
                    line.textContent = words[j % words.length];
                    line.className =
                        'project-montage-line ' +
                        (SLOT_ORDER[j] || 'slot-tl') +
                        ' montage--xl';
                });
                return;
            }

            lines.forEach((line, j) => {
                line.textContent = words[j % words.length];
                line.className =
                    'project-montage-line ' +
                    (SLOT_ORDER[j] || 'slot-tl') +
                    ' montage--xl';
            });

            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
                            stopMontage(item);
                            startMontage(item, 1450);
                        } else {
                            stopMontage(item);
                            lines.forEach((line, j) => {
                                line.textContent = words[j % words.length];
                                line.className =
                                    'project-montage-line ' +
                                    (SLOT_ORDER[j] || 'slot-tl') +
                                    ' montage--xl';
                            });
                        }
                    });
                },
                { threshold: [0, 0.25, 0.5] }
            );
            io.observe(item);
            item._montageIo = io;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const projectItems = document.querySelectorAll('.project-item');

        projectItems.forEach((item) => {
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });

            if (shouldUseTouchMontage()) return;

            item.addEventListener('mouseenter', function () {
                startMontage(item);
            });

            item.addEventListener('mouseleave', function () {
                requestAnimationFrame(function () {
                    if (document.activeElement !== item) stopMontage(item);
                });
            });

            item.addEventListener('focusin', function () {
                startMontage(item);
            });

            item.addEventListener('focusout', function (e) {
                if (!item.contains(e.relatedTarget)) stopMontage(item);
            });
        });

        initTouchMontage(projectItems);

        projectItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';

            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 90);
        });
    });
})();
