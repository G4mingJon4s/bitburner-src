import { GlitchEnum } from "@enums";
import { Glitch } from "@nsdefs";

export const glitchMaxLvl: Record<Glitch, number> = {
  [GlitchEnum.Segmentation]: 10,
  [GlitchEnum.Roaming]: 10,
  [GlitchEnum.Encryption]: 7,
  [GlitchEnum.Magnetism]: 10,
  [GlitchEnum.Rust]: 10,
  [GlitchEnum.Friction]: 3,
  [GlitchEnum.Isolation]: 3,
  [GlitchEnum.Virtualization]: 3,
  [GlitchEnum.Jamming]: 3,
};

export const giltchMultCoefficients: Record<Glitch, number> = {
  [GlitchEnum.Segmentation]: 1,
  [GlitchEnum.Roaming]: 1,
  [GlitchEnum.Encryption]: 0.1,
  [GlitchEnum.Magnetism]: 0.2,
  [GlitchEnum.Rust]: 1,
  [GlitchEnum.Friction]: 0.2,
  [GlitchEnum.Isolation]: 0.2,
  [GlitchEnum.Virtualization]: 0.2,
  [GlitchEnum.Jamming]: 0.2,
};

// vulns mult by glitch lvl
export const glitchMult = (glitch: Glitch, lvl: number) => 1 + lvl * giltchMultCoefficients[glitch];

// move hinderance
export const frictionMult = (lvl: number) => Math.pow(2.5, lvl);

// transfer slow down
export const isolationMult = (lvl: number) => Math.pow(8, lvl);

// install/uninstall slow down
export const virtualizationMult = (lvl: number) => Math.pow(5, lvl);

// reduce slow down
export const jammingMult = (lvl: number) => Math.pow(2.5, lvl);

// energy loss
export const magnetismLoss = (lvl: number) => lvl;

// How often isocket/osocke move
export const roamingTime = (lvl: number) => 30000 * Math.pow(0.7, lvl);
