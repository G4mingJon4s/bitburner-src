import { ComponentEnum } from "@enums";
import { Component } from "@nsdefs";

export const componentTiers: Component[][] = [
  [ComponentEnum.R0, ComponentEnum.G0, ComponentEnum.B0],
  [ComponentEnum.R1, ComponentEnum.G1, ComponentEnum.B1, ComponentEnum.Y1, ComponentEnum.C1, ComponentEnum.M1],
  [ComponentEnum.R2, ComponentEnum.G2, ComponentEnum.B2, ComponentEnum.Y2, ComponentEnum.C2, ComponentEnum.M2, ComponentEnum.W2],
  [ComponentEnum.R3, ComponentEnum.G3, ComponentEnum.B3, ComponentEnum.Y3, ComponentEnum.C3, ComponentEnum.M3, ComponentEnum.W3],
  [ComponentEnum.R4, ComponentEnum.G4, ComponentEnum.B4, ComponentEnum.Y4, ComponentEnum.C4, ComponentEnum.M4, ComponentEnum.W4],
  [ComponentEnum.R5, ComponentEnum.G5, ComponentEnum.B5, ComponentEnum.Y5, ComponentEnum.C5, ComponentEnum.M5, ComponentEnum.W5],
  [ComponentEnum.Y6, ComponentEnum.C6, ComponentEnum.M6, ComponentEnum.W6],
  [ComponentEnum.W7],
];
