// Regressionstest Termine/Zeitzone (2.2.1.0): jeder Eingangswert muss auf
// denselben KALENDERTAG führen, egal in welcher Zeitzone Power BI läuft.
// 2.1/2.2 lasen "2024-01-01T23:00:00.000Z" (= lokale Mitternacht 02.01. in MEZ)
// als 01.01. → alle Termine einen Tag zu früh.
//
//   npm run harness && node test/datum.test.mjs
//
// Ohne TZ läuft der Test nacheinander in Europe/Berlin (Pflicht), UTC,
// America/New_York und Asia/Tokyo; mit TZ=… nur in dieser Zone.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ZONEN = ['Europe/Berlin', 'UTC', 'America/New_York', 'Asia/Tokyo'];

if (!process.env.DATUM_TEST_KIND) {
    const zonen = process.env.TZ ? [process.env.TZ] : ZONEN;
    let fehler = 0;
    for (const tz of zonen) {
        const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)],
            { env: { ...process.env, TZ: tz, DATUM_TEST_KIND: '1' }, stdio: 'inherit' });
        if (r.status !== 0) fehler++;
    }
    process.exit(fehler ? 1 : 0);
}

const { toUtcMs, textDatum } = await import('./datum.js');
const { Kalender } = await import('./gantt.js');

const tz = process.env.TZ;
const DAY = 86400000;
const tt = ms => ms === null ? 'null' : new Date(ms).toISOString().slice(0, 10).split('-').reverse().join('.');
const p2 = n => String(n).padStart(2, '0');
const zone = d => { const o = -d.getTimezoneOffset(); return (o >= 0 ? '+' : '-') + p2(Math.floor(Math.abs(o) / 60)) + ':' + p2(Math.abs(o) % 60); };

if (tz === 'Europe/Berlin') {
    const w = new Date(2024, 0, 2).getTimezoneOffset(), s = new Date(2024, 6, 2).getTimezoneOffset();
    if (w !== -60 || s !== -120) { console.error(`TZ nicht wirksam (Offset ${w}/${s})`); process.exit(1); }
}

// 2.2.0.0-Verhalten zum Vergleich: Datumsteil eines ISO-Strings wörtlich
const alt = v => {
    if (v instanceof Date) return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate());
    if (typeof v === 'number') { const d = new Date(v); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : textDatum(v);
};

const TAGE = [[2024, 1, 2, 'Winter'], [2024, 4, 1, 'Sommer'], [2026, 7, 31, 'Sommer'],
    [2024, 10, 27, 'Ende Sommerzeit'], [2024, 3, 31, 'Beginn Sommerzeit'], [2024, 1, 1, 'Jahreswechsel']];
const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

let fehler = 0;
const zeilen = [];
for (const [y, m, d, art] of TAGE) {
    const soll = Date.UTC(y, m - 1, d);
    const lokal = new Date(y, m - 1, d);                 // so liefert Power BI Datumsspalten
    const iso = `${y}-${p2(m)}-${p2(d)}`;
    const ein = [
        ['Date lokale Mitternacht', lokal],
        ['Zahl (ms) lokale Mitternacht', lokal.getTime()],
        ['ISO ohne Zone', iso + 'T00:00:00'],
        ['ISO nur Datum', iso],
        ['ISO …Z lokale Mitternacht', lokal.toISOString()],
        ['ISO mit Offset', iso + 'T00:00:00' + zone(lokal)],
        ['ISO …Z UTC-Mitternacht', iso + 'T00:00:00.000Z'],
        ['TT.MM.JJJJ', `${p2(d)}.${p2(m)}.${y}`],
        ['MS Project Text', `${WT[lokal.getDay()]} ${p2(d)}.${p2(m)}.${String(y).slice(2)} 08:00`],
    ];
    for (const [name, v] of ein) {
        const ist = toUtcMs(v);
        const ok = ist === soll;
        if (!ok) fehler++;
        zeilen.push({ tag: `${tt(soll)} (${art})`, eingabe: name, wert: v instanceof Date ? 'Date(' + v.toString().slice(4, 24) + ')' : String(v), '2.2.0.0': tt(alt(v)), neu: tt(ist), ok: ok ? 'ok' : 'FEHLER' });
    }
}

// Tagesarithmetik über die Umstellungen: UTC-Mitternachten, exakt 1 Tag Abstand
const arith = [];
const pruefe = (name, ist, soll) => { const ok = ist === soll; if (!ok) fehler++; arith.push({ pruefung: name, ist, soll, ok: ok ? 'ok' : 'FEHLER' }); };
const tag = (y, m, d) => toUtcMs(new Date(y, m - 1, d));
pruefe('30.03.→31.03.2024 (Beginn Sommerzeit), Tage', (tag(2024, 3, 31) - tag(2024, 3, 30)) / DAY, 1);
pruefe('31.03.→01.04.2024, Tage', (tag(2024, 4, 1) - tag(2024, 3, 31)) / DAY, 1);
pruefe('26.10.→27.10.2024 (Ende Sommerzeit), Tage', (tag(2024, 10, 27) - tag(2024, 10, 26)) / DAY, 1);
pruefe('27.10.→28.10.2024, Tage', (tag(2024, 10, 28) - tag(2024, 10, 27)) / DAY, 1);
pruefe('Dauer 02.01.–31.07.2026 in Tagen', (tag(2026, 7, 31) - tag(2026, 1, 2)) / DAY, 210);
const kal = new Kalender([]);
pruefe('Arbeitstage Fr 29.03.–Di 02.04.2024', kal.zwischen(tag(2024, 3, 29), tag(2024, 4, 2)), 3);
pruefe('Arbeitstage Fr 25.10.–Di 29.10.2024', kal.zwischen(tag(2024, 10, 25), tag(2024, 10, 29)), 3);
pruefe('Fr 29.03.2024 + 1 Arbeitstag', tt(kal.plus(tag(2024, 3, 29), 1)), '01.04.2024');
pruefe('So 31.03.2024 ist kein Arbeitstag', kal.istArbeitstag(tag(2024, 3, 31)), false);
pruefe('Mo 28.10.2024 ist Arbeitstag', kal.istArbeitstag(tag(2024, 10, 28)), true);

console.log(`\n=== TZ=${tz} ===`);
if (tz === 'Europe/Berlin') { console.table(zeilen); console.table(arith); }
console.log(fehler ? `${fehler} FEHLER in ${tz}` : `alle ${zeilen.length + arith.length} Prüfungen ok in ${tz}`);
if (fehler && tz !== 'Europe/Berlin') console.table(zeilen.filter(z => z.ok !== 'ok'));
process.exit(fehler ? 1 : 0);
