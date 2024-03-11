import { Player } from "@player";
import { AutomataFactory, AutomataSession } from "./Automata";
import { workerScripts } from "../Netscript/WorkerScripts";
import { WormSessionEvents } from "./WormEvents";
import { Settings } from "../Settings/Settings";

export const wormSessions = new Map<number, AutomataSession>();
export const wormPreviousSessions: (AutomataSession & { pid: number })[] = [];

export function getWormSession(pid: number) {
	const session = wormSessions.get(pid);
	if (session !== undefined) return session;
	
	const worm = Player.worm;
	if (worm === null) throw new Error("Tried to access worm. Worm is null.");
	const newSession = AutomataFactory(worm.completions);
	wormSessions.set(pid, newSession);
	WormSessionEvents.emit();

	return newSession;
}

export function endWormSession(pid: number) {
	const session = wormSessions.get(pid);
	if (session === undefined) return;
	session.finishTime = Date.now();
	wormSessions.delete(pid);
	pushPreviousSessions({ ...session, pid });
	WormSessionEvents.emit();
}

export function pushPreviousSessions(session: AutomataSession & { pid: number }) {
	wormPreviousSessions.push(session);
	if (wormPreviousSessions.length > Settings.MaxRecentScriptsCapacity) {
		wormPreviousSessions.splice(0, wormPreviousSessions.length - Settings.MaxRecentScriptsCapacity);
	}
}

export function removeIdleWormSessions() {
	const activePids = Array.from(workerScripts.keys());
	for (const sessionPid of wormSessions.keys()) {
		if (sessionPid !== -1 && !activePids.includes(sessionPid)) {
			endWormSession(sessionPid);
		}
	}
}