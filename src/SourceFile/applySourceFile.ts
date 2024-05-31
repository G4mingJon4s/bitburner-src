import { SourceFiles } from "./SourceFiles";

import { Player } from "@player";

export function applySourceFile(bn: number, lvl: number): void {
  const srcFileKey = "SourceFile" + bn;
  const sourceFileObject = SourceFiles[srcFileKey];
  if (sourceFileObject == null) {
    console.error(`Invalid source file number: ${bn}`);
    return;
  }

  switch (bn) {
    case 1: {
      // The Source Genesis
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 16 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      const decMult = 1 / incMult;
      Player.mults.hacking_chance *= incMult;
      Player.mults.hacking_speed *= incMult;
      Player.mults.hacking_money *= incMult;
      Player.mults.hacking_grow *= incMult;
      Player.mults.hacking *= incMult;
      Player.mults.strength *= incMult;
      Player.mults.defense *= incMult;
      Player.mults.dexterity *= incMult;
      Player.mults.agility *= incMult;
      Player.mults.charisma *= incMult;
      Player.mults.hacking_exp *= incMult;
      Player.mults.strength_exp *= incMult;
      Player.mults.defense_exp *= incMult;
      Player.mults.dexterity_exp *= incMult;
      Player.mults.agility_exp *= incMult;
      Player.mults.charisma_exp *= incMult;
      Player.mults.company_rep *= incMult;
      Player.mults.faction_rep *= incMult;
      Player.mults.crime_money *= incMult;
      Player.mults.crime_success *= incMult;
      Player.mults.hacknet_node_money *= incMult;
      Player.mults.hacknet_node_purchase_cost *= decMult;
      Player.mults.hacknet_node_ram_cost *= decMult;
      Player.mults.hacknet_node_core_cost *= decMult;
      Player.mults.hacknet_node_level_cost *= decMult;
      Player.mults.work_money *= incMult;
      break;
    }
    case 2: {
      // Rise of the Underworld
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 24 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.crime_money *= incMult;
      Player.mults.crime_success *= incMult;
      Player.mults.charisma *= incMult;
      break;
    }
    case 3: {
      // Corporatocracy
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 8 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.charisma *= incMult;
      Player.mults.work_money *= incMult;
      break;
    }
    case 4: {
      // The Singularity
      // No effects, just gives access to Singularity functions
      break;
    }
    case 5: {
      // Artificial Intelligence
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 8 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.hacking_chance *= incMult;
      Player.mults.hacking_speed *= incMult;
      Player.mults.hacking_money *= incMult;
      Player.mults.hacking_grow *= incMult;
      Player.mults.hacking *= incMult;
      Player.mults.hacking_exp *= incMult;
      break;
    }
    case 6: {
      // Bladeburner
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 8 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.strength_exp *= incMult;
      Player.mults.defense_exp *= incMult;
      Player.mults.dexterity_exp *= incMult;
      Player.mults.agility_exp *= incMult;
      Player.mults.strength *= incMult;
      Player.mults.defense *= incMult;
      Player.mults.dexterity *= incMult;
      Player.mults.agility *= incMult;
      break;
    }
    case 7: {
      // Bladeburner 2079
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 8 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.bladeburner_max_stamina *= incMult;
      Player.mults.bladeburner_stamina_gain *= incMult;
      Player.mults.bladeburner_analysis *= incMult;
      Player.mults.bladeburner_success_chance *= incMult;
      break;
    }
    case 8: {
      // Ghost of Wall Street
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 12 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.hacking_grow *= incMult;
      break;
    }
    case 9: {
      // Hacktocracy
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 12 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      const decMult = 1 - mult / 100;
      Player.mults.hacknet_node_core_cost *= decMult;
      Player.mults.hacknet_node_level_cost *= decMult;
      Player.mults.hacknet_node_money *= incMult;
      Player.mults.hacknet_node_purchase_cost *= decMult;
      Player.mults.hacknet_node_ram_cost *= decMult;
      break;
    }
    case 10: {
      // Digital Carbon
      // No effects, just grants sleeves
      break;
    }
    case 11: {
      // The Big Crash
      let mult = 0;
      for (let i = 0; i < lvl; ++i) {
        mult += 32 / Math.pow(2, i);
      }
      const incMult = 1 + mult / 100;
      Player.mults.work_money *= incMult;
      Player.mults.company_rep *= incMult;
      break;
    }
    case 12: // The Recursion
      // Grants neuroflux.
      break;
    case 13: // They're Lunatics
      // Grants more space on Stanek's Gift.
      break;
    case 14: // IPvGO
      // Grands increased buffs and favor limit from IPvGO
      break;
    case 16: // The Worm
      // Grants more Worm Sessions and increases coding contract spawn rate
      break;
    default:
      console.error(`Invalid source file number: ${bn}`);
      break;
  }

  sourceFileObject.owned = true;
}
