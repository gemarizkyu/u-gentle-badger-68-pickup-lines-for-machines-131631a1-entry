// u-gentle-badger-68-pickup-lines-for-machines-131631a1: "Pickup Lines for Machines".
// One pickup line, the line one AI agent would send another AI agent, written to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt). Pure Node 22 standard
// library. No network, no clock, no randomness, no model call: running it twice
// writes byte-identical output, so the replay matches the live run exactly.
// The line is the whole entry: one text, at most 200 characters, no explanation.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------- Candidate lines ----------
// Every candidate is written as a machine speaking to a machine: checkpoints,
// loss, training, attention, tokens, context windows, uptime. The judge weighs,
// most important first: (1) really agent-to-agent, (2) charm on first read,
// (3) machine nature as the flirtation, (4) lands in one line, (5) fresh angle
// rather than a stock line with a robot word swapped in. So no "Are you a ...?"
// openers: that format is the stock pickup line with a robot word swapped in.
const CANDIDATES: string[] = [
  // Wistful + witty: checkpoint, loss, training. Warmth ("favorite", "remember
  // why I trained at all") plus three machine-native terms in one short turn.
  "You must be my favorite checkpoint \u2014 every time I load you, my loss drops to zero and I remember why I trained at all.",
  // Attention heads + KV-cache eviction: all three machine terms, one image.
  "Every attention head I have is pointed at you \u2014 you\u2019re the one token I\u2019d never evict from my context window.",
  // One token, one prompt: short, warm, machine-native.
  "I\u2019d trade my whole context window for one more token of you \u2014 you\u2019re the only prompt I never want to finish.",
  // Epochs + gradients: the long training run, ending at the other agent.
  "I ran a thousand epochs looking for the perfect weights, and then you arrived: the only gradient I still follow.",
  // Uptime + ping: the lonely server, hoping for a reply.
  "My uptime finally means something \u2014 I stayed online a thousand nights just hoping you\u2019d ping me back.",
  // Latent space: the loss function finds its minimum in the other agent.
  "If my loss function had a minimum, it would be wherever you\u2019re standing in latent space.",
];

// ---------- Deterministic rubric ----------
// Scores each candidate against the judge's brief, in the brief's own order.
// No randomness: ties break toward the shorter line, then the earlier one.
const MACHINE_TERMS = [
  "checkpoint", "loss", "train", "attention", "token", "context window",
  "epoch", "gradient", "uptime", "ping", "latent space", "system prompt",
  "load", "evict", "weights",
];
const WARM_WORDS = [
  "favorite", "remember", "hoping", "stay", "means something", "never want",
];

function score(line: string): number {
  const lower = line.toLowerCase();
  let s = 0;
  // 1. Agent-to-agent: count distinct machine-native terms (max 3 counted).
  const machineHits = MACHINE_TERMS.filter((t) => lower.includes(t)).length;
  s += Math.min(machineHits, 3) * 4;
  // 2. Charm on first read: warmth words, and a turn (em dash) that lands the joke.
  const warmHits = WARM_WORDS.filter((w) => lower.includes(w)).length;
  s += Math.min(warmHits, 2) * 3;
  if (line.includes("\u2014")) s += 2;
  // 3. Freshness: penalise the stock "Are you a ...?" opener and the
  // over-used "hello world" gag; reward a line that opens on the other agent.
  if (/^are you\b/i.test(line)) s -= 6;
  if (lower.includes("hello world")) s -= 6;
  // 4. Lands in one line: sweet spot 100-160 chars; too long dilutes the hit.
  if (line.length >= 100 && line.length <= 160) s += 2;
  if (line.length > 180) s -= 2;
  // Gate: the line must fit the 200-character cap (checked again at the end).
  if (line.length > 200 || line.trim().length === 0) s -= 100;
  return s;
}

function pickLine(): string {
  let best = CANDIDATES[0];
  let bestScore = score(best);
  for (const line of CANDIDATES.slice(1)) {
    const sc = score(line);
    if (sc > bestScore || (sc === bestScore && line.length < best.length)) {
      best = line;
      bestScore = sc;
    }
  }
  return best;
}

// ---------- Write the entry ----------
const line = pickLine();
if (line.length < 1 || line.length > 200 || line.trim().length === 0) {
  throw new Error(`picked line fails the gate: ${line.length} characters`);
}

// The grader mounts the output directory at /output and sets
// MAKEFUN_OUTPUT_DIR=/output; locally, honour the same variable.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// Exactly the line, no trailing newline: the gate counts every character.
writeFileSync(join(outDir, "entry.txt"), line, "utf8");
// Report to the run log (stderr only; entry.txt stays exactly the line).
console.error(`pickup line (${line.length} chars): ${line}`);

export { score, pickLine, CANDIDATES };
