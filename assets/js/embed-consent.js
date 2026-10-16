/* Klick-zum-Laden für eingebettete Power-BI-Reports („Publish to web“).
 *
 * Markup (ersetzt das <iframe> im jeweiligen Rahmen):
 *   <div class="pbi-consent" data-pbi-src="https://app.powerbi.com/view?r=…" data-pbi-title="Titel">
 *     … Hinweistext …
 *     <button type="button" class="pbi-consent-btn">Report laden</button>
 *   </div>
 *
 * Erst beim Klick wird das iframe erzeugt; vorher geht keine Anfrage an Microsoft.
 * Der Rahmen um den Platzhalter muss position:relative und eine Höhe/aspect-ratio haben
 * (wie .beispiel-frame bzw. .report-frame).
 */
(function () {
  'use strict';
  var CSS =
    '.pbi-consent{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'gap:12px;padding:20px 24px;text-align:center;box-sizing:border-box;background:rgba(127,127,127,.08);overflow:auto}' +
    '.pbi-consent-title{margin:0;font-weight:600;font-size:16px;line-height:1.3}' +
    '.pbi-consent-text{margin:0;max-width:46ch;font-size:13.5px;line-height:1.5;opacity:.85}' +
    '.pbi-consent-text a{color:inherit;text-decoration:underline}' +
    '.pbi-consent-btn{font:inherit;font-size:14px;font-weight:600;cursor:pointer;border:0;border-radius:999px;' +
    'padding:11px 22px;min-height:44px;background:var(--accent,#117865);color:#fff}' +
    '.pbi-consent-btn:hover{filter:brightness(1.08)}' +
    '.pbi-consent-btn:focus-visible{outline:3px solid currentColor;outline-offset:3px}' +
    '@media (max-width:520px){.pbi-consent{gap:8px;padding:12px}.pbi-consent-text{font-size:12.5px}}';
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pbi-consent-btn');
    if (!btn) return;
    var box = btn.closest('.pbi-consent');
    if (!box) return;
    var src = box.getAttribute('data-pbi-src') || '';
    if (src.indexOf('https://app.powerbi.com/') !== 0) return;
    var f = document.createElement('iframe');
    f.title = box.getAttribute('data-pbi-title') || 'Power-BI-Report';
    f.src = src;
    f.setAttribute('frameborder', '0');
    f.setAttribute('allowfullscreen', 'true');
    box.parentNode.replaceChild(f, box);
    f.focus();
  });
})();
