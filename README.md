# EarthWonders API — Node.js Sample

A minimal, standalone Node.js project that demonstrates how to upload minerals to the [EarthWonders](https://earthwonders.com) **API**. Read a CSV, send it as a batch, poll for completion, and print errors.

Use this as a starting point if you're integrating your own catalog (ERP, custom storefront, spreadsheet, etc.) with EarthWonders.

---

## Requirements

- Node.js **20 or newer** (uses native `fetch`)
- An EarthWonders **API key** (`X-API-Key`)

## Quick start

```bash
npm install
cp .env.example .env
# edit .env and set EARTHWONDERS_API_URL + EARTHWONDERS_API_KEY
npm run upload
```

By default this uploads the four rows in [`data/sample.csv`](data/sample.csv) — one per sale state (`ForSale`, `Reserved`, price on request, `Sold`). To upload your own file:

```bash
npm run upload -- path/to/your.csv
```

The script will:

1. Read entries from the CSV
2. POST them as a single batch to `/batch`
3. Poll `/batch/{id}` every 3 seconds until the batch reaches `Finished`, `Failed`, or `Archived`
4. Print per-entry import status + any errors from `/batch/{id}/errors`

## CSV format

One row per specimen. All columns are optional except **`name`**. List-valued columns (`species`, `colors`, `tags`, `mediaUrls`) accept multiple values separated by `|` or `;`.

| Column         | Type    | Notes                                                                                                |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `sourceKey`    | string  | Stable unique key per row. If omitted, the server generates one.                                     |
| `name`         | string  | **Required.** Specimen name.                                                                         |
| `description`  | string  | Free-form. Weight/size/location/species can be auto-extracted from here if not provided in columns. |
| `location`     | string  | Locality (e.g. `Artigas Uruguay`).                                                                   |
| `species`      | list    | One or more species names.                                                                           |
| `colors`       | list    | See `IngestionEntry.colors` for the valid color set; auto-detected from the first image if omitted.  |
| `weight`       | string  | e.g. `420 g`, `1.5 kg`, `2 lbs`.                                                                     |
| `size`         | string  | e.g. `11 x 10 x 7 cm`.                                                                               |
| `sku`          | string  | Internal SKU / reference.                                                                            |
| `price`        | string  | Decimal value. Symbols (`$`, `€`, `,`) are tolerated.                                                |
| `currency`     | string  | ISO code (`USD`, `EUR`, ...).                                                                        |
| `availability` | string  | Sale state: `ForSale`, `Reserved`, `NotForSale`, or `Sold` (case-insensitive). See [Availability](#availability). |
| `soldDate`     | string  | `yyyy-MM-dd`. **Required when `availability` is `Sold`.**                                            |
| `requestPrice` | boolean | `true` if price is on request.                                                                       |
| `forSale`      | boolean | Legacy `true` / `false`. Ignored when `availability` is set; prefer `availability`.                  |
| `tags`         | list    | Free-form tags.                                                                                      |
| `mediaUrls`    | list    | Public image URLs. Each becomes a `FileLink` media entry.                                            |

For the full schema (publications, video media, previous owners, etc.) see [`schema/api.schema.json`](schema/api.schema.json) and the generated [`src/api.ts`](src/api.ts).

## Availability

`availability` is the preferred way to state whether a specimen can be bought. It is an optional string enum on each `POST /batch` entry (`IngestionEntry.availability`, type `ListingAvailability` in `src/api.ts`):

| `availability` | Requires                       | Result on EarthWonders                                                                              |
| -------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `ForSale`      | a positive `price` (or `requestPrice: true`) | Priced, buyable listing.                                                                  |
| `Reserved`     | a `price`                      | Listing stays visible with its price but nobody can buy or make an offer — until set back to `ForSale`. |
| `NotForSale`   | —                              | Listing withdrawn; the specimen stays in the gallery. Never recorded as a sale, even if `soldDate` is sent. |
| `Sold`         | `soldDate` (`yyyy-MM-dd`)      | Sale recorded. The only value that creates a sales-history entry.                                   |

The same entries as the CSV, written as JSON (this is what `src/csv.ts` produces):

```json
{
  "entries": [
    {
      "sourceKey": "sample-001",
      "name": "Amethyst Cluster",
      "price": "250.00",
      "currency": "USD",
      "availability": "ForSale",
      "media": [{ "url": "https://example.com/amethyst.jpg", "sourceURLType": "FileLink" }]
    },
    {
      "sourceKey": "sample-002",
      "name": "Pyrite Cube",
      "price": "75.00",
      "currency": "EUR",
      "availability": "Reserved",
      "media": [{ "url": "https://example.com/pyrite.jpg", "sourceURLType": "FileLink" }]
    },
    {
      "sourceKey": "sample-004",
      "name": "Fluorite on Matrix",
      "price": "180.00",
      "currency": "GBP",
      "availability": "Sold",
      "soldDate": "2024-03-15",
      "media": [{ "url": "https://example.com/fluorite.jpg", "sourceURLType": "FileLink" }]
    }
  ]
}
```

Sending `"availability": "Sold"` without a `soldDate` rejects the whole batch with HTTP 400:

```json
{ "errors": { "Entries[2].SoldDate": ["soldDate is required when availability is sold."] } }
```

**Existing integrations:** when `availability` is omitted, the legacy `forSale` / `soldDate` fields behave exactly as before (`forSale: false` together with a `soldDate` still records a sale). New integrations should send `availability`.

## Project layout

```
earthwonders-api-sample/
├── data/
│   └── sample.csv          # 4-row example dataset (one per availability state)
├── schema/
│   └── api.schema.json     # Snapshot of the EarthWonders OpenAPI spec
├── src/
│   ├── api.ts              # Auto-generated typed fetch client (do not edit)
│   ├── client.ts           # Tiny factory that injects the X-API-Key header
│   ├── csv.ts              # CSV row → IngestionEntry mapper
│   ├── env.ts              # Zero-dep .env loader
│   └── upload.ts           # CLI entry point: enqueue + poll + report
├── .env.example
├── package.json
└── tsconfig.json
```

## How the client works

The typed HTTP client in `src/api.ts` is **auto-generated** from the OpenAPI spec at `schema/api.schema.json` using [`swagger-typescript-api`](https://github.com/acacode/swagger-typescript-api). It uses native `fetch` — no `axios`, no other HTTP deps.

Authentication is a single `X-API-Key` header, attached once via `baseApiParams`:

```ts
new EarthwondersAPI({
  baseUrl: process.env.EARTHWONDERS_API_URL,
  baseApiParams: { headers: { "X-API-Key": process.env.EARTHWONDERS_API_KEY } },
});
```

### Regenerating the client

Replace `schema/api.schema.json` with the latest version from EarthWonders (the snapshot here is trimmed to the `/batch` endpoints this sample uses), then:

```bash
npm run generate-client
```

## Scripts

| Script               | What it does                                                  |
| -------------------- | ------------------------------------------------------------- |
| `npm run upload`     | Run the CLI directly via `tsx` (no build step).               |
| `npm run build`      | Compile TypeScript to `dist/`.                                |
| `npm start`          | Run the compiled `dist/upload.js`.                            |
| `npm run typecheck`  | Type-check without emitting.                                  |
| `npm run generate-client` | Regenerate `src/api.ts` from `schema/api.schema.json`.   |

## License

MIT.
