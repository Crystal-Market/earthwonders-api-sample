import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import type { IngestionEntry, MediaDefinition } from "./api.js";

/**
 * Splits a multi-value cell on `|` or `;`. Trims and drops empty values.
 * Use this for any column that maps to a `string[]` field in `IngestionEntry`.
 */
function splitList(value: string | undefined): string[] | null {
  if (!value) return null;
  const parts = value
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

function parseBool(value: string | undefined): boolean | null {
  if (value === undefined || value === "") return null;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(v)) return true;
  if (["0", "false", "no", "n"].includes(v)) return false;
  return null;
}

function nullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildMedia(urls: string[] | null): MediaDefinition[] | null {
  if (!urls) return null;
  return urls.map((url) => ({ url, sourceURLType: "FileLink" }));
}

type CsvRow = Record<string, string>;

/**
 * Map one CSV row to an `IngestionEntry`. The CSV column names mirror the
 * `IngestionEntry` fields — see README for the supported columns.
 */
function rowToEntry(row: CsvRow): IngestionEntry {
  const name = nullable(row.name);
  if (!name) {
    throw new Error(
      `CSV row is missing a required \`name\` value: ${JSON.stringify(row)}`,
    );
  }

  return {
    sourceKey: nullable(row.sourceKey),
    name,
    description: nullable(row.description),
    location: nullable(row.location),
    weight: nullable(row.weight),
    size: nullable(row.size),
    sku: nullable(row.sku),
    price: nullable(row.price),
    currency: nullable(row.currency),
    forSale: parseBool(row.forSale),
    requestPrice: parseBool(row.requestPrice),
    species: splitList(row.species),
    colors: splitList(row.colors),
    tags: splitList(row.tags),
    media: buildMedia(splitList(row.mediaUrls)),
  };
}

export function readEntriesFromCsv(path: string): IngestionEntry[] {
  const content = readFileSync(path, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
  return rows.map(rowToEntry);
}
