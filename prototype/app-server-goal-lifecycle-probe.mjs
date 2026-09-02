import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs, description) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

class AppServerClient {
  constructor(label) {
    this.label = label;
    this.nextId = 1;
    this.pending = new Map();
    this.notifications = [];
    this.server = spawn("codex", ["app-server", "--listen", "stdio://"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.server.stderr.on("data", (chunk) => process.stderr.write(chunk));
    this.lines = createInterface({ input: this.server.stdout });
    this.lines.on("line", (line) => this.onLine(line));
  }

  onLine(line) {
    const message = JSON.parse(line);
    if (message.id !== undefined && this.pending.has(message.id)) {
      const entry = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(`${entry.method}: ${JSON.stringify(message.error)}`));
      else entry.resolve(message.result);
      return;
    }
    if (message.method) {
      this.notifications.push(message);
      if (["turn/started", "turn/completed", "thread/goal/updated", "thread/goal/cleared"].includes(message.method)) {
        console.log(`${this.label} ${JSON.stringify(message)}`);
      }
    }
  }

  send(message) {
    this.server.stdin.write(`${JSON.stringify(message)}\n`);
  }

  request(method, params) {
    const id = this.nextId++;
    this.send({ method, id, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
    });
  }

  async initialize() {
    await this.request("initialize", {
      clientInfo: { name: "loop-engineering-goal-lifecycle-probe", version: "0.1.0" },
      capabilities: { experimentalApi: true },
    });
    this.send({ method: "initialized" });
  }

  async stop() {
    this.lines.close();
    this.server.kill("SIGTERM");
    await new Promise((resolve) => this.server.once("exit", resolve));
  }
}

const objective = "Stay active until this protocol probe manually interrupts the running Agent Turn.";
let threadId;

const first = new AppServerClient("SERVER_1");
try {
  await first.initialize();
  const started = await first.request("thread/start", {
    cwd: process.cwd(),
    sandbox: "read-only",
    approvalPolicy: "never",
    ephemeral: false,
  });
  threadId = started.thread.id;
  console.log(`THREAD_ID=${threadId}`);

  await first.request("thread/goal/set", {
    threadId,
    objective,
    status: "paused",
    tokenBudget: 30000,
  });
  await delay(2000);
  if (first.notifications.some((message) => message.method === "turn/started")) {
    throw new Error("A paused Goal unexpectedly started an Agent Turn");
  }
  console.log("PAUSED_WITHOUT_TURN=true");
} finally {
  await first.stop();
}

const second = new AppServerClient("SERVER_2");
try {
  await second.initialize();
  await second.request("thread/resume", {
    threadId,
    cwd: process.cwd(),
    sandbox: "read-only",
    approvalPolicy: "never",
  });
  const recovered = await second.request("thread/goal/get", { threadId });
  if (recovered.goal?.status !== "paused" || recovered.goal.objective !== objective) {
    throw new Error(`Goal was not recovered after restart: ${JSON.stringify(recovered.goal)}`);
  }
  console.log(`RECOVERED_GOAL=${JSON.stringify(recovered.goal)}`);

  await second.request("thread/goal/set", { threadId, status: "active" });
  const turnStarted = await waitFor(
    () => second.notifications.find((message) => message.method === "turn/started"),
    30_000,
    "an Agent Turn after resuming the Goal",
  );
  const turnId = turnStarted.params.turn.id;

  const interrupt = second.request("turn/interrupt", { threadId, turnId });
  const pause = second.request("thread/goal/set", { threadId, status: "paused" });
  await Promise.all([interrupt, pause]);

  const turnCompleted = await waitFor(
    () => second.notifications.find(
      (message) => message.method === "turn/completed" && message.params.turn.id === turnId,
    ),
    30_000,
    "the interrupted Agent Turn to complete",
  );
  if (turnCompleted.params.turn.status !== "interrupted") {
    throw new Error(`Expected interrupted Turn, got ${turnCompleted.params.turn.status}`);
  }
  const paused = await second.request("thread/goal/get", { threadId });
  if (paused.goal?.status !== "paused") {
    throw new Error(`Expected paused Goal after interrupt, got ${paused.goal?.status ?? "missing"}`);
  }
  console.log(`INTERRUPTED_TURN_ID=${turnId}`);
  console.log(`GOAL_AFTER_INTERRUPT=${JSON.stringify(paused.goal)}`);
} finally {
  await second.stop();
}

const third = new AppServerClient("SERVER_3");
try {
  await third.initialize();
  await third.request("thread/resume", {
    threadId,
    cwd: process.cwd(),
    sandbox: "read-only",
    approvalPolicy: "never",
  });
  const recoveredAgain = await third.request("thread/goal/get", { threadId });
  if (recoveredAgain.goal?.status !== "paused") {
    throw new Error(`Paused Goal did not survive second restart: ${JSON.stringify(recoveredAgain.goal)}`);
  }
  await delay(2000);
  if (third.notifications.some((message) => message.method === "turn/started")) {
    throw new Error("Recovered paused Goal unexpectedly started another Agent Turn");
  }
  console.log(`RECOVERED_AFTER_INTERRUPT=${JSON.stringify(recoveredAgain.goal)}`);

  await third.request("thread/goal/clear", { threadId });
  const cleared = await third.request("thread/goal/get", { threadId });
  if (cleared.goal !== null) {
    throw new Error(`Goal clear failed: ${JSON.stringify(cleared.goal)}`);
  }
  console.log("GOAL_CLEARED=true");
} finally {
  await third.stop();
}
