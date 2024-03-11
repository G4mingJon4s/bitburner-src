import { Player } from "@player";
import { workerScripts } from "../Netscript/WorkerScripts";
import { WormSessionEvents } from "./WormEvents";
import { Settings } from "../Settings/Settings";
import { WormDataFactory, WormSession } from "./Automata";

export const currentWormSessions = new Map<number, WormSession>();
export const finishedWormSessions: WormSession[] = [];

export function createNewWormSession(pid: number): WormSession {
	const worm = Player.worm;
	if (worm === null) throw new Error("Tried to access worm. Worm is null.");

	const scriptRef = workerScripts.get(pid);
	if (scriptRef === undefined) throw new Error(`Tried to access script with pid #${pid}. No such script exists.`);

	const data = WormDataFactory(worm.completions);

	if (pid === -1) {
		return {
			data,
			startTime: Date.now(),
			finishTime: null,
			pid,
		};
	} else {
		return {
			data,
			startTime: Date.now(),
			finishTime: null,
			pid,
			host: scriptRef.hostname,
			script: scriptRef.name,
		};
	}
}

export function getWormSession(pid: number) {
	const session = currentWormSessions.get(pid);
	if (session !== undefined) return session;
	
	const newSession = createNewWormSession(pid);

	currentWormSessions.set(pid, newSession);
	WormSessionEvents.emit();

	return newSession;
}

export function endWormSession(pid: number) {
	const session = currentWormSessions.get(pid);
	if (session === undefined) return;

	session.finishTime = Date.now();

	currentWormSessions.delete(pid);
	pushToFinishedSessions(session);
	WormSessionEvents.emit();
}

export function pushToFinishedSessions(session: WormSession) {
	finishedWormSessions.push(session);
	if (finishedWormSessions.length > Settings.MaxRecentScriptsCapacity) {
		finishedWormSessions.splice(0, finishedWormSessions.length - Settings.MaxRecentScriptsCapacity);
	}
}

export function removeIdleWormSessions() {
	for (const sessionPid of currentWormSessions.keys()) {
		if (sessionPid !== -1 && !workerScripts.has(sessionPid)) { 
			endWormSession(sessionPid);
		}
	}
}