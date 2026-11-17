import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const proofDirectory = join(process.cwd(), ".fleetflow", "proof-of-delivery");

export async function saveDeliveryProof(storageKey: string, data: Buffer) {
  await mkdir(proofDirectory, { recursive: true });
  await writeFile(join(proofDirectory, storageKey), data, { flag: "wx" });
}

export async function readDeliveryProof(storageKey: string) {
  return readFile(join(proofDirectory, storageKey));
}

export async function removeDeliveryProof(storageKey: string) {
  await unlink(join(proofDirectory, storageKey)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
