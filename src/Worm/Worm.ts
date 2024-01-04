import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { AutomataSession, evaluateInput } from "./Automata";
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

	evaluate(session: AutomataSession, input: string): string | null {
		return evaluateInput(session.data, input);
	}

	isPathCorrect(session: AutomataSession) {
		return session.guess.path.length === session.data.properties.shortestInput && this.evaluate(session, session.guess.path) === session.data.targetState;
	}

	isBipartiteCorrect(session: AutomataSession) {
		return session.guess.bipartite === session.data.properties.isBipartite;
	}

	isNodeValueCorrect(session: AutomataSession) {
		return session.guess.value === session.data.properties.nodeValues[session.params.value];
	}

	isNodeIndegreeCorrect(session: AutomataSession) {
		return session.guess.indegree ===  session.data.properties.nodeIndegrees[session.params.indegree];
	}

	isDFSStateCorrect(session: AutomataSession) {
		return session.guess.dfsState === session.data.properties.depthFirstSearchEnumeration[session.params.depthFirstSearchEnumeration];
	}
	
	solve(session: AutomataSession)  {
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

		session.done = true;

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