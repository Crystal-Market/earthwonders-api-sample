import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import type {
  IngestionEntry,
  ListingAvailability,
  MediaDefinition,
} from "./api.js";

const AVAILABILITY_VALUES: ListingAvailability[] = [
  "ForSale",
  "Reserved",
  "NotForSale",
  "Sold",
];

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

/**
 * The API matches `availability` case-insensitively; we normalise to the
 * canonical spelling so typos fail here instead of as an opaque HTTP 400.
 */
function parseAvailability(
  value: string | undefined,
): ListingAvailability | undefined {
  const raw = nullable(value);
  if (!raw) return undefined;
  const match = AVAILABILITY_VALUES.find(
    (v) => v.toLowerCase() === raw.toLowerCase(),
  );
  if (!match) {
    throw new Error(
      `Invalid availability "${raw}" — expected one of ${AVAILABILITY_VALUES.join(", ")}`,
    );
  }
  return match;
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
    availability: parseAvailability(row.availability),
    soldDate: nullable(row.soldDate),
    // Legacy column; ignored by the API whenever `availability` is set.
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
