import { Player } from "@player";
import { workerScripts } from "../Netscript/WorkerScripts";
import { WormSessionEvents } from "./WormEvents";
import { Settings } from "../Settings/Settings";
import { GraphData, WormDataFactory, WormGuess, evaluateInput } from "./Graph";
import { type Worm } from "./Worm";
import { type WorkerScript } from "src/Netscript/WorkerScript";
import { WormChosenValues } from "@nsdefs";
import { WORM_SOLVE_COOLDOWN, WORM_UI_NAME } from "./calculations";

export const currentWormSessions = new Map<number, WormSession>();
export const finishedWormSessions: WormSession[] = [];
export const serverLastWormSession = new Map<string, number>();

export function serverCanSolveWorm(hostname: string) {
  const lastSolve = serverLastWormSession.get(hostname);
  if (lastSolve === undefined) return true;
  return Date.now() - lastSolve > WORM_SOLVE_COOLDOWN;
}

export class WormSession {
  graph: GraphData;
  guess: WormGuess;
  params: WormChosenValues;

  startTime: number;
  finishTime: number | null;

  pid: number;
  host: string | null;
  script: string | null;

  constructor(pid: number, worm: Worm, scriptRef: WorkerScript | undefined) {
    this.pid = pid;

    const data = WormDataFactory(worm.completions);
    this.graph = data.graph;
    this.guess = data.guess;
    this.params = data.params;

    if (pid !== -1 && scriptRef !== undefined) {
      this.host = scriptRef.hostname;
      this.script = scriptRef.name;
    } else {
      this.host = null;
      this.script = null;
    }

    this.startTime = Date.now();
    this.finishTime = null;
  }

  evaluate(input: string) {
    return evaluateInput(this.graph, input);
  }

  isPathCorrect() {
    return (
      this.guess.path.length === this.graph.properties.pathLength &&
      this.evaluate(this.guess.path) === this.graph.targetState
    );
  }

  isBipartiteCorrect() {
    return this.guess.bipartite === this.graph.properties.bipartite;
  }

  isNodeValueCorrect() {
    return this.guess.value === this.graph.properties.values[this.params.value];
  }

  isNodeIndegreeCorrect() {
    return this.guess.indegree === this.graph.properties.indegrees[this.params.indegree];
  }

  isDFSStateCorrect() {
    return this.guess.dfsState === this.graph.properties.dfsOrder[this.params.dfsOrder];
  }

  solve(worm: Worm) {
    this.end();

    const comparisons = [
      this.isPathCorrect(),
      this.isBipartiteCorrect(),
      this.isNodeValueCorrect(),
      this.isNodeIndegreeCorrect(),
      this.isDFSStateCorrect(),
    ];

    if (!comparisons[0]) return 0;

    const amountCorrect = comparisons.filter((b) => b).length;
    const rewardValue = amountCorrect / comparisons.length;
    worm.completions += rewardValue;

    return rewardValue;
  }

  end() {
    this.finishTime = Date.now();
    serverLastWormSession.set(this.host ?? WORM_UI_NAME, Date.now());

    currentWormSessions.delete(this.pid);
    pushToFinishedSessions(this);

    WormSessionEvents.emit();
  }
}

export function getWormSession(pid: number) {
  const session = currentWormSessions.get(pid);
  if (session !== undefined) return session;

  const worm = Player.worm;
  if (worm === null) throw new Error("Tried to acces worm. Worm is null.");

  const newSession = new WormSession(pid, worm, workerScripts.get(pid));

  currentWormSessions.set(pid, newSession);
  WormSessionEvents.emit();

  return newSession;
}

export function pushToFinishedSessions(session: WormSession) {
  finishedWormSessions.push(session);
  if (finishedWormSessions.length > Settings.MaxRecentScriptsCapacity) {
    finishedWormSessions.splice(0, finishedWormSessions.length - Settings.MaxRecentScriptsCapacity);
  }
}

export function removeIdleWormSessions() {
  for (const session of currentWormSessions.values()) {
    if (session.pid !== -1 && !workerScripts.has(session.pid)) {
      session.end();
    }
  }
}
