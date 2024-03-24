/** Augmentation-related methods for the Player class (PlayerObject) */
import { Multipliers } from "@nsdefs";
import { calculateEntropy } from "../Grafting/EntropyAccumulation";
import { staneksGift } from "../../CotMG/Helper";
import { updateGoMults } from "../../Go/effects/effect";

import type { PlayerObject } from "./PlayerObject";
import { updateWormMults } from "../../Worm/calculations";

export function applyEntropy(this: PlayerObject, stacks = 1): Multipliers {
  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  const entropyMults = calculateEntropy(stacks);
  this.mults = entropyMults;
  staneksGift.updateMults();
  updateGoMults();
  updateWormMults();

	return entropyMults;
}
