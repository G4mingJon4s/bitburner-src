import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { removeIdleWormSessions } from "./WormSession";

export class Worm {
	bonus: BonusType;
	completions = 0;

	constructor() {
		this.bonus = bonuses[0];
	}

	process(numCycles = 1) {
		this.updateMults(numCycles);

		removeIdleWormSessions();

		WormEvents.emit();
	}

	updateMults(numCycles: number) {
		Player.reapplyMultipliers();
		applySpecialBonus(this, numCycles);
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