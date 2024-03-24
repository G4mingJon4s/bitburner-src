/** Augmentation-related methods for the Player class (PlayerObject) */
import { staneksGift } from "../../CotMG/Helper";
import { updateGoMults } from "../../Go/effects/effect";
import { calculateEntropy } from "../Grafting/EntropyAccumulation";

import { updateWormMults } from "../../Worm/calculations";
import type { PlayerObject } from "./PlayerObject";

export function applyEntropy(this: PlayerObject, stacks = 1): void {
  // Re-apply all multipliers
  this.reapplyAllAugmentations();
  this.reapplyAllSourceFiles();

  const entropyMults = calculateEntropy(stacks);
  this.mults = entropyMults;
  staneksGift.updateMults();
  updateGoMults();
  updateWormMults();
}
