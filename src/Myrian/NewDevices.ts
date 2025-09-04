import { Battery, Bus, Cache, Component, ISocket, Lock, OSocket, Reducer } from "@nsdefs";
import { DeviceTypeEnum } from "@enums";
import { myrian } from "./Myrian";
import { getNextOSocketRequest } from "./Myrian";

export const NewBus = (name: string, x: number, y: number) => {
  const bus: Bus = {
    name,
    type: DeviceTypeEnum.Bus,
    isBusy: false,
    x,
    y,

    upgrades: {
      content: 1,
      energy: 16,
      install: 0,
      movement: 0,
      reduce: 0,
      transfer: 0,
    },

    content: [],
    energy: 16,
  };
  myrian.devices.push(bus);
};

export const NewCache = (name: string, x: number, y: number) => {
  const cache: Cache = {
    name,
    type: DeviceTypeEnum.Cache,
    isBusy: false,
    x,
    y,

    upgrades: {
      content: 1,
    },

    content: [],
  };
  myrian.devices.push(cache);
  return cache;
};

export const NewReducer = (name: string, x: number, y: number) => {
  const reducer: Reducer = {
    name,
    type: DeviceTypeEnum.Reducer,
    isBusy: false,
    x,
    y,

    upgrades: {
      content: 2,
      tier: 1,
    },

    content: [],
  };
  myrian.devices.push(reducer);
  return reducer;
};

export const NewISocket = (name: string, x: number, y: number, emitting: Component) => {
  const isocket: ISocket = {
    name,
    type: DeviceTypeEnum.ISocket,
    isBusy: false,
    x,
    y,

    emitting: emitting,
    cooldownUntil: 0,

    upgrades: {
      content: 1,
      emission: 0,
    },

    content: [emitting],
  };
  myrian.devices.push(isocket);
};

export const NewOSocket = (name: string, x: number, y: number) => {
  const osocket: OSocket = {
    name,
    type: DeviceTypeEnum.OSocket,
    isBusy: false,
    x,
    y,

    currentRequest: getNextOSocketRequest(0),

    upgrades: {
      content: 1,
    },

    content: [],
  };
  myrian.devices.push(osocket);
  return osocket;
};

export const NewLock = (name: string, x: number, y: number) => {
  const lock: Lock = {
    name,
    type: DeviceTypeEnum.Lock,
    isBusy: false,
    x,
    y,

    upgrades: {},
  };
  myrian.devices.push(lock);
  return lock;
};

export const NewBattery = (name: string, x: number, y: number) => {
  const battery: Battery = {
    name,
    type: DeviceTypeEnum.Battery,
    isBusy: false,
    x,
    y,

    upgrades: {
      energy: 64,
      tier: 1,
    },

    energy: 64,
  };
  myrian.devices.push(battery);
};
