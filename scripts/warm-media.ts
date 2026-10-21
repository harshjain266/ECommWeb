/* eslint-disable no-console */
/**
 * Pre-generate every Cloudinary derivative the site requests.
 *
 * Cloudinary builds a derivative lazily: the first request for a transform it
 * has never seen returns 423 while it transcodes, which on a cold deploy means
 * broken-looking video for the first visitor. Running this once after seeding
 * (or after uploading new assets) pushes all of them into cache.
 *
 *   npm run media:warm
 */
import { STILLS, STUDIO_STILLS, CLIPS } from "../src/lib/media-library";
import { imageUrl, videoUrl, videoPosterUrl, blurUrl, blurUrlFor } from "../src/lib/media";

/** Must stay in step with the widths the components actually ask for. */
const IMAGE_WIDTHS = [400, 640, 800, 1200, 1600, 1920];
const VIDEO_WIDTHS = [640, 1280, 1920];
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 12;

type Job = { label: string; url: string };

const jobs: Job[] = [];

for (const id of [...STILLS, ...STUDIO_STILLS]) {
  jobs.push({ label: `${id} blur`, url: blurUrl(id) });
  for (const w of IMAGE_WIDTHS) {
    jobs.push({ label: `${id} w${w}`, url: imageUrl(id, { width: w }) });
  }
}

for (const id of CLIPS) {
  jobs.push({ label: `${id} poster`, url: videoPosterUrl(id, { width: 1200 }) });
  jobs.push({ label: `${id} blur`, url: blurUrlFor(id, "VIDEO") });
  for (const w of VIDEO_WIDTHS) {
    jobs.push({ label: `${id} mp4 w${w}`, url: videoUrl(id, { width: w, mute: true }) });
  }
}

let done = 0;
let failed = 0;

async function warm(job: Job): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(job.url, { method: "GET" });
      if (res.ok) {
        // Drain so the connection is released promptly.
        await res.arrayBuffer();
        done++;
        return;
      }
      // 423 Locked = derivative is being generated right now. Back off and retry.
      if (res.status === 423 || res.status === 429 || res.status >= 500) {
        await sleep(Math.min(2000 * attempt, 15000));
        continue;
      }
      console.warn(`  ! ${job.label} -> HTTP ${res.status}`);
      failed++;
      return;
    } catch (err) {
      await sleep(1500 * attempt);
    }
  }
  console.warn(`  ! ${job.label} -> gave up after ${MAX_ATTEMPTS} attempts`);
  failed++;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Warming ${jobs.length} Cloudinary derivatives...`);
  const queue = [...jobs];

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const job = queue.shift();
        if (!job) break;
        await warm(job);
        if (done % 25 === 0) {
          process.stdout.write(`  ${done}/${jobs.length}\n`);
        }
      }
    }),
  );

  console.log(`\nWarmed ${done}/${jobs.length} derivatives (${failed} failed).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
