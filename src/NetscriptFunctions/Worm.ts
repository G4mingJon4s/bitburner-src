import { Player } from "@player";

import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Worm } from "../Worm/Worm";
import { calculateFitness } from "../Worm/helpers/calculations";

export function NetscriptWorm(): InternalAPI<IWorm> {
  function checkWormAPIAccess(ctx: NetscriptContext): void {
    if (Player.worm === null) {
      throw helpers.makeRuntimeErrorMsg(ctx, "No access to worm api");
    }
  }

	function getWorm(): Worm {
		if (Player.worm === null) throw new Error("Cannot get worm. Player.worm is null");
		return Player.worm;
	}

  return {
		getLength: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return getWorm().length;
		},
		getCurrentFitness: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return calculateFitness(getWorm());
		},
		setGuess: (ctx) => (_guess) => {
			checkWormAPIAccess(ctx);
			const guess = helpers.array(ctx, "guess", _guess, helpers.number);
			getWorm().setGuess(guess);
			return calculateFitness(getWorm());
		},
		getCurrentGuess: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const guess = getWorm().guess;
			return guess;
		}
  }
}
