import { Player } from "@player";
import { Multipliers, defaultMultipliers, mergeMultipliers, scaleMultipliers } from "../PersonObjects/Multipliers";
import { Augmentations } from "../Augmentation/Augmentations";
import { Worm } from "./Worm";
import { Growths } from "../Bladeburner/data/Growths";
import { BladeburnerConstants } from "../Bladeburner/data/Constants";
import { formatPercent } from "../ui/formatNumber";

export interface BonusType {
	id: typeof Bonus[keyof typeof Bonus];
	name: string;
	description: string;

	// values describing effect increase
	a: number;
	g: number;
	k: number;
	m: number;
}

export const Bonus = {
	NONE: 0,

	CARDINAL_SIN: 1,
	FAVORABLE_APPEARANCE: 2,
	SYNTHETIC_BLACK_FRIDAY: 3,
	INCREASED_MAINFRAME_VOLTAGE: 4,
	RAPID_ASSIMILATION: 5,
	TEMPORAL_RESONATOR: 6,
	RECORDLESS_CONTRACTING: 7
} as const;

export const bonuses: BonusType[] = [
	{
		id: Bonus.NONE,
		name: "None",
		description: "no benefit",
		a: 0,
		g: 0,
		k: 0,
		m: 0
	},{
		id: Bonus.CARDINAL_SIN,
		name: "Cardinal sin",
		description: "+$INC$ crime impact on karma",
		a: 1,
		g: 3,
		k: 0.1,
		m: 0.5
	},{
		id: Bonus.FAVORABLE_APPEARANCE,
		name: "Favorable appearance",
		description: "+$INC$ reputation from factions and companies",
		a: 1,
		g: 3.5,
		k: 0.07,
		m: 0.5
	},{
		id: Bonus.SYNTHETIC_BLACK_FRIDAY,
		name: "Synthetic black friday",
		description: "-$DEC$ hacknet costs, purchased server costs, home ram and home core costs",
		a: 1,
		g: 0.1,
		k: 0.003,
		m: 1,
	},{
		id: Bonus.INCREASED_MAINFRAME_VOLTAGE,
		name: "Increased mainframe voltage",
		description: "+$INC$ game cycles per process",
		a: 1,
		g: 2,
		k: 0.027,
		m: 0.5
	},{
		id: Bonus.RAPID_ASSIMILATION,
		name: "Rapid assimilation",
		description: "Applies queued augmentations immediately. $MUL$ queued augmentation effect",
		a: 0,
		g: 1,
		k: 0.1,
		m: 0.45
	},{
		id: Bonus.TEMPORAL_RESONATOR,
		name: "Temporal resonator",
		description: "Transfers $MUL$ cycles of the worm to all sleeves",
		a: 0,
		g: 1.5,
		k: 0.07,
		m: 0.5
	},{
		id: Bonus.RECORDLESS_CONTRACTING,
		name: "Recordless contracting",
		description: "Generates an additional $MUL$ bladeburner contracts and operations",
		a: 0,
		g: 1,
		k: 0.06,
		m: 0.5
	}
];

export const bonusMult = (effect: number): Record<typeof Bonus[keyof typeof Bonus], Partial<Multipliers> | null> => ({
	[Bonus.NONE]: {},
	[Bonus.CARDINAL_SIN]: { crime_karma_impact: effect },
	[Bonus.FAVORABLE_APPEARANCE]: { faction_rep: effect, company_rep: effect },
	[Bonus.SYNTHETIC_BLACK_FRIDAY]: {
		hacknet_node_core_cost: effect,
		hacknet_node_level_cost: effect,
		hacknet_node_purchase_cost: effect,
		hacknet_node_ram_cost: effect,

		server_cost: effect,
		home_ram_cost: effect,
		home_core_cost: effect,
	},
	[Bonus.INCREASED_MAINFRAME_VOLTAGE]: { game_tick_speed: effect },
	[Bonus.RAPID_ASSIMILATION]: (() => {
		let mults = defaultMultipliers();
		for (const queued of Player.queuedAugmentations) mults = mergeMultipliers(mults, Augmentations[queued.name].mults);
		return scaleMultipliers(mults, effect);
	})(),
	[Bonus.TEMPORAL_RESONATOR]: null,
	[Bonus.RECORDLESS_CONTRACTING]: null,
});

export function applySpecialBonus(worm: Worm, numCycles = 1) {
	const mult = bonusMult(0)[worm.bonus.id];
	if (mult !== null) return;

	const effect = getBonusEffect(worm.bonus, worm.completions);

	switch (worm.bonus.id) {
		case Bonus.TEMPORAL_RESONATOR: {
			for (const sleeve of Player.sleeves) sleeve.storedCycles += numCycles * effect;
			break;
		}
		case Bonus.RECORDLESS_CONTRACTING: {
			if (Player.bladeburner === null) return;

			// Count increase for contracts/operations
			for (const contract of Object.values(Player.bladeburner.contracts)) {
				const growthF = Growths[contract.name];
				if (growthF === undefined) throw new Error(`growth formula for action '${contract.name}' is undefined`);

				contract.count += (numCycles / BladeburnerConstants.CyclesPerSecond) * growthF() * effect / BladeburnerConstants.ActionCountGrowthPeriod;
			}
			for (const op of Object.values(Player.bladeburner.operations)) {
				const growthF = Growths[op.name];
				if (growthF === undefined) throw new Error(`growth formula for action '${op.name}' is undefined`);
				op.count += (numCycles / BladeburnerConstants.CyclesPerSecond) * growthF() * effect / BladeburnerConstants.ActionCountGrowthPeriod;
			}
			break;
		}
		default: throw new Error(`Bonus #${worm.bonus.id} does not have a special implementation`);
	}
}

export function formatBonusDescription(effect: number, desc: string) {
	desc = desc.replace("$INC$", formatPercent(effect - 1)),
	desc = desc.replace("$DEC$", formatPercent(1 - effect)),
	desc = desc.replace("$MUL$", formatPercent(effect));
	return desc;
}

export const numberIsBonusValue = (n: number): n is typeof Bonus[keyof typeof Bonus] => Object.values(Bonus).indexOf(n as typeof Bonus[keyof typeof Bonus]) !== -1;

export function getBonusEffect(data: BonusType, completions: number) {
	return effectFunction(completions, data.a, data.g, data.k, data.m);
}

export const effectFunction = (x: number, a: number, g: number, k: number, m: number) => g + (a - g) * Math.exp(-1 * k * Math.pow(x, m));

export function getMultiplier(data: BonusType, completions: number): Multipliers | null {
	const mult = defaultMultipliers();
	const power = getBonusEffect(data, completions);
	const partial = bonusMult(power)[data.id];

	if (partial === null) return partial;

	return { ...mult, ...partial };
}