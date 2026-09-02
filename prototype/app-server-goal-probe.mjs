import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const server = spawn("codex", ["app-server", "--listen", "stdio://"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"],
});

server.stderr.on("data", (chunk) => process.stderr.write(chunk));

let nextId = 1;
const pending = new Map();
const notifications = [];

function send(message) {
  server.stdin.write(`${JSON.stringify(message)}\n`);
}

function request(method, params) {
  const id = nextId++;
  send({ method, id, params });
  return new Promise((resolve, reject) => {
    pending.set(id, { method, resolve, reject });
  });
}

const lines = createInterface({ input: server.stdout });
lines.on("line", (line) => {
  const message = JSON.parse(line);
  if (message.id !== undefined && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(`${entry.method}: ${JSON.stringify(message.error)}`));
    else entry.resolve(message.result);
    return;
  }

  if (message.method) {
    notifications.push(message);
    if (["turn/started", "turn/completed", "thread/goal/updated", "error"].includes(message.method)) {
      console.log(JSON.stringify(message));
    }
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs, description) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

try {
  await request("initialize", {
    clientInfo: { name: "loop-engineering-goal-probe", version: "0.1.0" },
    capabilities: { experimentalApi: true },
  });
  send({ method: "initialized" });

  const started = await request("thread/start", {
    cwd: process.cwd(),
    sandbox: "read-only",
    approvalPolicy: "never",
    ephemeral: false,
  });
  const threadId = started.thread.id;
  console.log(`THREAD_ID=${threadId}`);

  const objective = [
    "Complete a two-turn protocol probe without reading files, running tools, or changing anything.",
    "On the first Agent Turn, reply exactly PROBE_STEP_1 and leave the Goal active.",
    "On the automatic continuation Agent Turn, reply exactly PROBE_STEP_2, then mark the Goal complete.",
  ].join(" ");

  await request("thread/goal/set", {
    threadId,
    objective,
    status: "active",
    tokenBudget: 30000,
  });

  // Goal activation may itself schedule the first Turn. If it does not, seed
  // exactly one Turn; any later Turn must be App Server Goal continuation.
  await delay(3000);
  if (!notifications.some((message) => message.method === "turn/started")) {
    await request("turn/start", {
      threadId,
      input: [{ type: "text", text: "Begin the active Goal now.", text_elements: [] }],
    });
  }

  await waitFor(
    () => notifications.filter((message) => message.method === "turn/completed").length >= 2,
    120_000,
    "two completed Agent Turns",
  );

  const goalResult = await request("thread/goal/get", { threadId });
  const startedTurns = notifications.filter((message) => message.method === "turn/started");
  const completedTurns = notifications.filter((message) => message.method === "turn/completed");
  console.log(`TURN_STARTED_COUNT=${startedTurns.length}`);
  console.log(`TURN_COMPLETED_COUNT=${completedTurns.length}`);
  console.log(`GOAL=${JSON.stringify(goalResult.goal)}`);

  if (goalResult.goal?.status !== "complete") {
    throw new Error(`Expected complete Goal, got ${goalResult.goal?.status ?? "missing"}`);
  }
} finally {
  server.kill("SIGTERM");
}
