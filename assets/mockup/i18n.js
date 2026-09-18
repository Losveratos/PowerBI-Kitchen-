/* MockupKitchen · Zweisprachigkeit (Deutsch = Standard, English vollständig)
 * window.MK_I18N.t(key, vars)  → Text in der aktuellen Sprache
 * window.MK_I18N.tl(lang, …)   → Text in einer bestimmten Sprache (Export nutzt spec.meta.lang)
 * window.MK_I18N.set(lang)     → Sprache umschalten, merken, <html lang> setzen
 * window.MK_I18N.apply(root)   → statische Texte im Markup setzen (data-i18n / -html / -ph / -title)
 * Schlüssel sind sprechend und stabil; Platzhalter in geschweiften Klammern: {n}.
 * Diese Datei muss VOR catalog.js geladen werden (die Katalog-Getter lesen MK_I18N.lang).
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- Deutsch
  const DE = {
    app: { title: 'MockupKitchen · Power-BI-Seiten skizzieren' },

    btn: {
      templates: '▦ Vorlagen', importTmdl: '⇪ TMDL laden', present: '▶ Präsentieren', presentEnd: '✕ Präsentation beenden',
      open: 'Öffnen', save: 'Speichern', export: 'Export für Claude Code', demoModel: 'Demo-Modell',
      newMeasure: '+ Kennzahl / Dimension', copy: 'Kopieren', download: 'Datei herunterladen', downloadAll: 'Alle Dateien herunterladen',
      cancel: 'Abbrechen', create: 'Anlegen', split: 'Aufteilen', save2: 'Speichern',
      pageDup: 'Seite duplizieren', pageDel: 'Seite löschen', splitRoot: 'Inhalt neu aufteilen …', addPage: '+ Seite',
      lang: 'EN', clearTile: 'Kachel leeren', removeTile: 'Kachel entfernen', pickType: 'Visual wählen …',
    },

    tip: {
      projName: 'Name des Berichts / Mockups', templates: 'Seitenvorlage wählen', importTmdl: 'TMDL-Ordner oder -Dateien laden',
      undo: 'Rückgängig (Strg+Z)', redo: 'Wiederholen (Strg+Y)', present: 'Präsentieren: Panels ausblenden, Seite groß (Taste P)',
      help: 'Hilfe', open: 'Mockup-Datei öffnen (.mockup.json)', save: 'Als .mockup.json speichern',
      demoModel: 'Kleines Beispielmodell (Datum, Produkt, Region, Kennzahlen) laden',
      zoomOut: 'Verkleinern', zoomFit: 'Einpassen', zoomIn: 'Vergrößern', lang: 'Sprache umschalten: Deutsch / English',
      pageRename: 'Seite umbenennen', pageDelete: 'Seite löschen', pageLeft: 'Seite nach links', pageRight: 'Seite nach rechts',
      splitRow: 'In Spalten teilen', splitCol: 'In Zeilen teilen', tileRemove: 'Kachel entfernen',
      slicerRemove: 'Slicer entfernen', filterMenu: 'Filter-Menü (Bookmark)', linkTo: 'Springt zu Seite', remove: 'entfernen',
      rmNewField: 'Entfernen',
    },

    panel: { model: 'Datenmodell' },
    drop: { tmdl: 'TMDL-Ordner oder .tmdl-Dateien hierher ziehen<br><span class="mono">tables/*.tmdl</span>' },
    tab: { el: 'Kachel', page: 'Seite', report: 'Bericht', chrome: 'Rahmen', design: 'Design' },
    kind: { measure: 'Measure', column: 'Spalte', any: 'Feld' },
    engine: { ck: 'ChartKitchen', native: 'Nativ', deneb: 'Deneb' },

    sec: {
      canvas: 'Canvas (alle Seiten)', grid: 'Raster', header: 'Kopfband', nav: 'Linke Nav-Leiste', filter: 'Filter / Slicer',
      footer: 'Fußleiste', roles: 'Datenrollen', rolesHint: '(Doppelklick auf Feld = Steckbrief)', analysis: 'Analyse (wandert in die Spec)',
      workshop: 'Workshop', quickstart: 'Schnellstart',
    },

    lbl: {
      onlyUsed: 'nur verwendete Felder', reportName: 'Berichtsname', audience: 'Zielgruppe', purpose: 'Ziel des Berichts',
      decision: 'Entscheidung, die er auslösen soll', version: 'Version', dataDate: 'Datenstand / Aktualisierung',
      participants: 'Teilnehmende Workshop', lang: 'Sprache der Ausgaben',
      thisPage: 'Diese Seite', pageQuestion: 'Fragestellung / Kernbotschaft der Seite', pageNotes: 'Zweck / Notizen zur Seite',
      spacing: 'Abstände (px, skalieren mit)', defScenario: 'Standard-Szenario neuer Charts',
      headerOn: 'Kopfband anzeigen', title: 'Titel', subtitle: 'Untertitel', navAuto: 'Navigation aus den Seitennamen',
      navManual: 'Navigation manuell (kommagetrennt)', navOn: 'Nav-Leiste anzeigen (App-Stil)',
      filterOn: 'Filter anzeigen', filterCollapsible: 'Panel ausklappbar (Bookmark)', footerOn: 'Fußleiste anzeigen', text: 'Text',
      radius: 'Kachel-Ecken', tileStyle: 'Kachel-Stil', pageBg: 'Seitenhintergrund', headerStyle: 'Kopfband-Stil',
      accent: 'Akzentfarbe', dark: 'Dark Mode (Backlog)',
      name: 'Name', table: 'Tabelle', fieldKind: 'Art', descLogic: 'Beschreibung / Rechenlogik für den Agenten',
      unitFormat: 'Einheit / Format', target: 'Zielwert', owner: 'Owner (fachlich)', source: 'Quelle / Vorsystem',
      openQ: 'Offene Frage (optional)', alias: 'Heißt beim Fachbereich (Alias)', confirmed: 'Definition im Workshop bestätigt',
      renameInModel: 'im Modell umbenennen (Alias wird neuer Name)', unit: 'Einheit',
      fmNote: 'Anmerkung / abweichende Definition (z. B. „so rechne ich es heute in Excel")',
      rows: 'Zeilen', cols: 'Spalten',
      engine: 'Engine', vizTitle: 'Titel', vizSub: 'Untertitel / Einheit', tileText: 'Text der Kachel', btnCaption: 'Beschriftung',
      scenario: 'Szenario', polarity: 'Polarität', deltaBasis: 'Δ-Basis', displayUnits: 'Anzeige-Einheit', decimals: 'Dezimalstellen',
      deltaKind: 'Δ-Art', sort: 'Sortierung', sortDir: 'Richtung', topN: 'Top N', timeGrain: 'Zeitgranularität',
      scaleGroup: 'Gemeinsame Skala (Gruppe)', cumulative: 'kumuliert (YTD)', message: 'Kernaussage (Message-Titel)',
      priority: 'Priorität', status: 'Status', notes: 'Notiz (✎ auf der Kachel)',
      openQuestion: 'offene Frage (landet in der Doku unter „Offene Punkte")', link: 'Springt zu (Seite, Drill / Navigation)',
    },

    ph: {
      searchField: 'Feld suchen …', searchType: 'Typ suchen …', audience: 'z. B. Geschäftsführung, Vertriebsleitung',
      purpose: 'Welche Frage beantwortet der Bericht?', decision: 'Was wird anhand des Berichts entschieden?',
      version: '0.1', dataDate: 'täglich 6:00, Stand T-1', participants: 'Namen, Rollen',
      pageName: 'z. B. Übersicht', pageQuestion: 'z. B. Liegen wir im Plan, und wo nicht?', pageNotes: 'Zielgruppe, Drill-Wege, Interaktionen …',
      width: 'Breite', height: 'Höhe', headerSub: 'z. B. Zeitraum, Einheit', navManual: 'Übersicht, Umsatz, Kosten',
      nmName: 'z. B. Deckungsbeitrag', nmTable: '_Measures', nmDesc: 'Umsatz minus variable Kosten', nmUnit: 'T€ · #,##0',
      nmTarget: 'z. B. ≥ 12 % Marge', nmOwner: 'Name, Bereich', nmSource: 'SAP FI, CRM …', nmOpen: 'z. B. Wer liefert die Planwerte?',
      fmAlias: 'z. B. Nettoerlös', fmUnit: 'T€, %, Stück',
      vizSub: 'z. B. in T€, 2026 YTD', tileText: 'Kommentar, Kernbotschaft, Platzhaltertext …',
      anUnit: 'T€, %, Stück', anDecimals: 'auto', anTopN: 'alle', anScaleGroup: 'z. B. A',
      anMessage: 'z. B. Umsatz 8 % über Plan, Süd unter Plan', notes: 'Drill, Bedingte Formatierung, Kommentar …',
      slicerDefault: 'Vorauswahl',
    },

    hint: {
      report: 'Der Berichtskopf wandert in Brief, Workshop-Doku und PowerPoint. Ohne Zielgruppe und Entscheidung bleibt die Doku ein Bilderbuch.',
      lang: 'Gilt für Skizzen-Beschriftungen und Export-Dokumente.',
      uiScale: 'Schriften und Abstände skalieren automatisch mit der Canvas-Breite.',
      margin: 'Rand', gutter: 'Zwischenraum', pad: 'Kachel innen', height: 'Höhe', width: 'Breite', logo: 'Logo', position: 'Position',
      splitRoot: 'Setzt den Inhaltsbereich dieser Seite auf ein neues Raster (Zeilen × Spalten). Bestehende Visuals werden der Reihe nach wieder eingesetzt.',
      chrome: 'Rahmen gilt für alle Seiten.',
      filter: 'Felder aus dem Modell direkt aufs Panel ziehen, um Slicer anzulegen. Beim Burger-Menü entsteht im Export ein Bookmark-Paar „Filter öffnen / schließen" plus Button im Kopfband. Vorauswahl je Slicer eintragen, damit „mein Excel sagt was anderes" gar nicht erst entsteht.',
      design: 'Gestaltung gilt für alle Seiten und wandert als Design-Entscheidung in den Export.',
      theme: 'Farben und Schriften für Power BI kommen aus dem Theme (Design-Framework-Skill). Hier geht es um Struktur: Ecken, Flächen, Kopfband.',
      splitDlg: 'Bestehende Visuals werden der Reihe nach in die neuen Zellen gesetzt; überzählige gehen verloren.',
      noSlicers: 'Noch keine Slicer. Feld aus dem Modell hierher ziehen.',
      noRoles: 'Keine Datenrollen (statisches Element).',
      pickTile: 'Kachel anklicken, um Typ, Titel, Datenrollen, Notizen und Sprungziel zu setzen.',
      dragField: 'Oder ein Feld aus dem Modell auf die Kachel ziehen: Kennzahl → KPI, Spalte → Slicer.',
      noTypeMatch: 'Kein Typ passt zur Suche.',
      pickTypeSub: 'ChartKitchen oder nativ', changeType: '{group} · Typ ändern',
      uiScaleInfo: 'Skalierung ×{k}: Schriften, Rahmenhöhen und Abstände werden aus HD-Basiswerten hochgerechnet.',
    },

    quickstart: {
      s1: '„Vorlagen" oben wählen (lädt bei Bedarf das Demo-Modell)', s2: 'Rechts „Rahmen" und „Design" einstellen',
      s3: 'Kachel teilen (⇔ ⇕), Trennlinien ziehen', s4: 'Doppelklick auf Kachel → Visual wählen',
      s5: 'Felder aus dem Modell auf Kacheln ziehen', s6: 'Weitere Seiten über „+ Seite", Export für Claude Code',
    },

    opt: {
      canvas: { hd: 'HD · 1280 × 720 (Standard)', fhd: 'Full HD · 1920 × 1080', uhd: 'Ultra HD · 3840 × 2160', r43: '4:3 · 1280 × 960', portrait: 'Hochformat · 1080 × 1920', custom: 'Benutzerdefiniert …' },
      scen: { acpl: 'AC vs PL (Ist vs Plan)', acpy: 'AC vs PY (Ist vs Vorjahr)', acplfc: 'AC + FC vs PL', ac: 'nur AC' },
      logo: { left: 'Logo links', right: 'Logo rechts', none: 'kein Logo' },
      filter: { right: 'Panel rechts', left: 'Panel links', top: 'Leiste oben', burger: 'Burger-Menü (Bookmark)' },
      radius: { r0: 'eckig', r4: 'leicht gerundet (4 px)', r8: 'gerundet (8 px)', r12: 'stark gerundet (12 px)' },
      tile: { border: 'weiß mit feinem Rahmen', shadow: 'weiß mit weichem Schatten', flat: 'flach, ohne Rahmen' },
      bg: { light: 'hell strukturiert (#F4F4F1)', soft: 'kühl strukturiert (#EEF1F5)', white: 'weiß' },
      hdr: { light: 'hell (weiß, dunkle Schrift)', dark: 'dunkel (Ink)', accent: 'Akzentfarbe' },
      nmKind: { measure: 'Kennzahl (Measure)', column: 'Dimension / Spalte' },
      polarity: { auto: 'auto ({v})', higher: 'größer = besser', lower: 'kleiner = besser' },
      du: { auto: 'auto', none: 'keine', K: 'Tausend (K)', M: 'Millionen (M)' },
      sort: { none: 'wie im Modell', value: 'nach Wert', delta: 'nach Δ', category: 'nach Kategorie', desc: 'absteigend', asc: 'aufsteigend' },
      grain: { none: 'wie gebunden', day: 'Tag', week: 'Woche', month: 'Monat', quarter: 'Quartal', year: 'Jahr' },
      pri: { none: '–', must: 'Must', should: 'Should', could: 'Could' },
      status: { open: 'offen', agreed: 'abgestimmt', approved: 'abgenommen' },
      linkNone: '– keins –', autoBase: 'auto ({v})',
    },

    dlg: {
      cat: { h: 'Visual wählen', p: 'ChartKitchen-Typen im IBCS-Look und native Power-BI-Visuals. Klicken setzt den Typ der gewählten Kachel.' },
      tpl: { h: 'Seitenvorlagen', p: 'Startpunkt für den Inhaltsbereich der aktuellen Seite. Vorlagen bringen Feldbindungen aus dem Demo-Modell mit; ohne geladenes Modell wird es automatisch geladen.' },
      exp: { h: 'Export für Claude Code', p: 'Dateien in den PBIP-Projektordner legen, dann den Skill <span class="mono">mockup-to-powerbi</span> aufrufen.' },
      nm: { h: 'Neue Kennzahl oder Dimension', p: 'Existiert noch nicht im Modell. Wird im Export als „zu erstellen" markiert und in der Workshop-Doku beschrieben.' },
      fm: { h: 'Kennzahlen-Steckbrief' },
      split: { h: 'Inhalt neu aufteilen', p: 'Zeilen × Spalten als Startraster. Danach jede Zelle weiter teilen.' },
      help: { h: 'So funktioniert MockupKitchen', p: 'Vom Workshop-Skizzenblatt zur Power-BI-Seite.' },
    },

    tabexp: { pbir: 'pbir-visuals (aktuelle Seite)', prompt: 'Prompt für Claude Code' },

    help: {
      body: [
        '<h3>1 · Rahmen, Design, Raster</h3>',
        '<p>Rechts unter „Rahmen" Kopfband, Nav, Filter (Panel links/rechts, Leiste oben oder Burger-Menü) und Fußleiste zuschalten. Unter „Design" Ecken, Kachel-Stil, Hintergrund und Kopfband-Stil. Unter „Seite" Canvas-Größe (HD, Full HD, Ultra HD) und Abstände. Schriften skalieren mit.</p>',
        '<h3>2 · Seiten</h3>',
        '<p>Über der Zeichenfläche liegen die Seiten. „+ Seite" legt eine neue an, Doppelklick benennt um, Duplizieren und Löschen unter „Seite". Ein Visual kann auf eine Zielseite verweisen (Element → „Springt zu"), das wird als Drill/Navigation exportiert.</p>',
        '<h3>3 · Container teilen</h3>',
        '<p>Jede Kachel lässt sich per <kbd>⇔</kbd> / <kbd>⇕</kbd> in Spalten oder Zeilen teilen, per <kbd>✕</kbd> entfernen. Trennlinien ziehen, um Verhältnisse zu ändern.</p>',
        '<h3>4 · Visual, Felder, Notizen</h3>',
        '<p>Doppelklick auf eine Kachel → Typ wählen. Felder aus dem Modell auf die Kachel oder gezielt auf eine Datenrolle ziehen. Kachel auf Kachel ziehen tauscht die Inhalte. Notizen zur Kachel erscheinen als ✎-Symbol auf der Karte und beim Darüberfahren. Fehlt eine Kennzahl: „+ Kennzahl / Dimension" mit Beschreibung anlegen, sie wird im Export als To-do geführt.</p>',
        '<h3>5 · Modell</h3>',
        '<p>TMDL-Ordner (<span class="mono">*.SemanticModel/definition/tables</span>) auf die Ablagefläche ziehen, oder „Demo-Modell" für einen schnellen Start. Es werden nur Namen, Typen und Beschreibungen gelesen; nichts verlässt den Browser.</p>',
        '<h3>6 · Export</h3>',
        '<p>„Export für Claude Code" erzeugt <span class="mono">mockup-spec.json</span>, <span class="mono">AGENT-BRIEF.md</span>, <span class="mono">WORKSHOP-DOKU.md</span> und je Seite eine <span class="mono">pbir-visuals.&lt;Seite&gt;.json</span>. Dateien in den PBIP-Ordner legen und den Skill <span class="mono">mockup-to-powerbi</span> starten; er baut die Seiten und kann Doku und PowerPoint daraus erzeugen.</p>',
        '<h3>Tastatur</h3>',
        '<p><kbd>Entf</kbd> leert die Kachel · <kbd>Esc</kbd> Auswahl aufheben · <kbd>Strg</kbd>+<kbd>Z</kbd> rückgängig · <kbd>Strg</kbd>+<kbd>S</kbd> speichern · <kbd>Strg</kbd>+<kbd>E</kbd> Export. Der Stand wird automatisch im Browser gemerkt.</p>',
      ].join(''),
    },

    // ------------------------------------------------ App-Zustand / Canvas / Toasts
    state: {
      newReport: 'Neuer Bericht', firstPage: 'Übersicht', headerTitle: 'Management Report', headerSub: 'in T€ · YTD 2026',
      footerText: 'Stand: 18.09.2026 · Quelle: DWH · Kontakt: Controlling', pageN: 'Seite {n}', copySuffix: ' (Kopie)',
    },

    canvas: {
      emptyTile: 'Leere Kachel', emptyHint: 'Visual wählen oder Feld ablegen', pageTitle: 'Seitentitel',
      filter: 'Filter', dropField: '+ Feld hierher ziehen', dropFieldRole: 'Feld hierher ziehen',
      note: 'Notiz', noteOpen: 'Notiz (offene Frage)', openQuestion: 'Offene Frage', openQuestionEmpty: 'Offene Frage (noch ohne Text)',
      reqEmpty: 'Pflichtrolle leer: {roles}', priority: 'Priorität {p}', status: 'Status: {s}',
      info: '{w} × {h} px · Inhalt {cw} × {ch} · Skalierung ×{k} · Zoom {z} %',
      dims: { xy: 'x · y', wh: 'w × h' },
      maxN: 'max {n}',
    },

    model: {
      none: 'Kein Modell geladen', meta: '{src} · {tables} Tabellen · {measures} Measures', fallbackSrc: 'Modell',
      newGroup: 'Neu · zu erstellen', emptyTitle: 'Noch kein Modell',
      emptyText: 'TMDL-Ordner laden, „Demo-Modell" klicken oder Kennzahlen/Dimensionen manuell anlegen.',
      type: 'Typ', format: 'Format', description: 'Beschreibung', noDesc: '– (im Modell keine Beschreibung hinterlegt)',
      colOf: 'Spalte {t}', isNew: ' · neu (noch nicht im Modell)', tmdlSrc: 'TMDL ({n} Dateien)',
    },

    toast: {
      nothingUndo: 'Nichts rückgängig zu machen', undone: 'Rückgängig', nothingRedo: 'Nichts zu wiederholen', redone: 'Wiederholt',
      demoLoadedTpl: 'Demo-Modell geladen, Vorlage gebunden', tplSet: 'Vorlage „{t}" gesetzt', demoLoaded: 'Demo-Modell geladen',
      lastPage: 'Die letzte Seite bleibt', pickTileFirst: 'Erst eine Kachel wählen',
      fieldAssigned: 'Feld ist schon zugewiesen', slicerExists: 'Slicer existiert schon',
      noRoom: 'Kein Platz für ein Feld vom Typ „{kind}" in dieser Kachel',
      metaSaved: 'Steckbrief gespeichert', tileCleared: 'Kachel geleert · Strg+Z macht es rückgängig',
      noTmdl: 'Keine Tabellen-.tmdl gefunden (erwartet: definition/tables/*.tmdl, {n} Dateien geprüft)',
      tmdlEmpty: 'TMDL gelesen, aber keine Spalten/Measures erkannt. Datei ist vermutlich kein Tabellen-TMDL.',
      tmdlOk: '{tables} Tabellen, {measures} Measures, {columns} Spalten geladen', readFailed: 'Lesen fehlgeschlagen: {msg}',
      fieldCreated: '„{n}" angelegt · jetzt auf eine Kachel ziehen',
      fieldRemoved: '„{n}" samt {c} Bindung(en) entfernt',
      saved: 'Mockup gespeichert', loaded: '„{n}" geladen', notAMockup: 'Datei ist kein MockupKitchen-Mockup',
      copied: '{n} kopiert', pngFailed: 'PNG-Export fehlgeschlagen: {msg}', filesPng: '{f} Dateien + {p} Seitenbilder',
      langSwitched: 'Sprache: Deutsch',
    },

    ask: {
      pageName: 'Seitenname', delPage: 'Seite „{n}" löschen?',
      tplReplace: 'Vorlage „{t}" ersetzt die {n} Kachel(n) dieser Seite. Fortfahren? (Strg+Z macht es rückgängig)',
      rmField: '„{n}" ist {c}× gebunden. Feld und alle Bindungen entfernen?',
      openReplace: 'Öffnen ersetzt das aktuelle Mockup. Vorher speichern? (Abbrechen = zurück)',
    },

    role: {
      menuHead: '„{f}" zuordnen als …', free: 'frei', replaces: ' · ersetzt {n}',
      category: 'Kategorie / Achse', category2: 'Unterkategorie', time: 'Zeit / Periode', series: 'Reihe / Legende',
      ac: 'AC · Ist-Wert', ref: 'Referenz (PL / PY / BU)', fc: 'FC-Flag (1/0)', values: 'Werte', valuesAny: 'Felder',
      rows: 'Zeilen', cols: 'Spalten', x: 'X-Wert', y: 'Y-Wert', size: 'Größe', indicator: 'Kennzahl',
      goal: 'Ziel / Referenz', start: 'Start', end: 'Ende', field: 'Feld', text: 'Text (statisch oder Measure)', geo: 'Geo-Feld',
      facet: 'Facette (je Kachel)', valueCol: 'Wert (Spalte, Einzelwerte)', timeSpark: 'Zeit (Sparkline)', explainBy: 'Erklären durch',
    },

    group: {
      cols: 'IBCS · Säulen & Balken', time: 'IBCS · Zeitverlauf', struct: 'IBCS · Wasserfall & Struktur',
      table: 'Tabellen & KPI', native: 'Native Sonstige', ctrl: 'Steuerung & Text',
    },

    viz: {
      columns: { label: 'Säulen (AC vs Referenz)' }, kombi: { label: 'Säulen + Δ absolut + Δ %' }, colline: { label: 'Säulen + Linie' },
      absvar: { label: 'Δ absolut (Säulen)', note: 'Abweichung wird im Visual berechnet (AC − Ref).' },
      relvar: { label: 'Δ % (Pins)' }, bars: { label: 'Balken (Kategorien, sortiert)' }, barskombi: { label: 'Balken + Δ absolut + Δ %' },
      bullet: { label: 'Bullet (Wert vs Ziel)' }, tornado: { label: 'Tornado (links/rechts)' }, dotplot: { label: 'Punktdiagramm' },
      pareto: { label: 'Pareto (Balken + kumuliert)' }, stackcol: { label: 'Gestapelte Säulen' }, stackbar: { label: 'Gestapelte Balken' },
      marimekko: { label: 'Marimekko' }, line: { label: 'Linie (AC vs Referenz)' },
      varint: { label: 'Integrierte Varianzanalyse', note: '4 Ebenen: Δ%_YTD · Δ% · Δ-Brücke · Säulen AC/FC vs PL.' },
      slope: { label: 'Slope (2 Zeitpunkte)' }, fan: { label: 'Forecast-Korridor' }, zchart: { label: 'Z-Chart (Monat · YTD · gleitend)' },
      multiples: { label: 'Small Multiples' }, area: { label: 'Fläche (nativ)', note: 'Nicht IBCS-typisch; Linie bevorzugen.' },
      waterfall: { label: 'Wasserfall (vertikal)' }, wfint: { label: 'Wasserfall horizontal + Varianz' }, wfkombi: { label: 'Wasserfall + Δ' },
      bridge: { label: 'Brücke (Σ Ref → Δ → Σ AC)' }, tree: { label: 'Baum / Zerlegung' }, heatmap: { label: 'Heatmap (divergierend)' },
      scatter: { label: 'Streudiagramm' }, boxplot: { label: 'Boxplot' }, gantt: { label: 'Gantt' },
      kpi: { label: 'KPI-Kachel (IBCS)', note: 'Große Zahl, Δ-Zeile grün/rot, optional Sparkline.' },
      card: { label: 'Karte (nativ)' }, multirow: { label: 'Mehrzeilen-Karte' },
      table: { label: 'IBCS-Tabelle', note: 'Spalten AC · Ref · Δ · Δ% mit Mini-Balken.' },
      sparktable: { label: 'Tabelle mit Sparklines' }, matrix: { label: 'Matrix (nativ)' },
      gauge: { label: 'Tacho (nativ)', note: 'Nicht IBCS-konform; Bullet oder KPI bevorzugen.' },
      pie: { label: 'Kreis (nativ)', note: 'Nicht IBCS-konform; Balken bevorzugen.' },
      treemap: { label: 'Treemap (nativ)' }, decomp: { label: 'Zerlegungsbaum (nativ)' }, map: { label: 'Karte (Geo, nativ)' },
      deneb: { label: 'Deneb / Vega (eigenes Spec)', note: 'Spec später aus ChartKitchen exportieren oder selbst schreiben.' },
      slicer: { label: 'Slicer' }, text: { label: 'Textfeld' }, image: { label: 'Bild / Logo' }, button: { label: 'Schaltfläche' },
      noMode: {
        deneb: 'ChartKitchen hat keinen Modus für diesen Typ; Umsetzung als Deneb-Template.',
        native: 'ChartKitchen hat keinen Modus für diesen Typ; Umsetzung als natives Visual.',
      },
    },

    tpl: {
      'kpi4-main-detail': { label: 'Management-Übersicht', desc: 'KPI-Reihe, große integrierte Varianzanalyse, Δ je Produktlinie rechts.' },
      exec: { label: 'Executive One-Pager', desc: 'KPIs, Umsatz-Brücke PY → AC, Kernbotschaft als Text.' },
      'kpi4-2x2': { label: 'KPI-Reihe + 2×2', desc: 'Vier KPIs oben, darunter vier Analysen.' },
      pnl: { label: 'Monatsreport GuV', desc: 'GuV-Wasserfall links, Positionen als IBCS-Tabelle rechts, Kommentarzeile unten.' },
      sales: { label: 'Sales-Analyse', desc: 'Brücke oben, drei Detailanalysen unten.' },
      drill: { label: 'Detailseite (Drill)', desc: 'Zielseite für Drill-through: Filterhinweis, Kennzahlen, Detailtabelle, Verlauf.' },
      cost: { label: 'Kosten-Monitoring', desc: 'Small Multiples je Kostenart, Tornado der Abweichungen, KPI-Reihe.' },
      monitoring: { label: 'Monitoring · 3×2', desc: 'Sechs gleich große Kacheln: KPIs oben, Verläufe unten.' },
      empty: { label: 'Leer (2×2)', desc: 'Vier leere Kacheln zum Selbstbauen.' },
      single: { label: 'Eine Kachel', desc: 'Ganzer Inhaltsbereich, danach teilen.' },
      t: {
        revMonthAcFcPl: 'Umsatz AC/FC vs PL je Monat', inKEUR: 'in T€', dPlByLine: 'Δ PL je Produktlinie',
        bridgePyAcRegion: 'Umsatz-Brücke PY → AC je Region', keyMessage: 'Kernbotschaft',
        keyMessageNote: 'Drei Sätze: Was, warum, was tun wir.', revMonthAcPl: 'Umsatz je Monat AC vs PL',
        topProducts: 'Top-Produkte', revByMonth: 'Umsatz je Monat', revByRegion: 'Umsatz je Region',
        trend12: 'Trend 12 Monate', pnlWaterfall: 'GuV-Wasserfall', pnlItems: 'GuV-Positionen AC vs PL',
        comment: 'Kommentar / Kernbotschaft', commentNote: 'Kommentar-Modus: Controller pflegt den Text monatlich.',
        bridgePyAcLine: 'Umsatz-Brücke PY → AC je Produktlinie', revTop10Customers: 'Umsatz je Kunde (Top 10)',
        qtyVsMargin: 'Menge vs Marge je Produkt', regionByLine: 'Region × Produktlinie',
        detailLine: 'Detail: gewählte Produktlinie', detailLineNote: 'Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE).',
        lineItems: 'Einzelpositionen', trend24: 'Verlauf 24 Monate', costByAccountMonth: 'Kosten je Konto und Monat',
        dPlByAccount: 'Δ PL je Konto', revTrend: 'Umsatz-Verlauf', orderTrend: 'Aufträge-Verlauf', customerTrend: 'Kunden-Verlauf',
      },
    },

    demo: {
      source: 'Demo-Modell', date: 'Kalender', month: 'Monatsname, sortiert nach MonthKey', isForecast: '1 = Forecast-Monat, 0 = Ist',
      products: 'Produkte', productLine: 'Produktlinie', regions: 'Regionen', customers: 'Kunden',
      accounts: 'GuV-Konten', accountItem: 'GuV-Position', measures: 'Kennzahlen',
      ac: 'Ist', py: 'Vorjahr', pl: 'Plan', fc: 'Forecast', bu: 'Budget',
      margin: 'Umsatz − Kosten', avgOrder: 'Umsatz / Aufträge',
    },

    // ------------------------------------------------ Export (Brief, Doku, Prompt, Preflight)
    exp: {
      open: '[offen]', fill: '[ausfüllen]', none: '–', yes: 'ja', no: 'nein', new: '(neu)', rename: '(umbenennen)', quote: '„{t}"',
      measure: 'Measure', column: 'Spalte', measureLong: 'Kennzahl', dimension: 'Dimension',
      pri: { must: 'Must', should: 'Should', could: 'Could' },
      status: { open: 'offen', agreed: 'abgestimmt', approved: 'abgenommen' },

      brief: {
        head: 'Erzeugt von {tool} {ver} am {date} · Spec v{sv} · Hash `{hash}` · Sprache {lang}. Maschinenlesbare Fassung: `mockup-spec.json`. Umsetzung mit dem Skill `mockup-to-powerbi`.',
        hReport: '## Berichtskopf', audience: 'Zielgruppe', purpose: 'Ziel', decision: 'Entscheidung', version: 'Version', dataDate: 'Datenstand',
        hCanvas: '## Canvas und Gestaltung',
        cPages: '- {n} Seite(n), alle {w} × {h} px. Skalierung ×{s} gegenüber HD.',
        cSpacing: '- Rand {m} px · Zwischenraum {g} px · Kachel-Innenabstand {p} px.',
        cTiles: '- Kacheln: Ecken {r} px, Stil „{style}", Kachelhintergrund {tb}, Seitenhintergrund {pb}.',
        cHeader: '- Kopfband-Stil „{s}", Akzentfarbe {a}. Schriften proportional zur Skalierung (Visual-Titel ≈ {pt} pt).',
        cTheme: '- Gestaltung bevorzugt als Theme-Fragment umsetzen (visualStyles), Overrides je Visual nur für Ausnahmen.',
        hZones: '## Zonen (Chrome, auf jeder Seite identisch)',
        zoneTable: '| Zone | x | y | w | h | Inhalt |',
        zoneSep: '|---|---|---|---|---|---|',
        zNav: 'Nav-Leiste', zNavTxt: 'Shape Ink-Farbe, ein Icon-Button je Seite ({pages}), aktive Seite Akzent',
        zHeader: 'Kopfband', zFooter: 'Fußleiste', zContent: 'Inhaltsbereich', zContentTxt: 'alle Visuals liegen exakt hier drin',
        zFooterTxt: 'Textfeld {pt} pt grau: „{text}"',
        hdrLight: 'weiße Fläche mit Unterkante, dunkle Schrift', hdrDark: 'Shape Ink-Farbe, weiße Schrift', hdrAccent: 'Shape Akzentfarbe, weiße Schrift',
        hdrLogo: ', Logo {side} (Höhe {h})', sideLeft: 'links', sideRight: 'rechts',
        hdrTitle: ', Titel „{t}"', hdrSub: ' · Untertitel „{s}"',
        hdrNav: ', Nav-Buttons: {nav} (Seitennavigation, aktive Seite als deaktivierter Akzent-Button)',
        hdrBurger: ', Burger-Button links (öffnet Filter-Bookmark)',
        zFilter: 'Filter ({mode}{coll})', filterColl: ', per Bookmark ein-/ausblendbar',
        fMode: { right: 'Panel rechts', left: 'Panel links', top: 'Leiste oben', burger: 'Overlay per Burger-Menü' },
        fSlicers: 'Slicer {arr}: {list}', fArrRow: 'nebeneinander', fArrCol: 'gestapelt', fNone: 'noch keine',
        fBookmarks: '; Bookmarks: {list}',
        hPage: '## Seite {i} · {name}', pQuestion: '**Fragestellung:** {q}', pNotes: '**Notizen:** {n}', pEmpty: '_Noch keine Visuals._',
        vType: '- **Typ:** {label} (`{kind}`) · **Engine:** {engine}', vCkMode: ' · ChartKitchen-Modus `{m}`', vNative: ' · natives Visual `{t}`',
        vPos: '- **Position:** {rect} · **stabile ID:** `{id}`', vSub: '- **Untertitel / Einheit:** {s}', vText: '- **Text:** {t}',
        vScenario: '- **Szenario:** {s}', vRoles: '- **Datenrollen:**', vRolesNone: '- **Datenrollen:** keine gebunden',
        vNew: ' **(neu anlegen)**', vBuckets: '- **pbir-Buckets ({type}):** ', vAnalysis: '- **Analyse:** {a}',
        vMessage: '- **Kernaussage (Titelzeile):** {m}', vWorkshop: '- **Workshop:** {p}Status {s}',
        vLink: '- **Springt zu:** Seite „{p}" ({how})',
        linkNav: 'Seitennavigation per Button-Aktion', linkDrill: 'Drill-through; Zielseite mit Drill-through-Feld aus der Kategorie dieses Visuals',
        vNotes: '- **Notizen:** {n}', vOpenQ: ' **(offene Frage)**',
        hLinks: '## Navigation und Drill', linkTable: '| Von (Visual) | Seite | Nach Seite | Art | Drill-Feld |',
        hFields: '## Kennzahlen-Steckbrief (gebundene Felder)',
        fieldTable: '| Feld | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt |',
        hNewFields: '## Neue Kennzahlen / Felder (im Modell anlegen, bevor Visuals gebunden werden)',
        newFieldTable: '| Feld | Art | Tabelle | Beschreibung | Einheit/Format | Ziel | Owner | Quelle | offene Frage | verwendet |',
        hRules: '## Regeln für die Umsetzung',
        r1: '- Positionen und Größen exakt übernehmen; nichts „optisch nachjustieren". Rundungen ±1 px sind ok.',
        r2: '- Visual-Namen im PBIR = `id` aus der Spec (stabil über Läufe hinweg); ein zweiter Lauf ist ein Delta, kein Neubau.',
        r3: '- Chrome-Zonen auf jeder Seite identisch anlegen; Nav-Buttons auf allen Seiten, aktive Seite als deaktivierter Akzent-Button.',
        r4: '- Kein Visual außerhalb des Inhaltsbereichs, keine Überlappung; Chrome-Zonen bleiben visualfrei.',
        r5: '- Text-Kacheln mit `content` als Shape mit Text bauen (Textbox per CLI bleibt leer).',
        r6: '- Analyse-Angaben je Kachel umsetzen: Polarität (invert), Δ-Basis, Sortierung, Top-N, Einheit/Dezimalen, Granularität; `auto`-Werte sind Vorschläge, keine Entscheidungen.',
        r7: '- ChartKitchen-Visuals nur über eine vorhandene Referenz-Instanz replizieren, nie visual.json raten. Fehlt die Instanz: Platzhalter und Hinweis.',
        r8: '- Native Visuals je Seite mit `pbir add visual "<Report>.Report/<Seite>.Page" --from-json pbir-visuals.<Seite>.json` anlegen; Visuals mit leeren Pflichtrollen sind dort nicht enthalten.',
        r9: '- Neue Felder zuerst im Semantikmodell anlegen (`te`), dann `te validate --errors-only`, erst danach binden. Umbenennungswünsche (Alias) nur nach Freigabe umsetzen.',
        r10: '- Farben/Schrift kommen aus dem Theme; dieser Brief regelt Struktur, Bindung und Design-Entscheidungen.',
        hOpen: '## Offene Punkte aus dem Mockup', openPage: 'Seite „{p}"',
      },

      docs: {
        h1: '# Workshop-Dokumentation · {name}',
        head: 'Stand: {date} · Version {v} · Spec-Hash `{hash}` · erstellt mit {tool} {ver}',
        kParticipants: 'Teilnehmende', kAudience: 'Zielgruppe', kPurpose: 'Ziel des Berichts', kDecision: 'Entscheidung',
        kDataDate: 'Datenstand / Aktualisierung', kPages: 'Seiten', kModel: 'Datenmodell',
        modelNone: 'noch nicht angebunden', modelTables: '({n} Tabellen)',
        hDesign: '## Entscheidungen zur Gestaltung',
        dFormat: '- Format {w} × {h} px{preset}.',
        dHeader: '- Kopfband {v}.', dHeaderOn: '„{t}"{sub}, Stil {style}, Logo {logo}', dHeaderSub: ' · {s}',
        logoNone: 'ohne', logoLeft: 'links', logoRight: 'rechts', off: 'ohne', noneF: 'keine',
        dFilter: '- Filter {v}.', fRight: 'als Panel rechts', fLeft: 'als Panel links', fTop: 'als Leiste oben', fBurger: 'als Burger-Menü (Bookmark)',
        fPre: ' (Vorauswahl {v})', fNoFields: ', noch ohne Felder',
        dFooter: '- Fußleiste {v}.', dFooterOn: '„{t}"', dTiles: '- Kacheln {corners}, {style}, Seitenhintergrund {bg}, Akzent {accent}.',
        cornersRound: 'gerundet ({r} px)', cornersSharp: 'eckig',
        tBorder: 'mit feinem Rahmen', tShadow: 'mit weichem Schatten', tFlat: 'flach',
        hPage: '## Seite {i} · {name}', pQuestion: '**Fragestellung:** {q}', pNotes: '**Notizen:** {n}', pEmpty: '_Noch keine Kacheln._',
        table: '| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |',
        tableSep: '|---|---|---|---|---|---|---|---|',
        anLower: 'kleiner = besser', anSort: 'sortiert nach {by}', anTop: 'Top {n}', txtPrefix: 'Text: {t}',
        hLinks: '## Navigation und Drill-Wege',
        link: '- Von „{from}" ({id}) nach „{to}" ({kind})', linkNav: 'Seitenwechsel', linkDrill: 'Drill-through', linkDrillOn: 'Drill-through auf {f}',
        hFields: '## Kennzahlen-Steckbrief',
        fieldTable: '| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |',
        fieldSep: '|---|---|---|---|---|---|---|---|',
        hNew: '### Neu zu erstellen',
        newTable: '| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |',
        newSep: '|---|---|---|---|---|---|---|---|---|',
        hOpen: '## Offene Punkte', openNone: '- [ ] keine offenen Punkte erfasst', openQNoText: 'offene Frage ohne Text',
        hHints: '## Hinweise', hNext: '## Nächste Schritte',
        n1: '- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen',
        n2: '- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen',
        n3: '- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen',
      },

      prompt: {
        p1: 'Lies mockup-spec.json (Spec v{sv}, Hash {hash}), AGENT-BRIEF.md und WORKSHOP-DOKU.md im Projektordner und nutze den Skill mockup-to-powerbi, um den Bericht „{name}" ({pages} Seite(n): {pageList}; {w}×{h}) in mein PBIP-Projekt zu übertragen.',
        p2: 'Umfang: {all} Visuals ({ck} ChartKitchen, {nat} nativ, {dn} Deneb){slicers}{links}{newFields}. Sprache der Ausgaben: {lang}.',
        pSlicers: ', {n} Slicer ({mode})', pLinks: ', {n} Drill-/Navigationsverknüpfung(en)', pNewFields: ', {n} neue Felder im Modell',
        p3: 'Vorgehen: Spec validieren, Plan zeigen (Seiten, Dateien, Modelländerungen, Delta gegenüber einem bestehenden Bau), Backup/Commit, dann je Seite Chrome-Zonen, native Visuals per pbir-visuals.<Seite>.json, Text-Kacheln als Shapes mit Inhalt, ChartKitchen-Slots über die Referenz-Instanz, Analyse-Angaben (Polarität, Sortierung, Top-N, Einheit) umsetzen, Navigation/Drill/Bookmarks laut Brief. Am Ende pbir validate --fields, te validate --errors-only und den Abnahme-Check laufen lassen; danach die Workshop-Doku als PowerPoint erzeugen (PNG-Seitenbilder liegen bei, falls exportiert).',
      },

      an: {
        polarity: 'Polarität {v}', higher: 'größer = besser', lower: 'kleiner = besser', auto: ' (auto)',
        basis: 'Δ-Basis {b}{auto}, Δ {kinds}', unit: 'Einheit {u}', display: 'Anzeige {d}', decimals: '{n} Dezimalstellen',
        sort: 'Sortierung {by} {dir}', topN: 'Top {n}', grain: 'Granularität {g}', cumulative: 'kumuliert', scaleGroup: 'Skalengruppe {g}',
      },

      issue: {
        roleEmptyShort: 'Pflichtrolle „{r}" ist leer', roleEmpty: 'Pflichtrolle „{r}" leer',
        antiShort: 'Nicht IBCS-konform', anti: '{label}: {note}', antiFallback: 'nicht IBCS-konform',
        ckNoModeShort: 'ChartKitchen hat keinen Modus für diesen Typ', ckNoMode: 'ChartKitchen kann „{label}" nicht; Engine auf nativ oder Deneb stellen',
        noNativeShort: 'Kein natives Power-BI-Visual für diesen Typ', noNative: 'Kein natives Visual für „{label}"',
        textEmpty: '„{t}" hat keinen Text; Kachel käme leer im Bericht an',
        deltaNoRef: '„{t}" verspricht eine Abweichung, hat aber keine Referenz gebunden',
        emptyTile: 'Leere Kachel bei x={x}, y={y} ({w}×{h})',
        pageNoQuestion: 'Seite ohne Fragestellung / Kernbotschaft',
        navOverflow: '{n} Nav-Buttons im Kopfband; ab etwa 6 Seiten wird es eng, linke Nav-Leiste prüfen',
        renameRequest: 'Fachbereich möchte „{n}" in „{a}" umbenennen',
        newFieldUnused: 'Neues Feld „{n}" ist auf keiner Kachel gebunden',
        noAudience: 'Berichtskopf: Zielgruppe fehlt', noDecision: 'Berichtskopf: Entscheidung fehlt',
      },

      bm: { open: 'Filter öffnen', close: 'Filter schließen', overlayNote: 'Panel liegt über dem Inhalt; sichtbar nur im Bookmark „Filter öffnen".' },

      check: {
        noVisual: 'Noch kein Visual auf den Seiten.', errors: '{n} Fehler: {list}{more}', warns: '{n} Warnung(en): {list}{more}',
        infos: '{n} Hinweis(e) für die Doku (z. B. {first}).',
        ready: 'Bereit: {p} Seite(n), {v} Visuals, alle Pflichtrollen gebunden. Hash {hash}.',
      },

      hint: {
        json: 'Spec v{sv}: Berichtskopf, Design, Zonen, Seiten mit Visuals (stabile IDs, Rechtecke, Rollen, Analyse, Workshop-Status), Verknüpfungen, Steckbriefe, Issues, Hash.',
        brief: 'Für Menschen und Agenten lesbar; Format wie AGENT-BRIEF des Design-Framework-Skills.',
        docs: 'Workshop-Protokoll: Berichtskopf, Entscheidungen, Seiten, Steckbriefe, offene Punkte. Der Skill macht daraus auch eine PowerPoint.',
        pbir: 'Native Visuals mit vollständigen Pflichtrollen + Slicer der Seite „{p}". Verwenden: pbir add visual "Report.Report/{p}.Page" --from-json {file}',
        prompt: 'In Claude Code einfügen, nachdem die Dateien im PBIP-Ordner liegen.',
      },

      presetName: { '1280x720': 'HD', '1920x1080': 'Full HD', '3840x2160': 'Ultra HD' },
      tileStyle: { border: 'weiß mit feinem Rahmen', shadow: 'weiß mit weichem Schatten', flat: 'flach ohne Rahmen' },
    },
  };

  // ---------------------------------------------------------------- English
  const EN = {
    app: { title: 'MockupKitchen · sketch Power BI pages' },

    btn: {
      templates: '▦ Templates', importTmdl: '⇪ Load TMDL', present: '▶ Present', presentEnd: '✕ Exit presentation',
      open: 'Open', save: 'Save', export: 'Export for Claude Code', demoModel: 'Demo model',
      newMeasure: '+ Measure / dimension', copy: 'Copy', download: 'Download file', downloadAll: 'Download all files',
      cancel: 'Cancel', create: 'Create', split: 'Split', save2: 'Save',
      pageDup: 'Duplicate page', pageDel: 'Delete page', splitRoot: 'Re-split content …', addPage: '+ Page',
      lang: 'DE', clearTile: 'Clear tile', removeTile: 'Remove tile', pickType: 'Choose a visual …',
    },

    tip: {
      projName: 'Name of the report / mockup', templates: 'Choose a page template', importTmdl: 'Load a TMDL folder or files',
      undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)', present: 'Present: hide the panels, page large (key P)',
      help: 'Help', open: 'Open a mockup file (.mockup.json)', save: 'Save as .mockup.json',
      demoModel: 'Load a small sample model (date, product, region, measures)',
      zoomOut: 'Zoom out', zoomFit: 'Fit to view', zoomIn: 'Zoom in', lang: 'Switch language: German / English',
      pageRename: 'Rename page', pageDelete: 'Delete page', pageLeft: 'Move page left', pageRight: 'Move page right',
      splitRow: 'Split into columns', splitCol: 'Split into rows', tileRemove: 'Remove tile',
      slicerRemove: 'Remove slicer', filterMenu: 'Filter menu (bookmark)', linkTo: 'Jumps to page', remove: 'remove',
      rmNewField: 'Remove',
    },

    panel: { model: 'Data model' },
    drop: { tmdl: 'Drop a TMDL folder or .tmdl files here<br><span class="mono">tables/*.tmdl</span>' },
    tab: { el: 'Tile', page: 'Page', report: 'Report', chrome: 'Frame', design: 'Design' },
    kind: { measure: 'Measure', column: 'Column', any: 'Field' },
    engine: { ck: 'ChartKitchen', native: 'Native', deneb: 'Deneb' },

    sec: {
      canvas: 'Canvas (all pages)', grid: 'Grid', header: 'Header band', nav: 'Left nav bar', filter: 'Filters / slicers',
      footer: 'Footer', roles: 'Data roles', rolesHint: '(double-click a field for the fact sheet)', analysis: 'Analysis (goes into the spec)',
      workshop: 'Workshop', quickstart: 'Quick start',
    },

    lbl: {
      onlyUsed: 'used fields only', reportName: 'Report name', audience: 'Audience', purpose: 'Goal of the report',
      decision: 'Decision it should trigger', version: 'Version', dataDate: 'Data as of / refresh',
      participants: 'Workshop participants', lang: 'Language of the outputs',
      thisPage: 'This page', pageQuestion: 'Question / key message of the page', pageNotes: 'Purpose / notes on the page',
      spacing: 'Spacing (px, scales along)', defScenario: 'Default scenario for new charts',
      headerOn: 'Show header band', title: 'Title', subtitle: 'Subtitle', navAuto: 'Navigation from the page names',
      navManual: 'Navigation manually (comma separated)', navOn: 'Show nav bar (app style)',
      filterOn: 'Show filters', filterCollapsible: 'Panel collapsible (bookmark)', footerOn: 'Show footer', text: 'Text',
      radius: 'Tile corners', tileStyle: 'Tile style', pageBg: 'Page background', headerStyle: 'Header style',
      accent: 'Accent colour', dark: 'Dark mode (backlog)',
      name: 'Name', table: 'Table', fieldKind: 'Kind', descLogic: 'Description / calculation logic for the agent',
      unitFormat: 'Unit / format', target: 'Target value', owner: 'Owner (business)', source: 'Source / feeding system',
      openQ: 'Open question (optional)', alias: 'Called by the business (alias)', confirmed: 'Definition confirmed in the workshop',
      renameInModel: 'rename in the model (the alias becomes the new name)', unit: 'Unit',
      fmNote: 'Comment / deviating definition (e.g. “this is how I calculate it in Excel today”)',
      rows: 'Rows', cols: 'Columns',
      engine: 'Engine', vizTitle: 'Title', vizSub: 'Subtitle / unit', tileText: 'Text of the tile', btnCaption: 'Caption',
      scenario: 'Scenario', polarity: 'Polarity', deltaBasis: 'Δ base', displayUnits: 'Display units', decimals: 'Decimals',
      deltaKind: 'Δ type', sort: 'Sorting', sortDir: 'Direction', topN: 'Top N', timeGrain: 'Time grain',
      scaleGroup: 'Shared scale (group)', cumulative: 'cumulative (YTD)', message: 'Key message (message title)',
      priority: 'Priority', status: 'Status', notes: 'Note (✎ on the tile)',
      openQuestion: 'open question (goes into the documentation under “Open items”)', link: 'Jumps to (page, drill / navigation)',
    },

    ph: {
      searchField: 'Search field …', searchType: 'Search type …', audience: 'e.g. executive board, sales management',
      purpose: 'Which question does the report answer?', decision: 'What is decided based on the report?',
      version: '0.1', dataDate: 'daily 6:00, as of T-1', participants: 'Names, roles',
      pageName: 'e.g. Overview', pageQuestion: 'e.g. Are we on plan, and where are we not?', pageNotes: 'Audience, drill paths, interactions …',
      width: 'Width', height: 'Height', headerSub: 'e.g. period, unit', navManual: 'Overview, Revenue, Cost',
      nmName: 'e.g. Contribution margin', nmTable: '_Measures', nmDesc: 'Revenue minus variable cost', nmUnit: 'k€ · #,##0',
      nmTarget: 'e.g. ≥ 12 % margin', nmOwner: 'Name, department', nmSource: 'SAP FI, CRM …', nmOpen: 'e.g. Who delivers the plan values?',
      fmAlias: 'e.g. Net revenue', fmUnit: 'k€, %, pcs',
      vizSub: 'e.g. in k€, 2026 YTD', tileText: 'Comment, key message, placeholder text …',
      anUnit: 'k€, %, pcs', anDecimals: 'auto', anTopN: 'all', anScaleGroup: 'e.g. A',
      anMessage: 'e.g. revenue 8 % above plan, South below plan', notes: 'Drill, conditional formatting, comment …',
      slicerDefault: 'Preselection',
    },

    hint: {
      report: 'The report header travels into the brief, the workshop documentation and the PowerPoint. Without an audience and a decision the documentation stays a picture book.',
      lang: 'Applies to sketch labels and the export documents.',
      uiScale: 'Fonts and spacing scale automatically with the canvas width.',
      margin: 'Margin', gutter: 'Gutter', pad: 'Tile padding', height: 'Height', width: 'Width', logo: 'Logo', position: 'Position',
      splitRoot: 'Resets the content area of this page to a new grid (rows × columns). Existing visuals are placed back in order.',
      chrome: 'The frame applies to all pages.',
      filter: 'Drag fields from the model straight onto the panel to create slicers. With the burger menu the export gets a bookmark pair “Open / close filters” plus a button in the header band. Enter a preselection per slicer so that “my Excel says something else” never comes up.',
      design: 'The design applies to all pages and travels into the export as a design decision.',
      theme: 'Colours and fonts for Power BI come from the theme (design framework skill). This is about structure: corners, surfaces, header band.',
      splitDlg: 'Existing visuals are placed into the new cells in order; surplus ones are lost.',
      noSlicers: 'No slicers yet. Drag a field from the model here.',
      noRoles: 'No data roles (static element).',
      pickTile: 'Click a tile to set type, title, data roles, notes and jump target.',
      dragField: 'Or drag a field from the model onto the tile: measure → KPI, column → slicer.',
      noTypeMatch: 'No type matches the search.',
      pickTypeSub: 'ChartKitchen or native', changeType: '{group} · change type',
      uiScaleInfo: 'Scale ×{k}: fonts, frame heights and spacing are extrapolated from the HD base values.',
    },

    quickstart: {
      s1: 'Choose “Templates” at the top (loads the demo model if needed)', s2: 'Set “Frame” and “Design” on the right',
      s3: 'Split a tile (⇔ ⇕), drag the dividers', s4: 'Double-click a tile → choose a visual',
      s5: 'Drag fields from the model onto tiles', s6: 'More pages via “+ Page”, then export for Claude Code',
    },

    opt: {
      canvas: { hd: 'HD · 1280 × 720 (default)', fhd: 'Full HD · 1920 × 1080', uhd: 'Ultra HD · 3840 × 2160', r43: '4:3 · 1280 × 960', portrait: 'Portrait · 1080 × 1920', custom: 'Custom …' },
      scen: { acpl: 'AC vs PL (actual vs plan)', acpy: 'AC vs PY (actual vs previous year)', acplfc: 'AC + FC vs PL', ac: 'AC only' },
      logo: { left: 'Logo left', right: 'Logo right', none: 'no logo' },
      filter: { right: 'Panel right', left: 'Panel left', top: 'Bar on top', burger: 'Burger menu (bookmark)' },
      radius: { r0: 'square', r4: 'slightly rounded (4 px)', r8: 'rounded (8 px)', r12: 'strongly rounded (12 px)' },
      tile: { border: 'white with a fine border', shadow: 'white with a soft shadow', flat: 'flat, no border' },
      bg: { light: 'light textured (#F4F4F1)', soft: 'cool textured (#EEF1F5)', white: 'white' },
      hdr: { light: 'light (white, dark type)', dark: 'dark (ink)', accent: 'accent colour' },
      nmKind: { measure: 'Measure', column: 'Dimension / column' },
      polarity: { auto: 'auto ({v})', higher: 'higher is better', lower: 'lower is better' },
      du: { auto: 'auto', none: 'none', K: 'thousands (K)', M: 'millions (M)' },
      sort: { none: 'as in the model', value: 'by value', delta: 'by Δ', category: 'by category', desc: 'descending', asc: 'ascending' },
      grain: { none: 'as bound', day: 'Day', week: 'Week', month: 'Month', quarter: 'Quarter', year: 'Year' },
      pri: { none: '–', must: 'Must', should: 'Should', could: 'Could' },
      status: { open: 'open', agreed: 'agreed', approved: 'approved' },
      linkNone: '– none –', autoBase: 'auto ({v})',
    },

    dlg: {
      cat: { h: 'Choose a visual', p: 'ChartKitchen types in the IBCS look and native Power BI visuals. Clicking sets the type of the selected tile.' },
      tpl: { h: 'Page templates', p: 'Starting point for the content area of the current page. Templates bring field bindings from the demo model; without a loaded model it is loaded automatically.' },
      exp: { h: 'Export for Claude Code', p: 'Put the files into the PBIP project folder, then call the <span class="mono">mockup-to-powerbi</span> skill.' },
      nm: { h: 'New measure or dimension', p: 'Does not exist in the model yet. It is marked “to be created” in the export and described in the workshop documentation.' },
      fm: { h: 'KPI fact sheet' },
      split: { h: 'Re-split content', p: 'Rows × columns as the starting grid. Split each cell further afterwards.' },
      help: { h: 'How MockupKitchen works', p: 'From the workshop sketch pad to the Power BI page.' },
    },

    tabexp: { pbir: 'pbir-visuals (current page)', prompt: 'Prompt for Claude Code' },

    help: {
      body: [
        '<h3>1 · Frame, design, grid</h3>',
        '<p>On the right under “Frame” switch on the header band, the nav bar, the filters (panel left/right, bar on top or burger menu) and the footer. Under “Design” set corners, tile style, background and header style. Under “Page” set the canvas size (HD, Full HD, Ultra HD) and the spacing. Fonts scale along.</p>',
        '<h3>2 · Pages</h3>',
        '<p>The pages sit above the drawing area. “+ Page” adds one, a double-click renames it, duplicating and deleting live under “Page”. A visual can point to a target page (element → “Jumps to”); that is exported as drill / navigation.</p>',
        '<h3>3 · Splitting containers</h3>',
        '<p>Every tile can be split into columns or rows with <kbd>⇔</kbd> / <kbd>⇕</kbd> and removed with <kbd>✕</kbd>. Drag the dividers to change the ratios.</p>',
        '<h3>4 · Visual, fields, notes</h3>',
        '<p>Double-click a tile → choose the type. Drag fields from the model onto the tile or onto a specific data role. Dragging a tile onto another tile swaps their contents. Notes on a tile show up as a ✎ icon on the card and on hover. If a measure is missing: create it via “+ Measure / dimension” with a description, and it is carried into the export as a to-do.</p>',
        '<h3>5 · Model</h3>',
        '<p>Drag a TMDL folder (<span class="mono">*.SemanticModel/definition/tables</span>) onto the drop area, or click “Demo model” for a quick start. Only names, types and descriptions are read; nothing leaves the browser.</p>',
        '<h3>6 · Export</h3>',
        '<p>“Export for Claude Code” produces <span class="mono">mockup-spec.json</span>, <span class="mono">AGENT-BRIEF.md</span>, <span class="mono">WORKSHOP-DOKU.md</span> and one <span class="mono">pbir-visuals.&lt;page&gt;.json</span> per page. Put the files into the PBIP folder and start the <span class="mono">mockup-to-powerbi</span> skill; it builds the pages and can create the documentation and a PowerPoint from them.</p>',
        '<h3>Keyboard</h3>',
        '<p><kbd>Del</kbd> clears the tile · <kbd>Esc</kbd> clears the selection · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>Ctrl</kbd>+<kbd>S</kbd> save · <kbd>Ctrl</kbd>+<kbd>E</kbd> export. The state is remembered in the browser automatically.</p>',
      ].join(''),
    },

    state: {
      newReport: 'New report', firstPage: 'Overview', headerTitle: 'Management Report', headerSub: 'in k€ · YTD 2026',
      footerText: 'As of: 2026-09-18 · Source: DWH · Contact: Controlling', pageN: 'Page {n}', copySuffix: ' (copy)',
    },

    canvas: {
      emptyTile: 'Empty tile', emptyHint: 'Choose a visual or drop a field', pageTitle: 'Page title',
      filter: 'Filters', dropField: '+ Drag a field here', dropFieldRole: 'Drag a field here',
      note: 'Note', noteOpen: 'Note (open question)', openQuestion: 'Open question', openQuestionEmpty: 'Open question (no text yet)',
      reqEmpty: 'Required role empty: {roles}', priority: 'Priority {p}', status: 'Status: {s}',
      info: '{w} × {h} px · content {cw} × {ch} · scale ×{k} · zoom {z} %',
      dims: { xy: 'x · y', wh: 'w × h' },
      maxN: 'max {n}',
    },

    model: {
      none: 'No model loaded', meta: '{src} · {tables} tables · {measures} measures', fallbackSrc: 'Model',
      newGroup: 'New · to be created', emptyTitle: 'No model yet',
      emptyText: 'Load a TMDL folder, click “Demo model” or create measures / dimensions manually.',
      type: 'Type', format: 'Format', description: 'Description', noDesc: '– (no description stored in the model)',
      colOf: 'Column {t}', isNew: ' · new (not in the model yet)', tmdlSrc: 'TMDL ({n} files)',
    },

    toast: {
      nothingUndo: 'Nothing to undo', undone: 'Undone', nothingRedo: 'Nothing to redo', redone: 'Redone',
      demoLoadedTpl: 'Demo model loaded, template bound', tplSet: 'Template “{t}” applied', demoLoaded: 'Demo model loaded',
      lastPage: 'The last page stays', pickTileFirst: 'Select a tile first',
      fieldAssigned: 'The field is already assigned', slicerExists: 'That slicer already exists',
      noRoom: 'No room for a field of type “{kind}” in this tile',
      metaSaved: 'Fact sheet saved', tileCleared: 'Tile cleared · Ctrl+Z undoes it',
      noTmdl: 'No table .tmdl found (expected: definition/tables/*.tmdl, {n} files checked)',
      tmdlEmpty: 'TMDL read, but no columns / measures recognised. The file is probably not a table TMDL.',
      tmdlOk: '{tables} tables, {measures} measures, {columns} columns loaded', readFailed: 'Reading failed: {msg}',
      fieldCreated: '“{n}” created · now drag it onto a tile',
      fieldRemoved: '“{n}” and {c} binding(s) removed',
      saved: 'Mockup saved', loaded: '“{n}” loaded', notAMockup: 'The file is not a MockupKitchen mockup',
      copied: '{n} copied', pngFailed: 'PNG export failed: {msg}', filesPng: '{f} files + {p} page images',
      langSwitched: 'Language: English',
    },

    ask: {
      pageName: 'Page name', delPage: 'Delete page “{n}”?',
      tplReplace: 'The template “{t}” replaces the {n} tile(s) of this page. Continue? (Ctrl+Z undoes it)',
      rmField: '“{n}” is bound {c}×. Remove the field and all its bindings?',
      openReplace: 'Opening replaces the current mockup. Save it first? (Cancel = go back)',
    },

    role: {
      menuHead: 'Assign “{f}” as …', free: 'free', replaces: ' · replaces {n}',
      category: 'Category / axis', category2: 'Subcategory', time: 'Time / period', series: 'Series / legend',
      ac: 'AC · actual', ref: 'Reference (PL / PY / BU)', fc: 'FC flag (1/0)', values: 'Values', valuesAny: 'Fields',
      rows: 'Rows', cols: 'Columns', x: 'X value', y: 'Y value', size: 'Size', indicator: 'Measure',
      goal: 'Target / reference', start: 'Start', end: 'End', field: 'Field', text: 'Text (static or measure)', geo: 'Geo field',
      facet: 'Facet (per tile)', valueCol: 'Value (column, single values)', timeSpark: 'Time (sparkline)', explainBy: 'Explain by',
    },

    group: {
      cols: 'IBCS · Columns & bars', time: 'IBCS · Time series', struct: 'IBCS · Waterfall & structure',
      table: 'Tables & KPI', native: 'Native misc', ctrl: 'Controls & text',
    },

    viz: {
      columns: { label: 'Columns (AC vs reference)' }, kombi: { label: 'Columns + Δ absolute + Δ %' }, colline: { label: 'Columns + line' },
      absvar: { label: 'Δ absolute (columns)', note: 'The variance is calculated inside the visual (AC − ref).' },
      relvar: { label: 'Δ % (pins)' }, bars: { label: 'Bars (categories, sorted)' }, barskombi: { label: 'Bars + Δ absolute + Δ %' },
      bullet: { label: 'Bullet (value vs target)' }, tornado: { label: 'Tornado (left/right)' }, dotplot: { label: 'Dot plot' },
      pareto: { label: 'Pareto (bars + cumulative)' }, stackcol: { label: 'Stacked columns' }, stackbar: { label: 'Stacked bars' },
      marimekko: { label: 'Marimekko' }, line: { label: 'Line (AC vs reference)' },
      varint: { label: 'Integrated variance analysis', note: '4 tiers: Δ%_YTD · Δ% · Δ bridge · columns AC/FC vs PL.' },
      slope: { label: 'Slope (2 points in time)' }, fan: { label: 'Forecast corridor' }, zchart: { label: 'Z-chart (month · YTD · moving)' },
      multiples: { label: 'Small multiples' }, area: { label: 'Area (native)', note: 'Not typical for IBCS; prefer a line.' },
      waterfall: { label: 'Waterfall (vertical)' }, wfint: { label: 'Waterfall horizontal + variance' }, wfkombi: { label: 'Waterfall + Δ' },
      bridge: { label: 'Bridge (Σ ref → Δ → Σ AC)' }, tree: { label: 'Tree / decomposition' }, heatmap: { label: 'Heatmap (diverging)' },
      scatter: { label: 'Scatter plot' }, boxplot: { label: 'Box plot' }, gantt: { label: 'Gantt' },
      kpi: { label: 'KPI tile (IBCS)', note: 'Large number, Δ row green/red, optional sparkline.' },
      card: { label: 'Card (native)' }, multirow: { label: 'Multi-row card' },
      table: { label: 'IBCS table', note: 'Columns AC · ref · Δ · Δ% with mini bars.' },
      sparktable: { label: 'Table with sparklines' }, matrix: { label: 'Matrix (native)' },
      gauge: { label: 'Gauge (native)', note: 'Not IBCS-compliant; prefer a bullet or a KPI.' },
      pie: { label: 'Pie (native)', note: 'Not IBCS-compliant; prefer bars.' },
      treemap: { label: 'Treemap (native)' }, decomp: { label: 'Decomposition tree (native)' }, map: { label: 'Map (geo, native)' },
      deneb: { label: 'Deneb / Vega (own spec)', note: 'Export the spec from ChartKitchen later or write it yourself.' },
      slicer: { label: 'Slicer' }, text: { label: 'Text box' }, image: { label: 'Image / logo' }, button: { label: 'Button' },
      noMode: {
        deneb: 'ChartKitchen has no mode for this type; implement it as a Deneb template.',
        native: 'ChartKitchen has no mode for this type; implement it as a native visual.',
      },
    },

    tpl: {
      'kpi4-main-detail': { label: 'Management overview', desc: 'KPI row, large integrated variance analysis, Δ per product line on the right.' },
      exec: { label: 'Executive one-pager', desc: 'KPIs, revenue bridge PY → AC, key message as text.' },
      'kpi4-2x2': { label: 'KPI row + 2×2', desc: 'Four KPIs on top, four analyses below.' },
      pnl: { label: 'Monthly P&L report', desc: 'P&L waterfall on the left, line items as an IBCS table on the right, comment row at the bottom.' },
      sales: { label: 'Sales analysis', desc: 'Bridge on top, three detail analyses below.' },
      drill: { label: 'Detail page (drill)', desc: 'Target page for drill-through: filter hint, measures, detail table, trend.' },
      cost: { label: 'Cost monitoring', desc: 'Small multiples per cost type, tornado of the variances, KPI row.' },
      monitoring: { label: 'Monitoring · 3×2', desc: 'Six equally sized tiles: KPIs on top, trends below.' },
      empty: { label: 'Empty (2×2)', desc: 'Four empty tiles to build on yourself.' },
      single: { label: 'Single tile', desc: 'The whole content area, split it afterwards.' },
      t: {
        revMonthAcFcPl: 'Revenue AC/FC vs PL by month', inKEUR: 'in k€', dPlByLine: 'Δ PL by product line',
        bridgePyAcRegion: 'Revenue bridge PY → AC by region', keyMessage: 'Key message',
        keyMessageNote: 'Three sentences: what, why, what we do about it.', revMonthAcPl: 'Revenue by month AC vs PL',
        topProducts: 'Top products', revByMonth: 'Revenue by month', revByRegion: 'Revenue by region',
        trend12: 'Trend 12 months', pnlWaterfall: 'P&L waterfall', pnlItems: 'P&L line items AC vs PL',
        comment: 'Comment / key message', commentNote: 'Comment mode: the controller updates the text every month.',
        bridgePyAcLine: 'Revenue bridge PY → AC by product line', revTop10Customers: 'Revenue by customer (top 10)',
        qtyVsMargin: 'Quantity vs margin by product', regionByLine: 'Region × product line',
        detailLine: 'Detail: selected product line', detailLineNote: 'Drill-through target. The title shows the filtered value (SELECTEDVALUE).',
        lineItems: 'Line items', trend24: 'Trend 24 months', costByAccountMonth: 'Cost by account and month',
        dPlByAccount: 'Δ PL by account', revTrend: 'Revenue trend', orderTrend: 'Order trend', customerTrend: 'Customer trend',
      },
    },

    demo: {
      source: 'Demo model', date: 'Calendar', month: 'Month name, sorted by MonthKey', isForecast: '1 = forecast month, 0 = actual',
      products: 'Products', productLine: 'Product line', regions: 'Regions', customers: 'Customers',
      accounts: 'P&L accounts', accountItem: 'P&L line item', measures: 'Measures',
      ac: 'Actual', py: 'Previous year', pl: 'Plan', fc: 'Forecast', bu: 'Budget',
      margin: 'Revenue − cost', avgOrder: 'Revenue / orders',
    },

    exp: {
      open: '[open]', fill: '[to fill in]', none: '–', yes: 'yes', no: 'no', new: '(new)', rename: '(rename)', quote: '“{t}”',
      measure: 'Measure', column: 'Column', measureLong: 'Measure', dimension: 'Dimension',
      pri: { must: 'Must', should: 'Should', could: 'Could' },
      status: { open: 'open', agreed: 'agreed', approved: 'approved' },

      brief: {
        head: 'Generated by {tool} {ver} on {date} · spec v{sv} · hash `{hash}` · language {lang}. Machine-readable version: `mockup-spec.json`. Implement with the `mockup-to-powerbi` skill.',
        hReport: '## Report header',
        audience: 'Audience', purpose: 'Goal', decision: 'Decision', version: 'Version', dataDate: 'Data as of',
        hCanvas: '## Canvas and design',
        cPages: '- {n} page(s), all {w} × {h} px. Scale ×{s} relative to HD.',
        cSpacing: '- Margin {m} px · gutter {g} px · tile padding {p} px.',
        cTiles: '- Tiles: corners {r} px, style “{style}”, tile background {tb}, page background {pb}.',
        cHeader: '- Header style “{s}”, accent colour {a}. Fonts proportional to the scale (visual title ≈ {pt} pt).',
        cTheme: '- Implement the design as a theme fragment where possible (visualStyles); per-visual overrides only for exceptions.',
        hZones: '## Zones (chrome, identical on every page)',
        zoneTable: '| Zone | x | y | w | h | Content |',
        zoneSep: '|---|---|---|---|---|---|',
        zNav: 'Nav bar', zNavTxt: 'Shape in ink colour, one icon button per page ({pages}), active page in accent',
        zHeader: 'Header band', zFooter: 'Footer', zContent: 'Content area', zContentTxt: 'all visuals sit exactly inside this area',
        zFooterTxt: 'Text box {pt} pt grey: “{text}”',
        hdrLight: 'white surface with a bottom edge, dark type', hdrDark: 'shape in ink colour, white type', hdrAccent: 'shape in accent colour, white type',
        hdrLogo: ', logo {side} (height {h})', sideLeft: 'left', sideRight: 'right',
        hdrTitle: ', title “{t}”', hdrSub: ' · subtitle “{s}”',
        hdrNav: ', nav buttons: {nav} (page navigation, active page as a disabled accent button)',
        hdrBurger: ', burger button on the left (opens the filter bookmark)',
        zFilter: 'Filters ({mode}{coll})', filterColl: ', shown / hidden via bookmark',
        fMode: { right: 'panel right', left: 'panel left', top: 'bar on top', burger: 'overlay via burger menu' },
        fSlicers: 'Slicers {arr}: {list}', fArrRow: 'side by side', fArrCol: 'stacked', fNone: 'none yet',
        fBookmarks: '; bookmarks: {list}',
        hPage: '## Page {i} · {name}', pQuestion: '**Question:** {q}', pNotes: '**Notes:** {n}', pEmpty: '_No visuals yet._',
        vType: '- **Type:** {label} (`{kind}`) · **Engine:** {engine}', vCkMode: ' · ChartKitchen mode `{m}`', vNative: ' · native visual `{t}`',
        vPos: '- **Position:** {rect} · **stable ID:** `{id}`', vSub: '- **Subtitle / unit:** {s}', vText: '- **Text:** {t}',
        vScenario: '- **Scenario:** {s}', vRoles: '- **Data roles:**', vRolesNone: '- **Data roles:** none bound',
        vNew: ' **(to be created)**', vBuckets: '- **pbir buckets ({type}):** ', vAnalysis: '- **Analysis:** {a}',
        vMessage: '- **Key message (title line):** {m}', vWorkshop: '- **Workshop:** {p}status {s}',
        vLink: '- **Jumps to:** page “{p}” ({how})',
        linkNav: 'page navigation via button action', linkDrill: 'drill-through; target page with a drill-through field from the category of this visual',
        vNotes: '- **Notes:** {n}', vOpenQ: ' **(open question)**',
        hLinks: '## Navigation and drill', linkTable: '| From (visual) | Page | To page | Kind | Drill field |',
        hFields: '## KPI fact sheet (bound fields)',
        fieldTable: '| Field | Alias (business) | Definition from the model | Format | Unit | Owner | Source | Target | confirmed |',
        hNewFields: '## New measures / fields (create in the model before binding visuals)',
        newFieldTable: '| Field | Kind | Table | Description | Unit/format | Target | Owner | Source | open question | used |',
        hRules: '## Implementation rules',
        r1: '- Take positions and sizes exactly as given; do not “nudge them optically”. Rounding of ±1 px is fine.',
        r2: '- Visual names in PBIR = `id` from the spec (stable across runs); a second run is a delta, not a rebuild.',
        r3: '- Create the chrome zones identically on every page; nav buttons on all pages, the active page as a disabled accent button.',
        r4: '- No visual outside the content area, no overlap; the chrome zones stay free of visuals.',
        r5: '- Build text tiles that have `content` as a shape with text (a textbox created via CLI stays empty).',
        r6: '- Implement the analysis settings per tile: polarity (invert), Δ base, sorting, top N, unit/decimals, grain; `auto` values are proposals, not decisions.',
        r7: '- Replicate ChartKitchen visuals only from an existing reference instance, never guess visual.json. If the instance is missing: placeholder plus a note.',
        r8: '- Create native visuals per page with `pbir add visual "<Report>.Report/<Page>.Page" --from-json pbir-visuals.<Page>.json`; visuals with empty required roles are not contained there.',
        r9: '- Create new fields in the semantic model first (`te`), then `te validate --errors-only`, and only bind them afterwards. Implement rename requests (alias) only after approval.',
        r10: '- Colours and fonts come from the theme; this brief governs structure, binding and design decisions.',
        hOpen: '## Open items from the mockup', openPage: 'page “{p}”',
      },

      docs: {
        h1: '# Workshop documentation · {name}',
        head: 'As of: {date} · version {v} · spec hash `{hash}` · created with {tool} {ver}',
        kParticipants: 'Participants', kAudience: 'Audience', kPurpose: 'Goal of the report', kDecision: 'Decision',
        kDataDate: 'Data as of / refresh', kPages: 'Pages', kModel: 'Data model',
        modelNone: 'not connected yet', modelTables: '({n} tables)',
        hDesign: '## Design decisions',
        dFormat: '- Format {w} × {h} px{preset}.',
        dHeader: '- Header band {v}.', dHeaderOn: '“{t}”{sub}, style {style}, logo {logo}', dHeaderSub: ' · {s}',
        logoNone: 'none', logoLeft: 'left', logoRight: 'right', off: 'none', noneF: 'none',
        dFilter: '- Filters {v}.', fRight: 'as a panel on the right', fLeft: 'as a panel on the left', fTop: 'as a bar on top', fBurger: 'as a burger menu (bookmark)',
        fPre: ' (preselected {v})', fNoFields: ', no fields yet',
        dFooter: '- Footer {v}.', dFooterOn: '“{t}”', dTiles: '- Tiles {corners}, {style}, page background {bg}, accent {accent}.',
        cornersRound: 'rounded ({r} px)', cornersSharp: 'square',
        tBorder: 'with a fine border', tShadow: 'with a soft shadow', tFlat: 'flat',
        hPage: '## Page {i} · {name}', pQuestion: '**Question:** {q}', pNotes: '**Notes:** {n}', pEmpty: '_No tiles yet._',
        table: '| # | Tile | Chart | Fields | Analysis | Prio | Status | Notes |',
        tableSep: '|---|---|---|---|---|---|---|---|',
        anLower: 'lower is better', anSort: 'sorted by {by}', anTop: 'Top {n}', txtPrefix: 'Text: {t}',
        hLinks: '## Navigation and drill paths',
        link: '- From “{from}” ({id}) to “{to}” ({kind})', linkNav: 'page switch', linkDrill: 'drill-through', linkDrillOn: 'drill-through on {f}',
        hFields: '## KPI fact sheet',
        fieldTable: '| Field | Called by the business | Definition from the model | Unit | Target | Owner | Source | confirmed |',
        fieldSep: '|---|---|---|---|---|---|---|---|',
        hNew: '### To be created',
        newTable: '| Field | Kind | Table | Description / logic | Unit | Target | Owner | Source | Open question |',
        newSep: '|---|---|---|---|---|---|---|---|---|',
        hOpen: '## Open items', openNone: '- [ ] no open items recorded', openQNoText: 'open question without text',
        hHints: '## Notes', hNext: '## Next steps',
        n1: '- [ ] Confirm the measure definitions (fact sheet), create missing measures in the semantic model',
        n2: '- [ ] Transfer the pages into the PBIP with the `mockup-to-powerbi` skill',
        n3: '- [ ] Review the built pages with the participants, set the status to “approved”',
      },

      prompt: {
        p1: 'Read mockup-spec.json (spec v{sv}, hash {hash}), AGENT-BRIEF.md and WORKSHOP-DOKU.md in the project folder and use the mockup-to-powerbi skill to transfer the report “{name}” ({pages} page(s): {pageList}; {w}×{h}) into my PBIP project.',
        p2: 'Scope: {all} visuals ({ck} ChartKitchen, {nat} native, {dn} Deneb){slicers}{links}{newFields}. Language of the outputs: {lang}.',
        pSlicers: ', {n} slicers ({mode})', pLinks: ', {n} drill / navigation link(s)', pNewFields: ', {n} new fields in the model',
        p3: 'Approach: validate the spec, show the plan (pages, files, model changes, delta against an existing build), backup/commit, then per page the chrome zones, native visuals via pbir-visuals.<page>.json, text tiles as shapes with content, ChartKitchen slots via the reference instance, implement the analysis settings (polarity, sorting, top N, unit), navigation/drill/bookmarks as described in the brief. At the end run pbir validate --fields, te validate --errors-only and the acceptance check; then create the workshop documentation as a PowerPoint (page images as PNG are included if exported).',
      },

      an: {
        polarity: 'Polarity {v}', higher: 'higher is better', lower: 'lower is better', auto: ' (auto)',
        basis: 'Δ base {b}{auto}, Δ {kinds}', unit: 'Unit {u}', display: 'Display {d}', decimals: '{n} decimals',
        sort: 'Sorting {by} {dir}', topN: 'Top {n}', grain: 'Grain {g}', cumulative: 'cumulative', scaleGroup: 'Scale group {g}',
      },

      issue: {
        roleEmptyShort: 'Required role “{r}” is empty', roleEmpty: 'Required role “{r}” empty',
        antiShort: 'Not IBCS-compliant', anti: '{label}: {note}', antiFallback: 'not IBCS-compliant',
        ckNoModeShort: 'ChartKitchen has no mode for this type', ckNoMode: 'ChartKitchen cannot do “{label}”; switch the engine to native or Deneb',
        noNativeShort: 'No native Power BI visual for this type', noNative: 'No native visual for “{label}”',
        textEmpty: '“{t}” has no text; the tile would arrive empty in the report',
        deltaNoRef: '“{t}” promises a variance but has no reference bound',
        emptyTile: 'Empty tile at x={x}, y={y} ({w}×{h})',
        pageNoQuestion: 'Page without a question / key message',
        navOverflow: '{n} nav buttons in the header band; from about 6 pages on it gets tight, consider the left nav bar',
        renameRequest: 'The business wants “{n}” renamed to “{a}”',
        newFieldUnused: 'The new field “{n}” is not bound on any tile',
        noAudience: 'Report header: the audience is missing', noDecision: 'Report header: the decision is missing',
      },

      bm: { open: 'Open filters', close: 'Close filters', overlayNote: 'The panel lies over the content; visible only in the bookmark “Open filters”.' },

      check: {
        noVisual: 'No visual on the pages yet.', errors: '{n} error(s): {list}{more}', warns: '{n} warning(s): {list}{more}',
        infos: '{n} note(s) for the documentation (e.g. {first}).',
        ready: 'Ready: {p} page(s), {v} visuals, all required roles bound. Hash {hash}.',
      },

      hint: {
        json: 'Spec v{sv}: report header, design, zones, pages with visuals (stable IDs, rectangles, roles, analysis, workshop status), links, fact sheets, issues, hash.',
        brief: 'Readable for humans and agents; same format as the AGENT-BRIEF of the design framework skill.',
        docs: 'Workshop minutes: report header, decisions, pages, fact sheets, open items. The skill also turns this into a PowerPoint.',
        pbir: 'Native visuals with complete required roles plus the slicers of page “{p}”. Use: pbir add visual "Report.Report/{p}.Page" --from-json {file}',
        prompt: 'Paste into Claude Code once the files are in the PBIP folder.',
      },

      presetName: { '1280x720': 'HD', '1920x1080': 'Full HD', '3840x2160': 'Ultra HD' },
      tileStyle: { border: 'white with a fine border', shadow: 'white with a soft shadow', flat: 'flat without a border' },
    },
  };

  // ---------------------------------------------------------------- Mechanik
  // Verschachtelte Objekte auf Punkt-Schlüssel flachklopfen: { btn: { save: 'x' } } → 'btn.save'
  function flatten(o, prefix, out) {
    out = out || {}; prefix = prefix || '';
    Object.keys(o).forEach(k => {
      const v = o[k], key = prefix ? prefix + '.' + k : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out); else out[key] = v;
    });
    return out;
  }
  const DICT = { de: flatten(DE), en: flatten(EN) };
  const LS_LANG = 'mockupkitchen.lang';

  function resolve(lang, key) {
    const d = DICT[lang] || DICT.de;
    let s = d[key];
    if (s == null) s = DICT.de[key];
    return s;
  }
  function fill(s, vars) {
    if (!vars) return s;
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : vars[k]));
  }

  const listeners = [];

  const I = {
    lang: 'de',
    dict: DICT,
    langs: ['de', 'en'],
    /** Text in der aktuellen Sprache. Unbekannter Schlüssel → Schlüssel selbst (fällt im Test auf). */
    t(key, vars) { return I.tl(I.lang, key, vars); },
    /** Text in einer bestimmten Sprache (Export nutzt spec.meta.lang statt der UI-Sprache). */
    tl(lang, key, vars) {
      const s = resolve(lang === 'en' ? 'en' : 'de', key);
      if (s == null) return key;
      return fill(s, vars);
    },
    has(key, lang) { return resolve(lang || I.lang, key) != null; },
    /** Sprache setzen, merken, <html lang> und Listener nachziehen. */
    set(lang) {
      I.lang = (lang === 'en') ? 'en' : 'de';
      try { localStorage.setItem(LS_LANG, I.lang); } catch (e) { /* privater Modus */ }
      document.documentElement.setAttribute('lang', I.lang);
      listeners.forEach(fn => { try { fn(I.lang); } catch (e) { /* Listener-Fehler nicht weitertragen */ } });
      return I.lang;
    },
    onChange(fn) { if (typeof fn === 'function') listeners.push(fn); },
    /** Gemerkte Sprache (nur lesen, ohne zu setzen). */
    stored() { try { return localStorage.getItem(LS_LANG); } catch (e) { return null; } },
    /** Statische Texte im Markup setzen. */
    apply(root) {
      const r = root || document;
      if (r === document || r === document.documentElement) document.title = I.t('app.title');
      r.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = I.t(el.getAttribute('data-i18n')); });
      r.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = I.t(el.getAttribute('data-i18n-html')); });
      r.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', I.t(el.getAttribute('data-i18n-ph'))); });
      r.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', I.t(el.getAttribute('data-i18n-title'))); });
      r.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', I.t(el.getAttribute('data-i18n-aria'))); });
    },
  };

  // Gemerkte Sprache beim Laden übernehmen (der Projektzustand darf sie danach überschreiben)
  I.lang = (I.stored() === 'en') ? 'en' : 'de';
  document.documentElement.setAttribute('lang', I.lang);

  window.MK_I18N = I;
})();
