import { Bus } from "@nsdefs";
import { GlitchEnum } from "@enums";
import { myrian, myrianSize } from "../Myrian";
import { pickOne } from "../utils";

export const processRust = () => {
  myrian.rust = {};
  const rust = myrian.glitches[GlitchEnum.Rust];
  for (let i = 0; i < rust * 3; i++) {
    const x = Math.floor(Math.random() * myrianSize);
    const y = Math.floor(Math.random() * myrianSize);
    myrian.rust[`${x}:${y}`] = true;
  }
};

const rustableUpgrades: (keyof Bus["upgrades"])[] = ["movement", "transfer", "reduce", "install", "energy"];

export const rustBus = (bus: Bus, rust: number) => {
  const possibleRustableUpgrades = rustableUpgrades.filter(u => bus.upgrades[u] > 0);
  const chosenUpgrade = pickOne(possibleRustableUpgrades);
  bus.upgrades[chosenUpgrade] = Math.max(0, bus.upgrades[chosenUpgrade] - rust * 0.1);
  bus.energy = Math.min(bus.energy, bus.upgrades.energy);
};