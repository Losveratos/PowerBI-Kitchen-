// Bündelt den Adapter samt ChartKitchen- und P&L-Quellcode als ESM-Paket nach dist/.
// Die Visuals werden unverändert aus ../../ibcsInspiredChartDeck und ../../pnlByDatenWG
// eingebunden; powerbi-visuals-api ist nur ein leerer Shim (zur Laufzeit nur Typen).
// Rollen und Sprachressourcen kommen aus capabilities.json bzw. stringResources/
// und werden nach src/_generated.ts geschrieben.
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const VISUALS = {
    chartkitchen: path.join(REPO, "ibcsInspiredChartDeck"),
    pnl: path.join(REPO, "pnlByDatenWG"),
};

function roles(dir) {
    const caps = JSON.parse(fs.readFileSync(path.join(dir, "capabilities.json"), "utf8"));
    const kind = Object.fromEntries(caps.dataRoles.map(r => [r.name, r.kind]));
    const cat = caps.dataViewMappings[0].categorical;
    const order = [
        ...cat.categories.select.map(s => s.for.in),
        ...cat.values.select.map(s => s.bind.to),
    ];
    const max = {};
    for (const [role, c] of Object.entries(caps.dataViewMappings[0].conditions[0])) { max[role] = c.max; }
    return { kind, order, max };
}

function locales(dir) {
    const out = {};
    const res = path.join(dir, "stringResources");
    for (const loc of fs.readdirSync(res)) {
        const f = path.join(res, loc, "resources.resjson");
        if (fs.existsSync(f)) { out[loc] = JSON.parse(fs.readFileSync(f, "utf8")); }
    }
    return out;
}

function version(dir) {
    return JSON.parse(fs.readFileSync(path.join(dir, "pbiviz.json"), "utf8")).visual.version;
}

const generated = {
    ROLES: { chartkitchen: roles(VISUALS.chartkitchen), pnl: roles(VISUALS.pnl) },
    VERSIONS: { chartkitchen: version(VISUALS.chartkitchen), pnl: version(VISUALS.pnl) },
};
fs.writeFileSync(path.join(HERE, "src/_generated.ts"),
    "// erzeugt von build.mjs aus capabilities.json und pbiviz.json, nicht von Hand ändern\n" +
    Object.entries(generated).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as const;`).join("\n") + "\n");
// Sprachressourcen getrennt je Visual, damit sie mit dem Visual-Chunk nachgeladen werden
for (const [name, dir] of Object.entries(VISUALS)) {
    fs.writeFileSync(path.join(HERE, `src/visuals/_locales-${name}.ts`),
        "// erzeugt von build.mjs aus stringResources/, nicht von Hand ändern\n" +
        `export const LOCALES: Record<string, Record<string, string>> = ${JSON.stringify(locales(dir))};\n`);
}

// formattingutils bringt die Globalize-Kulturdaten aller Sprachen mit (~750 KB).
// Die Visuals sind in DE, EN, ES und JA lokalisiert, mehr Kulturen braucht es nicht.
const KEEP_CULTURES = /^(de|en|es|ja)(-|$)/;
const slimGlobalize = {
    name: "slim-globalize",
    setup(build) {
        build.onLoad({ filter: /powerbiGlobalizeLocales\.js$/ }, async args => {
            const { locales } = await import(args.path);
            const kept = Object.fromEntries(Object.entries(locales).filter(([k]) => KEEP_CULTURES.test(k)));
            return { contents: `exports.locales = ${JSON.stringify(kept)};`, loader: "js" };
        });
    },
};

const common = {
    plugins: [slimGlobalize],
    bundle: true,
    format: "esm",
    splitting: true,
    minify: true,
    sourcemap: true,
    target: "es2020",
    chunkNames: "chunks/[name]-[hash]",
    loader: { ".less": "empty" },
    alias: { "powerbi-visuals-api": path.join(HERE, "src/pbi-shim.ts") },
    nodePaths: [path.join(HERE, "node_modules")],
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    metafile: true,
    logLevel: "warning",
};

fs.rmSync(path.join(HERE, "dist"), { recursive: true, force: true });
const result = await esbuild.build({
    ...common,
    entryPoints: [path.join(HERE, "src/index.ts")],
    outdir: path.join(HERE, "dist"),
    entryNames: "dwg-visuals",
});

const sizes = Object.entries(result.metafile.outputs)
    .filter(([f]) => f.endsWith(".js"))
    .map(([f, o]) => `${path.relative(HERE, f)}  ${(o.bytes / 1024).toFixed(0)} KB`);
console.log("dwg/visuals gebaut:\n  " + sizes.join("\n  "));

// Demo-Seite (demo/index.html lädt demo/build/main.js)
if (process.argv.includes("--demo")) {
    fs.rmSync(path.join(HERE, "demo/build"), { recursive: true, force: true });
    await esbuild.build({
        ...common,
        entryPoints: [path.join(HERE, "demo/main.ts")],
        outdir: path.join(HERE, "demo/build"),
        entryNames: "[name]",
    });
    console.log("Demo gebaut: demo/build/main.js");
}
