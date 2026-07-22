/*
 * Headspace — living feed / timeline.
 *
 * Public: renders window.HEADSPACE_FEED (from js/headspace-feed.js) read-only.
 * Edit mode (headspace.html?edit=1): shows a composer to draft entries and
 * copy/download an updated headspace-feed.js to commit + push.
 */
(function () {
    'use strict';

    var MEDIA_DIR = 'film/headspace/';

    // Working copy of the feed (edit mode can prepend drafts to it).
    var feed = (window.HEADSPACE_FEED || []).slice();

    /* -------------------------------------------------------------- */
    /* Helpers                                                        */
    /* -------------------------------------------------------------- */

    function guessType(path) {
        return /\.(mp4|mov|webm|m4v|ogg)$/i.test(path || '') ? 'video' : 'image';
    }

    function parseDate(str) {
        // Parse YYYY-MM-DD as a local date (avoid timezone shifting the day).
        if (typeof str !== 'string') return new Date(NaN);
        var parts = str.split('-');
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        return new Date(str);
    }

    function formatDate(str) {
        var d = parseDate(str);
        if (isNaN(d.getTime())) return str || '';
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function sortedFeed() {
        // Chronological: oldest first, most recent at the bottom.
        return feed.slice().sort(function (a, b) {
            return parseDate(a.date) - parseDate(b.date);
        });
    }

    function el(tag, className) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        return node;
    }

    // Normalise an entry's media into a list of { type, src, alt } items.
    // Supports: single { type, src, alt }, an array `media`, or `src` as an array.
    function mediaList(entry) {
        if (Array.isArray(entry.media)) {
            return entry.media.filter(function (m) { return m && m.src; });
        }
        if (Array.isArray(entry.src)) {
            return entry.src.filter(Boolean).map(function (s) {
                return { type: entry.type || guessType(s), src: s, alt: '' };
            });
        }
        if (entry.src) {
            return [{ type: entry.type || guessType(entry.src), src: entry.src, alt: entry.alt }];
        }
        return [];
    }

    function buildMedia(item, fallbackAlt) {
        if (item.type === 'video') {
            var video = el('video', 'hs-media');
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('controls', '');
            video.setAttribute('preload', 'auto');
            video.muted = true; // required for autoplay in most browsers
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            video.src = item.src;
            return video;
        }
        var img = el('img', 'hs-media');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = item.src;
        img.alt = item.alt || fallbackAlt || '';
        return img;
    }

    function buildEntryItem(entry, index) {
        var li = el('li', 'hs-entry ' + (index % 2 === 0 ? 'hs-entry--left' : 'hs-entry--right'));
        var inner = el('div', 'hs-entry-inner');

        var time = el('time', 'hs-date');
        if (entry.date) time.setAttribute('datetime', entry.date);
        time.textContent = formatDate(entry.date);
        inner.appendChild(time);

        var media = mediaList(entry);
        if (media.length) {
            var group = el('div', 'hs-media-group');
            media.forEach(function (m) {
                var itemEl = el('div', 'hs-media-item');
                itemEl.appendChild(buildMedia(m, entry.caption));
                group.appendChild(itemEl);
            });
            inner.appendChild(group);
        }

        if (entry.caption) {
            var cap = el('p', 'hs-caption');
            cap.textContent = entry.caption;
            inner.appendChild(cap);
        }

        li.appendChild(inner);
        return li;
    }

    // Portrait (taller than wide) media collapses to half width.
    function applyAllOrientations() {
        if (!listEl) return;
        var items = listEl.querySelectorAll('.hs-media-item');
        for (var i = 0; i < items.length; i++) {
            var m = items[i].querySelector('img, video');
            if (!m) continue;
            var w = m.tagName === 'VIDEO' ? m.videoWidth : m.naturalWidth;
            var h = m.tagName === 'VIDEO' ? m.videoHeight : m.naturalHeight;
            if (w && h) {
                items[i].classList.toggle('hs-media-item--portrait', h > w);
            }
        }
    }

    /* -------------------------------------------------------------- */
    /* Render                                                         */
    /* -------------------------------------------------------------- */

    var listEl = document.getElementById('headspace-feed');
    var emptyEl = document.getElementById('hs-feed-empty');
    var feedEl = document.querySelector('.hs-feed');
    var railEl = document.getElementById('hs-rail');
    var railTicksEl = document.getElementById('hs-rail-ticks');
    var focusTicking = false;
    var userInteracted = false;

    function clamp(v, min, max) {
        return v < min ? min : (v > max ? max : v);
    }

    function buildRail(count) {
        if (!railEl || !railTicksEl) return;
        railTicksEl.innerHTML = '';
        if (count < 1) {
            railEl.hidden = true;
            return;
        }
        railEl.hidden = false;
        for (var i = 0; i < count; i++) {
            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hs-rail-tick';
            btn.setAttribute('data-index', String(i));
            btn.setAttribute('aria-label', 'Go to entry ' + (i + 1) + ' of ' + count);
            li.appendChild(btn);
            railTicksEl.appendChild(li);
        }
    }

    function updateRail(activeIndex) {
        if (!railTicksEl) return;
        var ticks = railTicksEl.querySelectorAll('.hs-rail-tick');
        for (var i = 0; i < ticks.length; i++) {
            ticks[i].classList.toggle('is-active', i === activeIndex);
        }
    }

    function scrollToEntry(index) {
        if (!feedEl || !listEl) return;
        var nodes = listEl.querySelectorAll('.hs-entry');
        var target = nodes[index];
        if (!target) return;
        userInteracted = true;
        var box = feedEl.getBoundingClientRect();
        var r = target.getBoundingClientRect();
        var delta = (r.top + r.height / 2) - (box.top + box.height / 2);
        feedEl.scrollTop += delta;
        requestFocusUpdate();
    }

    // Fade each entry by how far its centre is from the viewport centre of the
    // scroll panel — so only the one or two entries in the middle read clearly.
    function updateFocus() {
        if (!feedEl) return;
        var nodes = listEl.querySelectorAll('.hs-entry');
        var box = feedEl.getBoundingClientRect();
        var center = box.top + box.height / 2;
        var half = box.height / 2 || 1;
        // Stay fully readable across the panel; only fade an entry once it is
        // nearly out of view (its centre approaching / past the top or bottom edge).
        var fadeStart = 0.82; // plateau: full opacity until 82% of the way to the edge
        var fadeEnd = 1.28;   // fully faded only once well past the edge
        var bestIndex = 0;
        var bestDist = Infinity;
        for (var i = 0; i < nodes.length; i++) {
            var r = nodes[i].getBoundingClientRect();
            var nodeCenter = r.top + r.height / 2;
            var dist = Math.abs(nodeCenter - center) / half; // 0 at centre, 1 at edge
            var t = (dist - fadeStart) / (fadeEnd - fadeStart);
            var op = clamp(1 - t, 0.05, 1);
            nodes[i].style.opacity = op.toFixed(3);
            if (Math.abs(nodeCenter - center) < bestDist) {
                bestDist = Math.abs(nodeCenter - center);
                bestIndex = i;
            }
        }
        updateRail(bestIndex);
    }

    function requestFocusUpdate() {
        if (focusTicking) return;
        focusTicking = true;
        window.requestAnimationFrame(function () {
            focusTicking = false;
            updateFocus();
        });
    }

    // On load, open with the most recent entry (the last one) centered in the
    // panel. Stops once the visitor scrolls on their own.
    function centerNewest() {
        if (!feedEl || userInteracted) return;
        var nodes = listEl.querySelectorAll('.hs-entry');
        if (!nodes.length) return;
        var last = nodes[nodes.length - 1];
        var lastRect = last.getBoundingClientRect();
        var box = feedEl.getBoundingClientRect();
        var delta = (lastRect.top + lastRect.height / 2) - (box.top + box.height / 2);
        feedEl.scrollTop += delta;
    }

    function onMediaReady() {
        applyAllOrientations();
        centerNewest();
        requestFocusUpdate();
        // Nudge autoplay — some browsers need an explicit play() after load.
        if (listEl) {
            var videos = listEl.querySelectorAll('video');
            for (var i = 0; i < videos.length; i++) {
                videos[i].muted = true;
                var p = videos[i].play();
                if (p && typeof p.catch === 'function') p.catch(function () {});
            }
        }
    }

    function render() {
        if (!listEl) return;
        listEl.innerHTML = '';

        var entries = sortedFeed();

        if (!entries.length) {
            if (emptyEl) emptyEl.hidden = false;
            buildRail(0);
            return;
        }
        if (emptyEl) emptyEl.hidden = true;

        entries.forEach(function (entry, index) {
            listEl.appendChild(buildEntryItem(entry, index));
        });

        buildRail(entries.length);
        applyAllOrientations();
        updateFocus();
    }

    /* -------------------------------------------------------------- */
    /* Composer (edit mode)                                           */
    /* -------------------------------------------------------------- */

    function isEditMode() {
        try {
            var params = new URLSearchParams(window.location.search);
            var v = params.get('edit');
            return v === '1' || v === 'true';
        } catch (err) {
            return /[?&]edit=(1|true)\b/.test(window.location.search);
        }
    }

    function serializeEntry(entry, indent) {
        var pad = indent || '        ';
        var inner = pad + '    ';
        var fields = [];
        fields.push('date: ' + JSON.stringify(entry.date));

        if (entry.media && entry.media.length) {
            var mediaLines = entry.media.map(function (m) {
                var parts = 'type: ' + JSON.stringify(m.type) + ', src: ' + JSON.stringify(m.src);
                if (m.alt) parts += ', alt: ' + JSON.stringify(m.alt);
                return inner + '    { ' + parts + ' }';
            }).join(',\n');
            fields.push('media: [\n' + mediaLines + '\n' + inner + ']');
        } else {
            fields.push('type: ' + JSON.stringify(entry.type));
            fields.push('src: ' + JSON.stringify(entry.src));
        }

        fields.push('caption: ' + JSON.stringify(entry.caption || ''));
        if (!(entry.media && entry.media.length)) {
            fields.push('alt: ' + JSON.stringify(entry.alt || ''));
        }
        return pad + '{\n' + inner + fields.join(',\n' + inner) + '\n' + pad + '}';
    }

    var FILE_HEADER = [
        '/*',
        ' * Headspace feed data — the living page of updates.',
        ' *',
        ' * HOW TO ADD A POST (on my end, then push):',
        ' *   1. Drop the photo/video into  film/headspace/',
        ' *   2. Add an entry to the top of the array below, or use the composer:',
        ' *      open  headspace.html?edit=1  , fill the form, then Copy / Download.',
        ' *   3. Commit + push. The public page only ever shows the rendered feed.',
        ' *',
        ' * Entry shape: { date, type ("image"|"video"), src, caption?, alt? }',
        ' * Newest entries render first — order here does not matter.',
        ' */'
    ].join('\n');

    function generateFeedFileText(entries) {
        var body = entries.map(function (e) { return serializeEntry(e); }).join(',\n');
        return FILE_HEADER + '\nwindow.HEADSPACE_FEED = [\n' + body + '\n];\n';
    }

    function initComposer() {
        var toggle = document.getElementById('hs-composer-toggle');
        var panel = document.getElementById('hs-composer');
        var closeBtn = document.getElementById('hs-composer-close');
        var form = document.getElementById('hs-composer-form');
        if (!toggle || !panel || !form) return;

        var dateInput = document.getElementById('hs-input-date');
        var typeInput = document.getElementById('hs-input-type');
        var fileInput = document.getElementById('hs-input-file');
        var srcInput = document.getElementById('hs-input-src');
        var captionInput = document.getElementById('hs-input-caption');
        var altInput = document.getElementById('hs-input-alt');
        var dropzone = document.getElementById('hs-dropzone');
        var preview = document.getElementById('hs-preview');
        var hint = dropzone ? dropzone.querySelector('.hs-dropzone-hint') : null;
        var status = document.getElementById('hs-composer-status');

        var addBtn = document.getElementById('hs-add');
        var copyEntryBtn = document.getElementById('hs-copy-entry');
        var copyFeedBtn = document.getElementById('hs-copy-feed');
        var downloadBtn = document.getElementById('hs-download');

        // Reveal edit affordances.
        toggle.hidden = false;

        // Default the date to today.
        if (dateInput && !dateInput.value) {
            var now = new Date();
            var mm = String(now.getMonth() + 1).padStart(2, '0');
            var dd = String(now.getDate()).padStart(2, '0');
            dateInput.value = now.getFullYear() + '-' + mm + '-' + dd;
        }

        function openPanel() { panel.hidden = false; }
        function closePanel() { panel.hidden = true; }

        toggle.addEventListener('click', openPanel);
        if (closeBtn) closeBtn.addEventListener('click', closePanel);

        function setStatus(msg) {
            if (status) status.textContent = msg || '';
        }

        function clearPreview() {
            if (!preview) return;
            preview.innerHTML = '';
            preview.hidden = true;
            if (hint) hint.style.display = '';
        }

        function addPreview(url, type) {
            if (!preview || !url) return;
            var node;
            if (type === 'video') {
                node = document.createElement('video');
                node.setAttribute('autoplay', '');
                node.setAttribute('muted', '');
                node.setAttribute('loop', '');
                node.setAttribute('playsinline', '');
                node.setAttribute('controls', '');
                node.muted = true;
                node.autoplay = true;
                node.loop = true;
                node.playsInline = true;
            } else {
                node = document.createElement('img');
                node.alt = '';
            }
            node.src = url;
            preview.appendChild(node);
            preview.hidden = false;
            if (hint) hint.style.display = 'none';
        }

        function handleFiles(files) {
            if (!files || !files.length) return;
            var arr = Array.prototype.slice.call(files);
            clearPreview();
            var paths = [];
            arr.forEach(function (file) {
                var isVideo = file.type.indexOf('video') === 0;
                paths.push(MEDIA_DIR + file.name);
                addPreview(URL.createObjectURL(file), isVideo ? 'video' : 'image');
            });
            if (srcInput) srcInput.value = paths.join(', ');
            if (typeInput && arr.length === 1) {
                typeInput.value = arr[0].type.indexOf('video') === 0 ? 'video' : 'image';
            }
            setStatus(arr.length + (arr.length === 1 ? ' file' : ' files') + ' loaded — save ' +
                (arr.length === 1 ? 'it' : 'them') + ' into ' + MEDIA_DIR);
        }

        if (fileInput) {
            fileInput.addEventListener('change', function () {
                handleFiles(fileInput.files);
            });
        }

        if (dropzone) {
            ['dragenter', 'dragover'].forEach(function (evt) {
                dropzone.addEventListener(evt, function (e) {
                    e.preventDefault();
                    dropzone.classList.add('is-dragover');
                });
            });
            ['dragleave', 'dragend', 'drop'].forEach(function (evt) {
                dropzone.addEventListener(evt, function () {
                    dropzone.classList.remove('is-dragover');
                });
            });
            dropzone.addEventListener('drop', function (e) {
                e.preventDefault();
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                    handleFiles(e.dataTransfer.files);
                }
            });
        }

        function parsePaths(raw) {
            return (raw || '').split(/[\n,]+/).map(function (s) {
                return s.trim();
            }).filter(Boolean);
        }

        // Keep preview in sync if the path(s) are typed manually (no file chosen).
        if (srcInput) {
            srcInput.addEventListener('change', function () {
                if (fileInput && fileInput.files && fileInput.files.length) return;
                clearPreview();
                parsePaths(srcInput.value).forEach(function (p) {
                    addPreview(p, guessType(p));
                });
            });
        }

        function currentEntry() {
            var paths = parsePaths(srcInput ? srcInput.value : '');
            var entry = { date: dateInput ? dateInput.value : '' };

            if (paths.length > 1) {
                entry.media = paths.map(function (p) {
                    return { type: guessType(p), src: p, alt: '' };
                });
            } else {
                entry.type = typeInput ? typeInput.value : 'image';
                entry.src = paths[0] || '';
                entry.alt = altInput ? altInput.value.trim() : '';
            }
            entry.caption = captionInput ? captionInput.value.trim() : '';
            return entry;
        }

        function validate(entry) {
            if (!entry.date) { setStatus('add a date first.'); return false; }
            var hasMedia = (entry.media && entry.media.length) || entry.src;
            if (!hasMedia) { setStatus('add a media path (or choose a file).'); return false; }
            return true;
        }

        function copyText(text, okMsg) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    setStatus(okMsg);
                }, function () {
                    fallbackCopy(text, okMsg);
                });
            } else {
                fallbackCopy(text, okMsg);
            }
        }

        function fallbackCopy(text, okMsg) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                setStatus(okMsg);
            } catch (err) {
                setStatus('could not copy automatically — check the console.');
                console.log(text);
            }
            document.body.removeChild(ta);
        }

        // Add draft to the in-memory feed and re-render.
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var entry = currentEntry();
            if (!validate(entry)) return;
            feed.unshift(entry);
            render();
            setStatus('added to preview — now Copy or Download to publish.');
        });

        if (copyEntryBtn) {
            copyEntryBtn.addEventListener('click', function () {
                var entry = currentEntry();
                if (!validate(entry)) return;
                copyText(serializeEntry(entry, '    ') + ',', 'entry copied — paste it at the top of the array in js/headspace-feed.js.');
            });
        }

        if (copyFeedBtn) {
            copyFeedBtn.addEventListener('click', function () {
                copyText(generateFeedFileText(sortedFeed()), 'full feed copied — replace the contents of js/headspace-feed.js.');
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', function () {
                var text = generateFeedFileText(sortedFeed());
                var blob = new Blob([text], { type: 'text/javascript' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'headspace-feed.js';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
                setStatus('downloaded — move it into js/ (replace the old one) and push.');
            });
        }
    }

    /* -------------------------------------------------------------- */
    /* Boot                                                           */
    /* -------------------------------------------------------------- */

    function markInteracted() {
        userInteracted = true;
    }

    function initViewControls() {
        var fullBtn = document.getElementById('hs-toggle-full');
        var hideBtn = document.getElementById('hs-toggle-hide');
        if (!fullBtn || !hideBtn) return;

        var ICON_EXPAND =
            '<svg class="hs-view-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
        var ICON_COLLAPSE =
            '<svg class="hs-view-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M6 2v4H2M10 2v4h4M14 10h-4v4M6 14v-4H2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
        var ICON_EYE =
            '<svg class="hs-view-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M1.5 8s2.8-4.5 6.5-4.5S14.5 8 14.5 8 11.7 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
            '</svg>';
        var ICON_EYE_OFF =
            '<svg class="hs-view-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M1.5 8s2.8-4.5 6.5-4.5S14.5 8 14.5 8 11.7 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
            '<path d="M2.5 13.5L13.5 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
            '</svg>';

        function syncLabels() {
            var isFull = document.body.classList.contains('hs-view-full');
            var isCollage = document.body.classList.contains('hs-view-collage');
            fullBtn.setAttribute('aria-pressed', isFull ? 'true' : 'false');
            hideBtn.setAttribute('aria-pressed', isCollage ? 'true' : 'false');
            fullBtn.setAttribute('aria-label', isFull ? 'Exit full view' : 'Expand feed');
            hideBtn.setAttribute('aria-label', isCollage ? 'Show feed' : 'Hide feed');
            fullBtn.title = isFull ? 'exit' : 'full';
            hideBtn.title = isCollage ? 'show' : 'hide';
            fullBtn.innerHTML = isFull ? ICON_COLLAPSE : ICON_EXPAND;
            hideBtn.innerHTML = isCollage ? ICON_EYE : ICON_EYE_OFF;
            fullBtn.hidden = isCollage;
        }

        fullBtn.addEventListener('click', function () {
            document.body.classList.remove('hs-view-collage');
            document.body.classList.toggle('hs-view-full');
            syncLabels();
            requestFocusUpdate();
        });

        hideBtn.addEventListener('click', function () {
            var entering = !document.body.classList.contains('hs-view-collage');
            document.body.classList.remove('hs-view-full');
            document.body.classList.toggle('hs-view-collage', entering);
            syncLabels();
            if (!entering) requestFocusUpdate();
        });

        // Esc exits either mode
        window.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (!document.body.classList.contains('hs-view-full') &&
                !document.body.classList.contains('hs-view-collage')) return;
            document.body.classList.remove('hs-view-full', 'hs-view-collage');
            syncLabels();
            requestFocusUpdate();
        });

        syncLabels();
    }

    function initListen() {
        var root = document.getElementById('hs-listen');
        var toggle = document.getElementById('hs-listen-toggle');
        var panel = document.getElementById('hs-listen-panel');
        var embed = document.getElementById('hs-listen-embed');
        var labelEl = document.getElementById('hs-listen-label');
        var titleEl = document.getElementById('hs-listen-title');
        var artistEl = document.getElementById('hs-listen-artist');
        var artEl = document.getElementById('hs-listen-art');
        var metaEl = document.getElementById('hs-listen-meta');
        var metaArt = document.getElementById('hs-listen-meta-art');
        var metaTitle = document.getElementById('hs-listen-meta-title');
        var metaArtist = document.getElementById('hs-listen-meta-artist');
        var cfg = window.HEADSPACE_LISTEN || {};
        if (!root || !toggle || !panel || !embed) return;

        if (labelEl && cfg.label) labelEl.textContent = cfg.label;

        var loadedEmbedId = null;
        var current = null;

        function setArt(img, src, alt) {
            if (!img) return;
            if (src) {
                img.src = src;
                img.alt = alt || '';
                img.hidden = false;
            } else {
                img.removeAttribute('src');
                img.hidden = true;
            }
        }

        function setMeta(data) {
            if (!metaEl) return;
            if (data && (data.title || data.albumArt)) {
                metaEl.hidden = false;
                if (metaTitle) metaTitle.textContent = data.title || '';
                if (metaArtist) metaArtist.textContent = data.artist || '';
                setArt(metaArt, data.albumArt || '', data.title || '');
            } else {
                metaEl.hidden = true;
            }
        }

        function mountEmbed(type, id) {
            if (!type || !id) {
                embed.innerHTML = '';
                loadedEmbedId = null;
                return;
            }
            var key = type + ':' + id;
            if (loadedEmbedId === key) return;
            embed.innerHTML = '';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://open.spotify.com/embed/' + type + '/' + id +
                '?utm_source=generator&theme=0';
            iframe.title = (cfg.label || 'listen with me') + ' — now playing';
            iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
            iframe.loading = 'lazy';
            iframe.setAttribute('allowfullscreen', '');
            embed.appendChild(iframe);
            loadedEmbedId = key;
        }

        function closePanel() {
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }

        function openPanel() {
            if (!current || !current.trackId) return;
            mountEmbed('track', current.trackId);
            panel.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
        }

        function renderNow(data) {
            current = data || null;
            var playing = !!(data && data.isPlaying && data.trackId);

            root.classList.toggle('is-playing', playing);

            // Only show while something is actually playing — no profile links.
            if (playing) {
                root.hidden = false;
                if (titleEl) titleEl.textContent = data.title || '';
                if (artistEl) artistEl.textContent = data.artist || '';
                setArt(artEl, data.albumArt || '', data.title || '');
                setMeta(data);
                if (labelEl) labelEl.textContent = 'now playing';
            } else {
                root.hidden = true;
                setMeta(null);
                setArt(artEl, '', '');
                if (titleEl) titleEl.textContent = '';
                if (artistEl) artistEl.textContent = '';
                closePanel();
                current = null;
            }
        }

        toggle.addEventListener('click', function () {
            if (panel.hidden) openPanel();
            else closePanel();
        });

        function fetchNow() {
            var url = cfg.nowPlayingUrl || 'data/spotify-now.json';
            var bust = url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
            fetch(bust, { cache: 'no-store' }).then(function (res) {
                if (!res.ok) throw new Error('no now-playing');
                return res.json();
            }).then(function (data) {
                renderNow(data);
            }).catch(function () {
                renderNow(null);
            });
        }

        fetchNow();
        setInterval(fetchNow, 60 * 1000);
    }

    function boot() {
        render();
        initViewControls();
        initListen();

        if (feedEl) {
            feedEl.addEventListener('scroll', requestFocusUpdate, { passive: true });
            // Any deliberate scroll gesture cancels the auto-centering.
            feedEl.addEventListener('wheel', markInteracted, { passive: true });
            feedEl.addEventListener('touchmove', markInteracted, { passive: true });
            feedEl.addEventListener('pointerdown', markInteracted, { passive: true });
        }
        if (railTicksEl) {
            railTicksEl.addEventListener('click', function (e) {
                var btn = e.target.closest('.hs-rail-tick');
                if (!btn) return;
                var index = Number(btn.getAttribute('data-index'));
                if (!isNaN(index)) scrollToEntry(index);
            });
        }
        window.addEventListener('keydown', function (e) {
            var keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
            if (keys.indexOf(e.key) !== -1) markInteracted();
        });
        window.addEventListener('resize', function () {
            centerNewest();
            requestFocusUpdate();
        });
        // Media changes the layout as it loads — recentre + recompute the fade then.
        if (listEl) {
            listEl.addEventListener('load', onMediaReady, true);
            listEl.addEventListener('loadedmetadata', onMediaReady, true);
        }

        centerNewest();
        requestFocusUpdate();
        // Once every image has settled its height, land precisely on the newest.
        window.addEventListener('load', onMediaReady);

        if (isEditMode()) initComposer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
