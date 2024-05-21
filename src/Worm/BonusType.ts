import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { Worm } from "./Worm";
import { formatPercent } from "../ui/formatNumber";

export interface BonusType {
  id: (typeof Bonus)[keyof typeof Bonus];
  name: string;
  description: string;

  // values describing effect increase
  a: number;
  g: number;
  k: number;
  m: number;
}

export interface BonusSpecialMults {
	gameTickSpeed: number;
	stockMarketMult: number;
	bladeburnerMult: number;
	intelligenceMult: number;
}

export const Bonus = {
  NONE: 0,

  CARDINAL_SIN: 1,
  FAVORABLE_APPEARANCE: 2,
  SYNTHETIC_BLACK_FRIDAY: 3,
  INCREASED_MAINFRAME_VOLTAGE: 4,
  RAPID_ASSIMILATION: 5,
  TEMPORAL_RESONATOR: 6,
  RECORDLESS_CONTRACTING: 7,
} as const;

export const bonuses: BonusType[] = [
  {
    id: Bonus.NONE,
    name: "None",
    description: "no benefit",
    a: 0,
    g: 0,
    k: 0,
    m: 0,
  },
  {
    id: Bonus.CARDINAL_SIN,
    name: "Cardinal sin",
    description: "Increases crime money and success rate by +$INC$",
    a: 1,
    g: 1.2,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.FAVORABLE_APPEARANCE,
    name: "Favorable appearance",
    description: "+$INC$ reputation from factions and companies",
    a: 1,
    g: 1.7,
    k: 0.005,
    m: 0.85,
  },
  {
    id: Bonus.SYNTHETIC_BLACK_FRIDAY,
    name: "Synthetic black friday",
    description: "-$DEC$ hacknet costs, purchased server costs, home ram and home core costs",
    a: 1,
    g: 0.6,
    k: 0.003,
    m: 1,
  },
  {
    id: Bonus.INCREASED_MAINFRAME_VOLTAGE,
    name: "Increased mainframe voltage",
    description: "+$INC$ game cycles per process",
    a: 1,
    g: 1.05,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.RAPID_ASSIMILATION,
    name: "Rapid assimilation",
    description: "Gain +$INC$ intelligence exp",
    a: 1,
    g: 1.1,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.TEMPORAL_RESONATOR,
    name: "Temporal resonator",
    description: "Reduces the time between stock market updates by $DEC$",
    a: 1,
    g: 0.8,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.RECORDLESS_CONTRACTING,
    name: "Recordless contracting",
    description: "Reduces the time needed to complete a bladeburner action by $DEC$",
    a: 1,
    g: 0.9,
    k: 0.007,
    m: 0.8,
  },
];

export const bonusMult = (effect: number): Record<(typeof Bonus)[keyof typeof Bonus], Partial<Multipliers> | null> => ({
  [Bonus.NONE]: {},
  [Bonus.CARDINAL_SIN]: {
		crime_money: effect,
		crime_success: effect,
	},
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
  [Bonus.INCREASED_MAINFRAME_VOLTAGE]: null,
  [Bonus.RAPID_ASSIMILATION]: null,
  [Bonus.TEMPORAL_RESONATOR]: null,
  [Bonus.RECORDLESS_CONTRACTING]: null,
});

export function applySpecialBonus(worm: Worm) {
  const mult = bonusMult(0)[worm.bonus.id];
  if (mult !== null) return;

  const effect = getBonusEffect(worm.bonus, worm.completions);

  switch (worm.bonus.id) {
		case Bonus.INCREASED_MAINFRAME_VOLTAGE: {
			worm.specialMults.gameTickSpeed = effect;
			break;
		}
		case Bonus.RAPID_ASSIMILATION: {
			worm.specialMults.intelligenceMult = effect;
			break;
		}
    case Bonus.TEMPORAL_RESONATOR: {
			worm.specialMults.stockMarketMult = effect;	
      break;
    }
		case Bonus.RECORDLESS_CONTRACTING: {
			worm.specialMults.bladeburnerMult = effect;
			break;
		}
    default:
      throw new Error(`Bonus #${worm.bonus.id} does not have a special implementation`);
  }
}

export function formatBonusDescription(effect: number, desc: string) {
  (desc = desc.replace("$INC$", formatPercent(effect - 1))),
    (desc = desc.replace("$DEC$", formatPercent(1 - effect))),
    (desc = desc.replace("$MUL$", formatPercent(effect)));
  return desc;
}

export const numberIsBonusValue = (n: number): n is (typeof Bonus)[keyof typeof Bonus] =>
  Object.values(Bonus).indexOf(n as (typeof Bonus)[keyof typeof Bonus]) !== -1;

export function getBonusEffect(data: BonusType, completions: number) {
  return effectFunction(completions, data.a, data.g, data.k, data.m);
}

export const effectFunction = (x: number, a: number, g: number, k: number, m: number) =>
  g + (a - g) * Math.exp(-1 * k * Math.pow(x, m));

export function getMultiplier(data: BonusType, completions: number): Multipliers | null {
  const mult = defaultMultipliers();
  const power = getBonusEffect(data, completions);
  const partial = bonusMult(power)[data.id];

  if (partial === null) return partial;

  return { ...mult, ...partial };
}
