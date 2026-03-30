/* Shared SVG filter for ink-on-paper warp (letter, subtitles, nav). One definition per page. */
(function () {
    if (document.getElementById('paper-ink-distort')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'paper-ink-filter-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;overflow:hidden;clip:rect(0,0,0,0)';
    svg.innerHTML =
        '<defs>' +
        '<filter id="paper-ink-distort" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.072" numOctaves="5" result="noise" seed="7"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="1.45" xChannelSelector="R" yChannelSelector="G"/>' +
        '</filter>' +
        '</defs>';
    document.body.insertBefore(svg, document.body.firstChild);
})();
