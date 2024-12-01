import { myrian } from "../Myrian";
import { isDeviceBattery } from "../utils";

export const processBattery = () => {
  myrian.devices.forEach((device) => {
    if (!isDeviceBattery(device)) return;
    const up = Math.pow(2, device.tier + 1);
    device.energy = Math.min(device.energy + up, device.maxEnergy);
  });
};