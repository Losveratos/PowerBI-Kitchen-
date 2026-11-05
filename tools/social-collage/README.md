# Social-Collage-Templates · Daten-WG-Stil

Wiederverwendbare LinkedIn-Bild-Templates (1200×675, in 2× rendern):

- `collage-tour.html` — „Foto-Stapel" aus 3 Produkt-Screenshots + dunkle Termin-Karte (mehrere Events)
- `collage-single-event.html` — dieselbe Collage mit Einzel-Event-Karte (Talk-Titel + Datum + Ort)
- `route-card.html` — Routen-Karte mit Stopps (ohne Screenshots)

**Nutzung:** Screenshots als PNG neben die HTML legen (Pfade in den `<img src>` anpassen,
Format 16:9 wirkt am besten), Texte/Termine im Markup ändern, dann rendern:

```bash
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1200,height:675},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/collage-tour.html');await p.waitForTimeout(600);
await p.screenshot({path:'out.png'});await b.close();})()"
```

Design-Tokens wie überall: Tinte `#0F1E2E`, ink-soft `#475569`, Teal `#0E8585`,
Gelb `#F5B301`, Papier `#F4F3EE`; Kochmützen-Logo `hat.svg`.

- `linkedin-banner.html` — LinkedIn-Profilbanner 1584×396 („WG meets Kitchen": Fliesenspiegel aus Mini-IBCS-Charts; rechts Text, links bleibt frei fürs Profilfoto)
