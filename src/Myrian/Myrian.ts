import { Device, DeviceType, DeviceID, Glitch } from "@nsdefs";
import { ComponentEnum, GlitchEnum } from "@enums";
import { glitchMult, roamingTime } from "./formulas/glitches";
import { isDeviceISocket, isDeviceOfType, pickOne } from "./utils";
import { componentTiers } from "./formulas/components";
import { NewBus, NewISocket, NewOSocket } from "./NewDevices";
import { processRoaming } from "./glitches/roaming";
import { processRust } from "./glitches/rust";
import { processSegmentation } from "./glitches/segmentation";
import { processBattery } from "./glitches/battery";

export interface Myrian {
  vulns: number;
  totalVulns: number;
  devices: Device[];
  glitches: Record<Glitch, number>;
  rust: Record<string, boolean>;
}

export const myrianSize = 12;

const defaultGlitches = Object.values(GlitchEnum).reduce((acc, g) => ({ ...acc, [g]: 0 }), {}) as Record<Glitch, number>;

export const myrian: Myrian = {
  vulns: 0,
  totalVulns: 0,
  devices: [],
  glitches: { ...defaultGlitches },
  rust: {},
};

let processes: (() => void)[] = [];
const processGlitch = (func: () => void, time: () => number): (() => void) => {
  let timeout = -1;
  const process = () => {
    func();
    timeout = Number(setTimeout(() => process(), time()));
  }
  setTimeout(() => process(), time());

  return () => clearTimeout(timeout);
};

export const initMyrian = () => {
  processes = [
    processGlitch(processBattery, () => 1000),
    processGlitch(processRoaming, () => roamingTime(myrian.glitches[GlitchEnum.Roaming])),
    processGlitch(processRust, () => 30000),
    processGlitch(processSegmentation, () => 30000)
  ];

  myrian.devices.forEach((d) => (d.isBusy = false));
  myrian.devices.filter(isDeviceISocket).forEach((d) => (d.content = Array.from({ length: d.upgrades.content }, () => d.emitting)));
};

export const inMyrianBounds = (x: number, y: number) => x >= 0 && x < myrianSize && y >= 0 && y < myrianSize;

export const findDevice = <T extends DeviceType | undefined = undefined>(id: DeviceID, type?: T): (
  T extends undefined ? Device : Extract<Device, { type: T }>
) | undefined => {
  const possible = myrian.devices.find(d => typeof id === "string" ? d.name === id : d.x === id[0] && d.y === id[1]);
  if (possible === undefined) return undefined;
  if (type === undefined) return possible as T extends undefined ? Device : never;
  return isDeviceOfType(possible, type) ? possible : undefined;
}

export const removeDevice = (id: DeviceID, type?: DeviceType) => {
  myrian.devices = myrian.devices.filter(
    (e) => !((typeof id === "string" ? e.name === id : e.x === id[0] && e.y === id[1]) && (!type || type === e.type)),
  );
};

export const getTotalGlitchMult = () =>
  Object.entries(myrian.glitches).reduce((acc, [glitch, lvl]) => {
    return acc * glitchMult(glitch as Glitch, lvl);
  }, 1);

export const getNextOSocketRequest = (tier: number) => {
  const potential = componentTiers.slice(0, tier + 1).flat();
  return new Array(Math.floor(Math.pow(Math.random() * tier, 0.75) + 1)).fill(null).map(() => pickOne(potential));
};

export const countDevices = (type: DeviceType) =>
  myrian.devices.reduce((acc, d) => (d.type === type ? acc + 1 : acc), 0);

export const resetMyrian = () => {
  myrian.vulns = 0;
  myrian.totalVulns = 0;
  myrian.devices = [];
  myrian.glitches = { ...defaultGlitches };
  myrian.rust = {};

  // clear all process timeouts
  processes.forEach(f => f());
  processes = [];

  NewBus("alice", Math.floor(myrianSize / 2), Math.floor(myrianSize / 2));

  NewISocket("isocket0", Math.floor(myrianSize / 4), 0, ComponentEnum.R0);
  NewISocket("isocket1", Math.floor(myrianSize / 2), 0, ComponentEnum.G0);
  NewISocket("isocket2", Math.floor((myrianSize * 3) / 4), 0, ComponentEnum.B0);

  NewOSocket("osocket0", Math.floor(myrianSize / 4), Math.floor(myrianSize - 1));
  NewOSocket("osocket1", Math.floor(myrianSize / 2), Math.floor(myrianSize - 1));
  NewOSocket("osocket2", Math.floor((myrianSize * 3) / 4), Math.floor(myrianSize - 1));
};
