import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { AutomataData, AutomataFactory, evaluateInput, isValidInput } from "./Automata";
import { WormChosenValues } from "@nsdefs";

export class Worm {
	bonus: BonusType;
	data: AutomataData;
	userValues: WormChosenValues;
	providedValues: {
		path: string,
		bipartite: boolean,
		value: number,
		indegree: number,
		dfsState: string,
	}

	completions = 0;

	processCount = 0;

	constructor() {
		this.bonus = bonuses[0];

		[this.data, this.userValues] = AutomataFactory(this.completions);

		this.providedValues = {
			path: "",
			bipartite: false,
			value: 0,
			indegree: 0,
			dfsState: this.data.states[0]
		};
	}

	process(numCycles = 1) {
		this.updateMults();
		applySpecialBonus(this, numCycles);

		console.log(this);

		WormEvents.emit();
	}

	evaluate(input: string): string | null {
		if (!isValidInput(this.data, input)) return null;

		return evaluateInput(this.data, input);
	}

	isPathCorrect() {
		return this.providedValues.path.length === this.data.properties.shortestInput && this.evaluate(this.providedValues.path) === this.data.targetState;
	}

	isBipartiteCorrect() {
		return this.providedValues.bipartite === this.data.properties.isBipartite;
	}

	isNodeValueCorrect() {
		return this.providedValues.value === this.data.properties.nodeValues[this.userValues.value];
	}

	isNodeIndegreeCorrect() {
		return this.providedValues.indegree ===  this.data.properties.nodeIndegrees[this.userValues.indegree];
	}

	isDFSStateCorrect() {
		return this.providedValues.dfsState === this.data.properties.depthFirstSearchEnumeration[this.userValues.depthFirstSearchEnumeration];
	}
	
	solve()  {
		const comparisons = [
			this.isPathCorrect(),
			this.isBipartiteCorrect(),
			this.isNodeIndegreeCorrect(),
			this.isNodeValueCorrect(),
			this.isDFSStateCorrect()
		];

		[this.data, this.userValues] = AutomataFactory(this.completions);
		if (!this.isPathCorrect()) return 0;

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