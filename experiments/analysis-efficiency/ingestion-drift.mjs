import { mkdtemp, writeFile, truncate, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Readable } from "node:stream";
const root = resolve(process.argv[2]);
const load = (p) => import(pathToFileURL(join(root, "dist", p)));
const { DirectoryArtifactReader } = await load(
  "artifacts/DirectoryArtifactReader.js",
);
const { ArtifactResourceScope } = await load(
  "artifacts/ArtifactResourceScope.js",
);
const { scanArtifactInventory } = await load(
  "artifacts/inventory/ArtifactInventory.js",
);
const { readJavaScriptArtifactFiles } = await load(
  "artifacts/javascript/JavaScriptArtifactFiles.js",
);
const results = [];
for (let i = 0; i < 6; i++) {
  const start = performance.now(),
    cpu = process.cpuUsage();
  const folder = await mkdtemp(join(tmpdir(), "chaichai-ingestion-bench-"));
  const scope = new ArtifactResourceScope();
  const reader = new DirectoryArtifactReader(folder);
  let acquiredBytes = 0,
    reason = null;
  try {
    const file = join(folder, "main.js");
    await writeFile(file, "export const value = 1;\n");
    const snapshot = await scanArtifactInventory(folder, {
      resourceScope: scope,
    });
    await truncate(file, 32 * 1024 * 1024);
    const open = reader.open.bind(reader);
    reader.open = async (...args) => {
      const source = await open(...args);
      return Readable.from(
        (async function* () {
          for await (const chunk of source) {
            acquiredBytes += chunk.length;
            yield chunk;
          }
        })(),
        { objectMode: false },
      );
    };
    try {
      await readJavaScriptArtifactFiles(reader, snapshot, scope);
    } catch (e) {
      reason = e.reason;
    }
    if (reason !== "integrity") throw new Error("Expected integrity failure");
  } finally {
    await reader.close();
    await scope.close();
    await rm(folder, { recursive: true, force: true });
  }
  const used = process.cpuUsage(cpu);
  results.push({
    phase: i === 0 ? "first" : "repeat",
    ms: performance.now() - start,
    cpuMs: (used.user + used.system) / 1000,
    acquiredBytes,
    processPeakRssKiB: process.resourceUsage().maxRSS,
    reason,
  });
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      results,
    },
    null,
    2,
  ),
);
