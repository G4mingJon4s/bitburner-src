import { Device, MyrianUpgrade } from "@nsdefs";
import { myrian } from "./Myrian";
import { upgradeCosts } from "./formulas/costs";

export function getDeviceUpgradeCost(device: Device, upgrade: MyrianUpgrade): number | undefined {
  if (!(upgrade in device.upgrades)) return undefined;

  const cur: number = device.upgrades[upgrade as keyof typeof device.upgrades];
  return upgradeCosts[upgrade](device.type, cur);
}

export function upgradeDevice(device: Device, upgrade: MyrianUpgrade): boolean {
  if (!(upgrade in device.upgrades)) return false;

  const cost = getDeviceUpgradeCost(device, upgrade);
  if (cost === undefined || myrian.vulns < cost) return false;

  myrian.vulns -= cost;
  device.upgrades[upgrade as keyof typeof device.upgrades]++;

  return true;
}