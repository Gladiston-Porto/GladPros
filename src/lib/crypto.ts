import "server-only"
import crypto from "node:crypto"

// Check if we're in build time
function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-production-server' ||
    process.env.NEXT_PHASE === 'phase-static' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.CI === 'true'
  );
}

// Lazy initialization of encryption keys
let CLIENT_DOC_KEY: Buffer | null = null;
let CLIENT_DOC_FALLBACK_KEYS: Buffer[] = [];

function initializeKeys() {
  if (CLIENT_DOC_KEY) return; // Already initialized
  
  if (isBuildTime()) {
    // Use dummy keys during build time
    CLIENT_DOC_KEY = Buffer.alloc(32, 0);
    CLIENT_DOC_FALLBACK_KEYS = [];
    return;
  }
  
  // Primary key (required)
  const b64 = process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64;
  if (!b64) throw new Error("Missing CLIENT_DOC_ENCRYPTION_KEY_BASE64");
  CLIENT_DOC_KEY = Buffer.from(b64, "base64");
  if (CLIENT_DOC_KEY.length !== 32) throw new Error("CLIENT_DOC_ENCRYPTION_KEY_BASE64 must decode to 32 bytes");

  // Optional fallback keys for rotation (comma-separated base64 strings)
  const fallbacksEnv = process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS || "";
  CLIENT_DOC_FALLBACK_KEYS = fallbacksEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Buffer.from(s, "base64"))
    .filter((buf) => buf.length === 32);
}

function sha256hex(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex")
}

export function getDocKeyFingerprint() {
  initializeKeys();
  // short fingerprint for ops visibility (non-reversible)
  return sha256hex(CLIENT_DOC_KEY!).slice(0, 16)
}

export function getFallbackKeyFingerprints() {
  initializeKeys();
  return CLIENT_DOC_FALLBACK_KEYS.map((k) => sha256hex(k).slice(0, 16))
}

export function encryptDoc(plaintext: string) {
  initializeKeys();
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", CLIENT_DOC_KEY!, iv)
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString("base64") // iv|tag|data
}

export function decryptDoc(payloadB64: string) {
  initializeKeys();
  const buf = Buffer.from(payloadB64, "base64")
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  // try primary, then fallbacks
  const tryKeys = [CLIENT_DOC_KEY!, ...CLIENT_DOC_FALLBACK_KEYS]
  for (const key of tryKeys) {
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
      decipher.setAuthTag(tag)
      const dec = Buffer.concat([decipher.update(data), decipher.final()])
      return dec.toString("utf8")
    } catch {
      // try next key
    }
  }
  throw new Error("DECRYPT_FAILED")
}

export function normalizeDocument(doc: string) {
  return doc.replace(/[^0-9A-Za-z]/g, "").toUpperCase()
}

export function docHashHex(doc: string) {
  const norm = normalizeDocument(doc)
  return crypto.createHash("sha256").update(norm).digest("hex")
}

export function last4(doc: string) {
  return normalizeDocument(doc).slice(-4)
}