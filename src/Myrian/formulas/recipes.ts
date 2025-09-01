import { Component, Recipe } from "@nsdefs";
import { ComponentEnum } from "@enums";

const make = (input: Component[], output: Component): Recipe => ({ input, output });

export const Tier1Recipes: Recipe[] = [
  make([ComponentEnum.R0, ComponentEnum.R0], ComponentEnum.R1),
  make([ComponentEnum.G0, ComponentEnum.G0], ComponentEnum.G1),
  make([ComponentEnum.B0, ComponentEnum.B0], ComponentEnum.B1),

  make([ComponentEnum.R0, ComponentEnum.G0], ComponentEnum.Y1),
  make([ComponentEnum.G0, ComponentEnum.B0], ComponentEnum.C1),
  make([ComponentEnum.B0, ComponentEnum.R0], ComponentEnum.M1),
];

export const Tier2Recipes: Recipe[] = [
  make([ComponentEnum.R1, ComponentEnum.R1], ComponentEnum.R2),
  make([ComponentEnum.G1, ComponentEnum.G1], ComponentEnum.G2),
  make([ComponentEnum.B1, ComponentEnum.B1], ComponentEnum.B2),

  make([ComponentEnum.R1, ComponentEnum.G1], ComponentEnum.Y2),
  make([ComponentEnum.G1, ComponentEnum.B1], ComponentEnum.C2),
  make([ComponentEnum.B1, ComponentEnum.R1], ComponentEnum.M2),

  make([ComponentEnum.Y1, ComponentEnum.C1, ComponentEnum.M1], ComponentEnum.W2),
];

export const Tier3Recipes: Recipe[] = [
  make([ComponentEnum.R2, ComponentEnum.R2], ComponentEnum.R3),
  make([ComponentEnum.G2, ComponentEnum.G2], ComponentEnum.G3),
  make([ComponentEnum.B2, ComponentEnum.B2], ComponentEnum.B3),

  make([ComponentEnum.R2, ComponentEnum.G2], ComponentEnum.Y3),
  make([ComponentEnum.G2, ComponentEnum.B2], ComponentEnum.C3),
  make([ComponentEnum.B2, ComponentEnum.R2], ComponentEnum.M3),

  make([ComponentEnum.Y2, ComponentEnum.C2, ComponentEnum.M2], ComponentEnum.W3),
];

export const Tier4Recipes: Recipe[] = [
  make([ComponentEnum.R3, ComponentEnum.R3], ComponentEnum.R4),
  make([ComponentEnum.G3, ComponentEnum.G3], ComponentEnum.G4),
  make([ComponentEnum.B3, ComponentEnum.B3], ComponentEnum.B4),

  make([ComponentEnum.R3, ComponentEnum.G3], ComponentEnum.Y4),
  make([ComponentEnum.G3, ComponentEnum.B3], ComponentEnum.C4),
  make([ComponentEnum.B3, ComponentEnum.R3], ComponentEnum.M4),

  make([ComponentEnum.Y3, ComponentEnum.C3, ComponentEnum.M3], ComponentEnum.W4),
];

export const Tier5Recipes: Recipe[] = [
  make([ComponentEnum.R4, ComponentEnum.R4], ComponentEnum.R5),
  make([ComponentEnum.G4, ComponentEnum.G4], ComponentEnum.G5),
  make([ComponentEnum.B4, ComponentEnum.B4], ComponentEnum.B5),

  make([ComponentEnum.R4, ComponentEnum.G4], ComponentEnum.Y5),
  make([ComponentEnum.G4, ComponentEnum.B4], ComponentEnum.C5),
  make([ComponentEnum.B4, ComponentEnum.R4], ComponentEnum.M5),

  make([ComponentEnum.Y4, ComponentEnum.C4, ComponentEnum.M4], ComponentEnum.W5),
];

export const Tier6Recipes: Recipe[] = [
  make([ComponentEnum.R5, ComponentEnum.G5], ComponentEnum.Y6),
  make([ComponentEnum.G5, ComponentEnum.B5], ComponentEnum.C6),
  make([ComponentEnum.B5, ComponentEnum.R5], ComponentEnum.M6),

  make([ComponentEnum.Y5, ComponentEnum.C5, ComponentEnum.M5], ComponentEnum.W6),
];

export const Tier7Recipes: Recipe[] = [make([ComponentEnum.Y6, ComponentEnum.C6, ComponentEnum.M6], ComponentEnum.W7)];

export const recipes: Recipe[][] = [
  [],
  Tier1Recipes,
  Tier2Recipes,
  Tier3Recipes,
  Tier4Recipes,
  Tier5Recipes,
  Tier6Recipes,
  Tier7Recipes,
];
