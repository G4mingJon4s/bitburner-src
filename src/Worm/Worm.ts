import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { WormSession, evaluateInput } from "./Automata";
import { removeIdleWormSessions } from "./WormSessions";

export class Worm {
	bonus: BonusType;
	completions = 0;

	constructor() {
		this.bonus = bonuses[0];
	}

	process(numCycles = 1) {
		this.updateMults();
		applySpecialBonus(this, numCycles);

		removeIdleWormSessions();

		WormEvents.emit();
	}

	evaluate(session: WormSession, input: string): string | null {
		return evaluateInput(session.data.graph, input);
	}

	isPathCorrect(session: WormSession) {
		return session.data.guess.path.length === session.data.graph.properties.pathLength && this.evaluate(session, session.data.guess.path) === session.data.graph.targetState;
	}

	isBipartiteCorrect(session: WormSession) {
		return session.data.guess.bipartite === session.data.graph.properties.bipartite;
	}

	isNodeValueCorrect(session: WormSession) {
		return session.data.guess.value === session.data.graph.properties.values[session.data.params.value];
	}

	isNodeIndegreeCorrect(session: WormSession) {
		return session.data.guess.indegree ===  session.data.graph.properties.indegrees[session.data.params.indegree];
	}

	isDFSStateCorrect(session: WormSession) {
		return session.data.guess.dfsState === session.data.graph.properties.dfsOrder[session.data.params.dfsOrder];
	}
	
	solve(session: WormSession)  {
		session.finishTime = Date.now();

		const comparisons = [
			this.isPathCorrect(session),
			this.isBipartiteCorrect(session),
			this.isNodeIndegreeCorrect(session),
			this.isNodeValueCorrect(session),
			this.isDFSStateCorrect(session)
		];

		if (!this.isPathCorrect(session)) return 0;

		const amountCorrect = comparisons.filter(b => b).length;

		const rewardValue = amountCorrect / comparisons.length;
		this.completions += rewardValue;

		return rewardValue;
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setBonus(bonus: BonusType) {
		this.bonus = bonus;
	}

	toJSON(): IReviverValue {
		return Generic_toJSON("Worm", this);
	}

	static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;