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
    content: [],
    maxContent: 1,

    moveLvl: 0,
    transferLvl: 0,
    reduceLvl: 0,
    installLvl: 0,
    energy: 16,
    maxEnergy: 16,
  };
  myrian.devices.push(bus);
};

export const NewCache = (name: string, x: number, y: number) => {
  const cache: Cache = {
    name,
    type: DeviceTypeEnum.Cache,
    isBusy: false,
    content: [],
    maxContent: 1,
    x,
    y,
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
    content: [],
    maxContent: 2,
    tier: 1,
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
    emissionLvl: 0,
    cooldownUntil: 0,
    content: [emitting],
    maxContent: 1,
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
    content: [],
    maxContent: 1,
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
    tier: 0,
    energy: 64,
    maxEnergy: 64,
  };
  myrian.devices.push(battery);
};
