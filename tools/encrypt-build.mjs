#!/usr/bin/env node
/**
 * encrypt-build.mjs — Encrypt a ChartKitchen .pbiviz build for the password-gated
 * beta download on the static GitHub-Pages site.
 *
 * Usage:
 *   node tools/encrypt-build.mjs <path-to.pbiviz> <password>
 *
 * Output:
 *   downloads/chartkitchen-beta.enc
 *
 * ---------------------------------------------------------------------------
 * .enc FILE FORMAT  (all fields concatenated, no separators):
 *
 *   Offset  Size      Field
 *   ------  --------  ----------------------------------------------------------
 *   0       6 bytes   MAGIC header, ASCII "CKENC1"
 *   6       16 bytes  PBKDF2 salt (random per encryption)
 *   22      12 bytes  AES-GCM initialization vector / IV (random per encryption)
 *   34      N bytes   Ciphertext, i.e. AES-256-GCM output. WebCrypto appends the
 *                     16-byte GCM authentication tag to the end of the
 *                     ciphertext, so the tag is the last 16 bytes of this field.
 *
 * KEY DERIVATION:
 *   key = PBKDF2( password (UTF-8),
 *                 salt,
 *                 iterations = 310000,
 *                 hash       = SHA-256,
 *                 keyLen     = 256 bits )
 *
 * CIPHER:
 *   AES-256-GCM, 96-bit IV, 128-bit auth tag (WebCrypto default).
 *
 * This is intentionally WebCrypto-compatible: the browser gate in
 * chartkitchen-schnellstart(.en).html re-derives the same key with
 * window.crypto.subtle and decrypts the blob after the user enters the
 * password. A wrong password fails the GCM authentication check and the
 * browser throws, which the gate reports as "wrong password".
 *
 * SECURITY NOTE: the password is NEVER written to disk or committed. It only
 * ever exists as a CLI argument at encryption time and as user input in the
 * browser at decryption time.
 * ---------------------------------------------------------------------------
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { subtle } = webcrypto;

// --- Format constants -------------------------------------------------------
const MAGIC = new TextEncoder().encode("CKENC1"); // 6 bytes
const SALT_LEN = 16;
const IV_LEN = 12;
const PBKDF2_ITERATIONS = 310000;
const KEY_BITS = 256;

async function main() {
  const [, , inputPath, password] = process.argv;

  if (!inputPath || !password) {
    console.error("Usage: node tools/encrypt-build.mjs <path-to.pbiviz> <password>");
    process.exit(1);
  }

  // Resolve output path relative to the repo root (parent of tools/).
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(scriptDir, "..");
  const outDir = resolve(repoRoot, "downloads");
  const outPath = resolve(outDir, "chartkitchen-beta.enc");

  // 1) Read plaintext build.
  const plaintext = await readFile(inputPath);

  // 2) Random salt + IV.
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = webcrypto.getRandomValues(new Uint8Array(IV_LEN));

  // 3) Derive AES-256 key from the password via PBKDF2-SHA256.
  const passKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    passKey,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    ["encrypt"]
  );

  // 4) Encrypt (GCM tag is appended to ciphertext by WebCrypto).
  const ciphertext = new Uint8Array(
    await subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plaintext)
  );

  // 5) Assemble: MAGIC | salt | IV | ciphertext.
  const blob = new Uint8Array(MAGIC.length + SALT_LEN + IV_LEN + ciphertext.length);
  let off = 0;
  blob.set(MAGIC, off); off += MAGIC.length;
  blob.set(salt, off); off += SALT_LEN;
  blob.set(iv, off); off += IV_LEN;
  blob.set(ciphertext, off);

  // 6) Write output.
  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, blob);

  // 7) Report: SHA-256 of the plaintext + file sizes (no secrets).
  const sha256 = createHash("sha256").update(plaintext).digest("hex");
  console.log("ChartKitchen build encrypted.");
  console.log("  input           : " + inputPath);
  console.log("  output          : " + outPath);
  console.log("  plaintext bytes : " + plaintext.length);
  console.log("  encrypted bytes : " + blob.length);
  console.log("  plaintext SHA256: " + sha256);
}

main().catch((err) => {
  console.error("Encryption failed:", err.message);
  process.exit(1);
});
