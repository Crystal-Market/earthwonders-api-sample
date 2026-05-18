import { existsSync, readFileSync } from "node:fs";

/**
 * Minimal `.env` loader so the sample has zero runtime dependencies for config.
 * Existing `process.env` values win — useful when running in CI.
 */
export function loadEnvFile(path = ".env"): void {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!match) continue;
    const key = match[1]!;
    const rawValue = match[2] ?? "";
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable \`${name}\`. ` +
        `Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}
