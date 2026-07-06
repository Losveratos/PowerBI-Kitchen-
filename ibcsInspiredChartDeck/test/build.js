// bundles src/visual.ts for the browser harness (powerbi-visuals-api shimmed)
const esbuild = require("esbuild");
const path = require("path");

const ROOT = path.join(__dirname, "..");

esbuild.build({
    entryPoints: [path.join(ROOT, "src/visual.ts")],
    bundle: true,
    format: "iife",
    globalName: "ZebraIBCS",
    outfile: path.join(__dirname, "visual.bundle.js"),
    loader: { ".less": "empty" },
    alias: { "powerbi-visuals-api": path.join(__dirname, "pbi-shim.js") },
    absWorkingDir: ROOT,
    tsconfigRaw: JSON.stringify({ compilerOptions: { experimentalDecorators: true } })
}).then(() => console.log("bundle ok")).catch(e => { console.error(e); process.exit(1); });
