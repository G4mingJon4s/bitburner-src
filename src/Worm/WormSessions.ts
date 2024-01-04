import { Player } from "@player";
import { AutomataFactory, AutomataSession } from "./Automata";
import { workerScripts } from "../Netscript/WorkerScripts";

export const wormSessions = new Map<number, AutomataSession>();
export const wormPreviousSessions: AutomataSession[] = [];

export function getWormSession(pid: number) {
	const session = wormSessions.get(pid);
	if (session !== undefined) return session;
	
	const worm = Player.worm;
	if (worm === null) throw new Error("Tried to access worm. Worm is null.");
	const newSession = AutomataFactory(worm.completions);
	wormSessions.set(pid, newSession);

	return newSession;
}

export function endWormSession(pid: number) {
	const session = wormSessions.get(pid);
	if (session === undefined) return;
	wormSessions.delete(pid);
	wormPreviousSessions.push(session);
}

export function removeIdleWormSessions() {
	const activePids = Array.from(workerScripts.keys());
	for (const sessionPid of wormSessions.keys()) {
		if (sessionPid !== -1 && !activePids.includes(sessionPid)) {
			endWormSession(sessionPid);
		}
	}
}