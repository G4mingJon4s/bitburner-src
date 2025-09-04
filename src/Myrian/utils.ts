import {
  Component,
  Device,
  Bus,
  ISocket,
  OSocket,
  Reducer,
  Cache,
  Lock,
  Battery,
  DeviceType,
  ContainerDevice,
  EnergyDevice,
} from "@nsdefs";
import { ComponentEnum, DeviceTypeEnum } from "@enums";

export const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const distance = (a: Device, b: Device) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const distanceCoord2D = (a: Device, coord: [number, number]) =>
  Math.abs(a.x - coord[0]) + Math.abs(a.y - coord[1]);

export const adjacent = (a: Device, b: Device) => distance(a, b) === 1;
export const adjacentCoord2D = (a: Device, coord: [number, number]) => distanceCoord2D(a, coord) === 1;

export type ComponentMap = Partial<Record<Component, number>>;
export const makeComponentMap = (content: Component[]) =>
  content.reduce((acc, c) => ({ ...acc, [c]: (acc[c] ?? 0) + 1 }), {} as ComponentMap);

export const compareComponentMap = (a: ComponentMap, b: ComponentMap, cmp = (a: number, b: number) => a === b, strict = true) => {
  const aKeys = Object.keys(a) as Component[];
  const bKeys = Object.keys(b) as Component[];

  if (strict && (aKeys.length !== bKeys.length || aKeys.some((k) => !(k in b)))) return false;
  return aKeys.every((k) => cmp(a[k] ?? 0, b[k] ?? 0));
};

export const inventoryMatches = (a: Component[], b: Component[]) => compareComponentMap(
  makeComponentMap(a),
  makeComponentMap(b)
);

const vulnsMap: Record<Component, number> = {
  // tier 0
  [ComponentEnum.R0]: 1,
  [ComponentEnum.G0]: 1,
  [ComponentEnum.B0]: 1,

  // tier 1
  [ComponentEnum.R1]: 4,
  [ComponentEnum.G1]: 4,
  [ComponentEnum.B1]: 4,

  [ComponentEnum.Y1]: 4,
  [ComponentEnum.C1]: 4,
  [ComponentEnum.M1]: 4,

  // tier 2
  [ComponentEnum.R2]: 16,
  [ComponentEnum.G2]: 16,
  [ComponentEnum.B2]: 16,

  [ComponentEnum.Y2]: 16,
  [ComponentEnum.C2]: 16,
  [ComponentEnum.M2]: 16,

  [ComponentEnum.W2]: 16,

  // tier 3
  [ComponentEnum.R3]: 64,
  [ComponentEnum.G3]: 64,
  [ComponentEnum.B3]: 64,

  [ComponentEnum.Y3]: 64,
  [ComponentEnum.C3]: 64,
  [ComponentEnum.M3]: 64,

  [ComponentEnum.W3]: 64,

  // tier 4
  [ComponentEnum.R4]: 256,
  [ComponentEnum.G4]: 256,
  [ComponentEnum.B4]: 256,

  [ComponentEnum.Y4]: 256,
  [ComponentEnum.C4]: 256,
  [ComponentEnum.M4]: 256,

  [ComponentEnum.W4]: 256,

  // tier 5
  [ComponentEnum.R5]: 1024,
  [ComponentEnum.G5]: 1024,
  [ComponentEnum.B5]: 1024,

  [ComponentEnum.Y5]: 1024,
  [ComponentEnum.C5]: 1024,
  [ComponentEnum.M5]: 1024,

  [ComponentEnum.W5]: 1024,

  // tier 6
  [ComponentEnum.Y6]: 4096,
  [ComponentEnum.C6]: 4096,
  [ComponentEnum.M6]: 4096,

  [ComponentEnum.W6]: 4096,

  // tier 7
  [ComponentEnum.W7]: 16384,
};

export const contentVulnsValue = (content: Component[]) => content.map((i) => vulnsMap[i]).reduce((a, b) => a + b, 0);

export const hasContainer = (device: Device): device is ContainerDevice => (
  device.type === DeviceTypeEnum.Bus ||
  device.type === DeviceTypeEnum.Cache ||
  device.type === DeviceTypeEnum.ISocket ||
  device.type === DeviceTypeEnum.OSocket ||
  device.type === DeviceTypeEnum.Reducer
);

export const hasEnergy = (device: Device): device is EnergyDevice => (
  device.type === DeviceTypeEnum.Bus ||
  device.type === DeviceTypeEnum.Battery
);

export const isDeviceOfType = <T extends DeviceType>(device: Device, type: T): device is Extract<Device, T> => (
  device.type === type
);

export const isDeviceBus = (d: Device): d is Bus => d.type === DeviceTypeEnum.Bus;
export const isDeviceISocket = (d: Device): d is ISocket => d.type === DeviceTypeEnum.ISocket;
export const isDeviceOSocket = (d: Device): d is OSocket => d.type === DeviceTypeEnum.OSocket;
export const isDeviceReducer = (d: Device): d is Reducer => d.type === DeviceTypeEnum.Reducer;
export const isDeviceCache = (d: Device): d is Cache => d.type === DeviceTypeEnum.Cache;
export const isDeviceLock = (d: Device): d is Lock => d.type === DeviceTypeEnum.Lock;
export const isDeviceBattery = (d: Device): d is Battery => d.type === DeviceTypeEnum.Battery;