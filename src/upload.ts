#!/usr/bin/env node
import { resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { GetBatchStatusResponse } from "./api.js";
import { createEarthwondersClient } from "./client.js";
import { readEntriesFromCsv } from "./csv.js";
import { loadEnvFile, requireEnv } from "./env.js";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1_000;

const TERMINAL_STATUSES = new Set<GetBatchStatusResponse["status"]>([
  "Finished",
  "Failed",
  "Archived",
]);

async function pollUntilDone(
  client: ReturnType<typeof createEarthwondersClient>,
  batchId: number,
): Promise<GetBatchStatusResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStep: string | null | undefined;

  while (Date.now() < deadline) {
    const status = await client.batch.getBatchStatus(batchId);

    if (status.currentStep !== lastStep) {
      console.log(
        `  step: ${status.currentStep ?? "—"} (${status.stepProgressPercent ?? 0}%) [${status.status}]`,
      );
      lastStep = status.currentStep;
    }

    if (TERMINAL_STATUSES.has(status.status)) return status;
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out polling batch ${batchId} after ${POLL_TIMEOUT_MS}ms`);
}

async function main() {
  loadEnvFile();

  const csvPath = resolve(process.argv[2] ?? "data/sample.csv");
  const baseUrl = requireEnv("EARTHWONDERS_API_URL");
  const apiKey = requireEnv("EARTHWONDERS_API_KEY");

  console.log(`Reading entries from ${csvPath}`);
  const entries = readEntriesFromCsv(csvPath);
  if (entries.length === 0) {
    console.log("No entries found in CSV — nothing to upload.");
    return;
  }
  console.log(`Uploading ${entries.length} entries to ${baseUrl}`);

  const client = createEarthwondersClient(baseUrl, apiKey);

  const { batchId } = await client.batch.enqueueIngestionBatch({ entries });
  console.log(`Batch accepted: id=${batchId}`);

  const finalStatus = await pollUntilDone(client, batchId);
  console.log(`Batch ${batchId} finished with status: ${finalStatus.status}`);

  for (const imported of finalStatus.importedEntries) {
    console.log(
      `  ${imported.sourceKey} → specimen=${imported.details.specimenImportStatus}, ` +
        `listing=${imported.details.listingImportStatus}` +
        (imported.specimenLink ? ` (${imported.specimenLink})` : ""),
    );
  }

  if (finalStatus.status !== "Finished") {
    const { errors } = await client.batch.getBatchErrors(batchId);
    if (errors.length) {
      console.error(`\n${errors.length} error(s) reported:`);
      for (const err of errors) {
        console.error(
          `  [${err.processingStep}] ${err.sourceKey ?? "(no key)"}: ${err.message}`,
        );
      }
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
