"use strict";

// ============================================================
// Termine aus Power BI → Kalendertag als UTC-Mitternacht (ms).
// Intern rechnet das Visual nur mit UTC-Mitternachten (Tagesarithmetik ohne
// Sommerzeit-Sprünge, Anzeige mit getUTC*). Entscheidend ist deshalb allein,
// welchen KALENDERTAG ein Eingangswert meint — unabhängig von der Zeitzone.
//
// Ohne Abhängigkeit von powerbi-visuals-api, damit test/datum.test.mjs die
// Funktionen direkt unter TZ=Europe/Berlin prüfen kann.
// ============================================================

// Kalendertag eines Zeitpunkts: der LOKALE Tag (Power BI liefert Datumsspalten
// als lokale Mitternacht, serialisiert z. B. "2024-01-01T23:00:00.000Z" für den
// 02.01.2024 in MEZ). Ausnahme: genau 00:00:00.000 UTC — so sieht ein reines
// UTC-Datum aus; lokale Mitternacht fällt westlich von Greenwich auf einen
// späteren UTC-Zeitpunkt, östlich auf den Vortag, nie genau auf 00:00 UTC
// (außer bei UTC+0, wo beide Lesarten denselben Tag liefern).
export function kalendertag(d: Date): number | null {
    const t = d.getTime();
    if (isNaN(t)) return null;
    if (t % 86400000 === 0) return t;
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function gueltig(y: number, mo: number, d: number): number | null {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const ms = Date.UTC(y, mo - 1, d);
    return new Date(ms).getUTCDate() === d ? ms : null;   // 31.02. o. ä. verwerfen
}

// ISO-Zeitstempel MIT Zone ("…Z", "…+02:00") ist ein Zeitpunkt, kein
// Kalendertag: der Datumsteil davor ist der UTC-Tag und liegt bei lokaler
// Mitternacht östlich von Greenwich einen Tag zu früh.
const ISO_MIT_ZONE = /^\d{4}-\d{1,2}-\d{1,2}[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?\s*(?:Z|[+-]\d{2}:?\d{2})$/i;
// Maschinenformat (ISO mit Uhrzeit) — so serialisiert Power BI selbst; zählt
// nicht als „Termin als Text“ für die Datenprüfung
const ISO_ZEITSTEMPEL = /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{2}/;

export function istIsoZeitstempel(raw: string): boolean {
    return ISO_ZEITSTEMPEL.test(raw.trim());
}

// Text-Termine ausdrücklich lesen. new Date("06.03.2026") deutet Monat und Tag
// US-amerikanisch und liefert den 3. JUNI — bei deutschen Exporten ein stiller
// Fehler im ganzen Plan. MS Project schreibt Termine zudem als "Mo 06.03.26 08:00".
export function textDatum(raw: string): number | null {
    const t = raw.trim().replace(/^[A-Za-zÄÖÜäöü]{2,3}\.?,?\s+/, '');   // Wochentag vorn
    if (ISO_MIT_ZONE.test(t)) return kalendertag(new Date(t.replace(' ', 'T')));
    let m = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})(?!\d)/.exec(t);
    if (m) return gueltig(m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]), Number(m[2]), Number(m[1]));
    // ISO ohne Zone ("2024-01-02", "2024-01-02T00:00:00"): lokaler Kalendertag wie geschrieben
    m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
    if (m) return gueltig(Number(m[1]), Number(m[2]), Number(m[3]));
    // Schrägstrich: US-Reihenfolge, außer die erste Zahl kann kein Monat sein
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?!\d)/.exec(t);
    if (m) {
        const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
        const a = Number(m[1]), b = Number(m[2]);
        return a > 12 ? gueltig(y, b, a) : gueltig(y, a, b);
    }
    return kalendertag(new Date(t));
}

// Beliebiger Eingangswert → UTC-Mitternacht des gemeinten Kalendertags.
// onText wird für echte Text-Termine gerufen (Zähler der Datenprüfung).
export function toUtcMs(v: unknown, onText?: () => void): number | null {
    if (v === null || v === undefined || v === '') return null;
    if (v instanceof Date) return kalendertag(v);
    if (typeof v === 'number' && isFinite(v)) return kalendertag(new Date(v));
    if (typeof v === 'string') {
        const ms = textDatum(v);
        if (ms !== null && onText && !istIsoZeitstempel(v)) onText();
        return ms;
    }
    return null;
}
