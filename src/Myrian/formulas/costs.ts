import { DeviceType } from "@nsdefs";
import { DeviceTypeEnum } from "@enums";

// parameters for a exponential formula, a^(b*X+c)+d
type ExponentialFormulaParams = [number, number, number, number];

// Parameters for a cost that shouldn't be available. Such as upgrading the max energy of a isocket.
const NA: ExponentialFormulaParams = [Infinity, Infinity, Infinity, Infinity];

type DeviceScale = Record<DeviceType, ExponentialFormulaParams>;

// Default scale for each device type, helps simplify code.
const defaultScale = Object.keys(DeviceTypeEnum).reduce((acc, type) => ({ ...acc, [type]: NA }), {}) as DeviceScale;

// Exponential formula, a^(b*X+c)+d
const exp = (p: ExponentialFormulaParams, x: number): number => Math.pow(p[0], p[1] * x + p[2]) + p[3];

// Wrap exp with a specific scale for each device type.
const makeExpFunction = (p: Partial<DeviceScale>) => {
  const scale = { ...defaultScale, ...p };
  return (type: DeviceType, x: number) => exp(scale[type], x);
};

export const upgradeMaxContentCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [8, 0.5, 2, 0],
  [DeviceTypeEnum.ISocket]: [4, 1, 5, 0],
  [DeviceTypeEnum.Reducer]: [256, 1, -3, 512],
  [DeviceTypeEnum.Cache]: [1.2, 10, 0, 63],
});

export const upgradeTierCost = makeExpFunction({
  [DeviceTypeEnum.Reducer]: [1.5, 1, 2, 0],
  [DeviceTypeEnum.Battery]: [2, 1, 3, 0],
});

export const upgradeEmissionCost = makeExpFunction({
  [DeviceTypeEnum.ISocket]: [2, 1, 3, 0],
});

export const upgradeMoveLvlCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [2, 1, 3, 0],
});

export const upgradeTransferLvlCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [2, 1, 3, 0],
});

export const upgradeReduceLvlCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [2, 1, 3, 0],
});

export const upgradeInstallLvlCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [2, 1, 3, 0],
});

export const upgradeMaxEnergyCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [1.1, 1, -8, 16],
  [DeviceTypeEnum.Battery]: [1.1, 1, -16, 8],
});

export const installDeviceCost = makeExpFunction({
  [DeviceTypeEnum.Bus]: [4, 0.5, 2, 0],
  [DeviceTypeEnum.ISocket]: [2, 1, 4, 0],
  [DeviceTypeEnum.OSocket]: [4, 1, 3, 0],
  [DeviceTypeEnum.Reducer]: [5, 0.5, 1, 0],
  [DeviceTypeEnum.Cache]: [1.2, 5, 0, 18],
  [DeviceTypeEnum.Battery]: [1.2, 10, 0, 63],
});
