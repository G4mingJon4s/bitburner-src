import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusSpecialMults, BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { removeIdleWormSessions } from "./WormSession";
import { updateWormMults } from "./calculations";

export class Worm {
  bonus: BonusType;
  completions = 0;

	specialMults: BonusSpecialMults = {
		gameTickSpeed: 1,
		stockMarketMult: 1,
		bladeburnerMult: 1,
		intelligenceMult: 1,
	}

  constructor() {
    this.bonus = bonuses[0];
  }

	resetSpecialMults() {
		this.specialMults.gameTickSpeed = 1;
		this.specialMults.stockMarketMult = 1;
		this.specialMults.bladeburnerMult = 1;
		this.specialMults.intelligenceMult = 1;
	}

  process() {
    this.updateMults();

    removeIdleWormSessions();

    WormEvents.emit();
  }

  updateMults() {
		this.resetSpecialMults();
    updateWormMults();
    applySpecialBonus(this);
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("Worm", this);
  }

  static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;
