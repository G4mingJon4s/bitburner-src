import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { canAccessWorm, worm, Worm } from "../Worm/Worm";
import { bonuses } from "../Worm/BonusType";
import { getWormGuessTime, WORM_MAX_SESSIONS } from "../Worm/calculations";
import { currentWormSessions, getWormSession, isWormOnCreateCooldown, isWormOnSolveCooldown, WormSession } from "../Worm/WormSession";

export function NetscriptWorm(): InternalAPI<IWorm> {
  function checkWormAPIAccess(ctx: NetscriptContext): void {
    if (!canAccessWorm()) {
      throw helpers.errorMessage(ctx, "You have no access to the Worm API", "API ACCESS");
    }
  }

  function getWorm(): Worm {
    if (worm === null) throw new Error("Cannot get worm. worm is null");
    return worm;
  }

	function getSession(ctx: NetscriptContext, identifier: number): WormSession {
		const session = getWormSession(identifier);
		if (session === null) throw helpers.errorMessage(ctx, `Cannot find Worm Session with identifier '${identifier}'.`);
		return session;
	}

  return {
    setBonus: (ctx) => (_bonus) => {
      checkWormAPIAccess(ctx);
      const bonus = helpers.number(ctx, "bonus", _bonus);
      const value = bonuses.find((b) => b.id === bonus);
      if (value === undefined)
        throw new Error(
          `Value "${bonus}" is not a valid bonus. Valid: ${bonuses.map((d) => d.id.toString()).join(", ")}`,
        );
      getWorm().bonus = value;
    },
    getCompletions: (ctx) => () => {
      checkWormAPIAccess(ctx);
      return getWorm().completions;
    },
		getUnsolvedSessions: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const currentSessions = Array.from(currentWormSessions.values());
			return currentSessions.map(s => s.identifier);
		},
		createNewSession: (ctx) => () => {
			checkWormAPIAccess(ctx);
			if (isWormOnCreateCooldown()) return null;
			if (currentWormSessions.size >= WORM_MAX_SESSIONS) return null;
			const session = new WormSession(getWorm());
			return session.identifier;
		},
    getWormStates: (ctx) => (_sessionIdentifier) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return [...session.graph.states];
    },
    getWormSymbols: (ctx) => (_sessionIdentifier) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return [...session.graph.symbols];
    },
    getChosenValues: (ctx) => (_sessionIdentifier) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      return { ...session.params };
    },
    getGuessTime: (ctx) => (_threads) => {
      checkWormAPIAccess(ctx);
      const threads = helpers.number(ctx, "threads", _threads);
      return getWormGuessTime(threads);
    },
    testInput: (ctx) => (_sessionIdentifier, _input) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const input = helpers.string(ctx, "input", _input);
      return helpers.netscriptDelay(ctx, getWormGuessTime(ctx.workerScript.scriptRef.threads)).then(() => {
        const finalState = session.evaluate(input);
        return Promise.resolve(finalState);
      });
    },
    attemptSolve: (ctx) => (_sessionIdentifier) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      if (isWormOnSolveCooldown()) throw helpers.errorMessage(ctx, "Cannot solve worm. The server is on cooldown.");
      return session.solve();
    },
    setDepthFirstSearchState: (ctx) => (_sessionIdentifier, _state) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const state = helpers.string(ctx, "state", _state);
      session.guess.dfsState = state;
    },
    setIsBipartite: (ctx) => (_sessionIdentifier, _bipartite) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const bipartite = helpers.boolean(ctx, "bipartite", _bipartite);
      session.guess.bipartite = bipartite;
    },
    setNodeIndegree: (ctx) => (_sessionIdentifier, _indegree) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const indegree = helpers.number(ctx, "indegree", _indegree);
      session.guess.indegree = indegree;
    },
    setNodeValue: (ctx) => (_sessionIdentifier, _value) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const value = helpers.number(ctx, "value", _value);
      session.guess.value = value;
    },
    setShortestPath: (ctx) => (_sessionIdentifier, _path) => {
			const sessionIdentifier = helpers.number(ctx, "session", _sessionIdentifier);
      checkWormAPIAccess(ctx);
      const session = getSession(ctx, sessionIdentifier);
      const path = helpers.string(ctx, "path", _path);
      session.guess.path = path;
    },
  };
}
