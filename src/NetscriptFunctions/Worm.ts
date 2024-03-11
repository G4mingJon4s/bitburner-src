import { Player } from "@player";

import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Worm } from "../Worm/Worm";
import { bonuses } from "../Worm/BonusType";
import { getGuessTime } from "../Worm/calculations";
import { endWormSession, getWormSession } from "../Worm/WormSessions";

export function NetscriptWorm(): InternalAPI<IWorm> {
  function checkWormAPIAccess(ctx: NetscriptContext): void {
    if (Player.worm === null) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You have no access to the Worm API", "API ACCESS");
    }
  }

	function getWorm(): Worm {
		if (Player.worm === null) throw new Error("Cannot get worm. Player.worm is null");
		return Player.worm;
	}

  return {
		setBonus: (ctx) => (_bonus) => {
			checkWormAPIAccess(ctx);
			const bonus = helpers.number(ctx, "bonus", _bonus);
			const value = bonuses.find(b => b.id === bonus);
			if (value === undefined) throw new Error(`Value "${bonus}" is not a valid bonus. Valid: ${bonuses.map(d => d.id.toString()).join(", ")}`);
			getWorm().setBonus(value);
		},
		getCompletions: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return getWorm().completions;
		},
		getWormStates: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			return [...session.data.graph.states];
		},
		getWormSymbols: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			return [...session.data.graph.symbols];
		},
		getChosenValues: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			return { ...session.data.params };
		},
		getGuessTime: (ctx) => (_threads) => {
			checkWormAPIAccess(ctx);
			const threads = helpers.number(ctx, "threads", _threads);
			return getGuessTime(threads);
		},
		testInput: (ctx) => (_input) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const input = helpers.string(ctx, "input", _input);
			return helpers.netscriptDelay(ctx, getGuessTime(ctx.workerScript.scriptRef.threads)).then(() => {
				const finalState = getWorm().evaluate(session, input);
				if (finalState === null) throw new Error(`Error while computing input "${input}", got null.`);
				return Promise.resolve(finalState);
			});
		},
		attemptSolve: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const result = getWorm().solve(session);
			endWormSession(ctx.workerScript.pid);
			return result;
		},
		setDepthFirstSearchState: (ctx) => (_state) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const state = helpers.string(ctx, "state", _state);
			session.data.guess.dfsState = state;
		},
		setIsBipartite: (ctx) => (_bipartite) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const bipartite = helpers.boolean(ctx, "bipartite", _bipartite);
			session.data.guess.bipartite = bipartite;
		},
		setNodeIndegree: (ctx) => (_indegree) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const indegree = helpers.number(ctx, "indegree", _indegree);
			session.data.guess.indegree = indegree;
		},
		setNodeValue: (ctx) => (_value) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const value = helpers.number(ctx, "value", _value);
			session.data.guess.value = value;
		},
		setShortestPath: (ctx) => (_path) => {
			checkWormAPIAccess(ctx);
			const session = getWormSession(ctx.workerScript.pid);
			const path = helpers.string(ctx, "path", _path);
			session.data.guess.path = path;
		}
  }
}
