import { InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import {
  findDevice,
  inMyrianBounds,
  removeDevice,
  getTotalGlitchMult,
  getNextOSocketRequest,
  countDevices,
  resetMyrian,
  myrian,
  myrianSize,
} from "../Myrian/Myrian";
import {
  installDeviceCost,
  upgradeEmissionCost,
  upgradeInstallLvlCost,
  upgradeMaxEnergyCost,
  upgradeMoveLvlCost,
  upgradeReduceLvlCost,
  upgradeTierCost,
  upgradeTransferLvlCost,
  upgradeMaxContentCost,
} from "../Myrian/formulas/costs";
import { recipes } from "../Myrian/formulas/recipes";
import { componentTiers } from "../Myrian/formulas/components";
import {
  frictionMult,
  glitchMaxLvl,
  glitchMult,
  isolationMult,
  jammingMult,
  magnetismLoss,
  virtualizationMult,
} from "../Myrian/formulas/glitches";
import {
  adjacent,
  adjacentCoord2D,
  compareComponentMap,
  contentVulnsValue,
  extendsContainerDevice,
  inventoryMatches,
  isDeviceBus,
  isDeviceContainer,
  isDeviceISocket,
  isDeviceOSocket,
  isDeviceTiered,
  isEmittingDevice,
  isEnergyDevice,
  isInstallingDevice,
  isMovingDevice,
  isReducingDevice,
  isTransferingDevice,
  makeComponentMap,
  pickOne,
} from "../Myrian/utils";
import { installSpeed, emissionSpeed, moveSpeed, reduceSpeed, transferSpeed } from "../Myrian/formulas/speed";
import { NewBattery, NewBus, NewCache, NewISocket, NewLock, NewOSocket, NewReducer } from "../Myrian/NewDevices";
import { rustBus } from "../Myrian/glitches/rust";
import { Bus, Myrian as IMyrian, Reducer, Battery, ISocket, DeviceType, Component } from "@nsdefs";
import { DeviceTypeEnum, GlitchEnum } from "@enums";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptMyrian(): InternalAPI<IMyrian> {
  return {
    DEUBG_RESET: () => resetMyrian,
    DEBUG_GIVE_VULNS: (ctx) => (_amount) => {
      const amount = helpers.number(ctx, "amount", _amount);
      myrian.vulns += amount;
    },
    getDevice: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const device = findDevice(id);
      if (!device) return;
      return structuredClone(device);
    },
    getDevices: (__ctx) => () => structuredClone(myrian.devices),
    getVulns: () => () => myrian.vulns,
    renameDevice: (ctx) => (_id, _name) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const name = helpers.string(ctx, "name", _name);
      const device = findDevice(id);
      if (!device) return false;
      if (findDevice(name)) return false;
      device.name = name;
      return true;
    },
    moveBus:
      (ctx) =>
        async (_bus, _coord): Promise<boolean> => {
          const busID = helpers.string(ctx, "bus", _bus);
          const [x, y] = helpers.coord2d(ctx, "coord", _coord);

          const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
          if (!bus) {
            helpers.log(ctx, () => `bus does not exist`);
            return Promise.resolve(false);
          }

          if (!adjacentCoord2D(bus, [x, y])) {
            helpers.log(ctx, () => `bus ${busID} is not adjacent to [${x}, ${y}]`);
            return Promise.resolve(false);
          }
          if (!inMyrianBounds(x, y)) {
            helpers.log(ctx, () => `[${x}, ${y}] is out of bounds`);
            return Promise.resolve(false);
          }

          if (findDevice([x, y])) {
            helpers.log(ctx, () => `[${x}, ${y}] is occupied`);
            return Promise.resolve(false);
          }

          if (bus.isBusy) {
            helpers.log(ctx, () => `bus ${busID} is busy`);
            return Promise.resolve(false);
          }

          const outOfEnergy = bus.energy === 0 ? 10 : 1;

          bus.isBusy = true;
          return helpers
            .netscriptDelay(
              ctx,
              moveSpeed(bus.moveLvl) * frictionMult(myrian.glitches[GlitchEnum.Friction]) * outOfEnergy,
              true,
            )
            .then(() => {
              bus.isBusy = false;
              bus.energy = Math.max(0, bus.energy - magnetismLoss(myrian.glitches[GlitchEnum.Magnetism]));
              if (findDevice([x, y])) {
                helpers.log(ctx, () => `[${x}, ${y}] is occupied`);
                return Promise.resolve(false);
              }
              bus.x = x;
              bus.y = y;
              if (myrian.rust[`${x}:${y}`]) rustBus(bus, myrian.glitches[GlitchEnum.Rust]);
              return Promise.resolve(true);
            })
            .finally(() => {
              bus.isBusy = false;
            });
        },
    formatContent: (ctx) => (_device) => {
      const deviceID = helpers.deviceID(ctx, "device", _device);

      const device = findDevice(deviceID);
      if (!device) {
        helpers.log(ctx, () => `device ${deviceID} not found`);
        return false;
      }

      if (!isDeviceContainer(device)) {
        helpers.log(ctx, () => `device ${deviceID} is not a container`);
        return false;
      }

      device.content = [];

      if (isDeviceISocket(device)) {
        const cooldown = emissionSpeed(device.emissionLvl);
        device.cooldownUntil = Date.now() + cooldown;
        setTimeout(() => {
          device.content = new Array<Component>(device.maxContent).fill(device.emitting);
        }, cooldown);
      }

      return true;
    },
    transfer:
      (ctx) =>
        async (_from, _to, _input, _output): Promise<boolean> => {
          const fromID = helpers.deviceID(ctx, "from", _from);
          const toID = helpers.deviceID(ctx, "to", _to);
          const input = _input as Component[];
          const output = (_output ?? []) as Component[];

          const fromDevice = findDevice(fromID);
          if (!fromDevice) {
            helpers.log(ctx, () => `device ${fromID} not found`);
            return Promise.resolve(false);
          }

          if (!extendsContainerDevice(fromDevice)) {
            helpers.log(ctx, () => `device ${fromID} is not a container`);
            return Promise.resolve(false);
          }

          const toDevice = findDevice(toID);
          if (!toDevice) {
            helpers.log(ctx, () => `device ${toID} not found`);
            return Promise.resolve(false);
          }

          if (!extendsContainerDevice(toDevice)) {
            helpers.log(ctx, () => `device ${toID} is not a container`);
            return Promise.resolve(false);
          }

          if (!adjacent(fromDevice, toDevice)) {
            helpers.log(ctx, () => "entities are not adjacent");
            return Promise.resolve(false);
          }

          const devices = [fromDevice, toDevice];
          const busIndex = devices.findIndex(d => isDeviceBus(d));

          if (busIndex === -1) {
            helpers.log(ctx, () => "neither device is a bus");
            return Promise.resolve(false);
          }

          const bus = devices[busIndex] as Bus;
          const container = devices[busIndex === 0 ? 1 : 0];

          let transferLvl = bus.transferLvl;
          if (isDeviceBus(container)) transferLvl = Math.min(transferLvl, container.transferLvl);

          const fromFinalSize = fromDevice.content.length - input.length + output.length;
          const toFinalSize = toDevice.content.length - output.length + input.length;
          if (fromFinalSize > fromDevice.maxContent || toFinalSize > toDevice.maxContent) {
            helpers.log(ctx, () => "not enough space in one of the containers");
            return Promise.resolve(false);
          }
          if (fromDevice.isBusy || toDevice.isBusy) {
            helpers.log(ctx, () => "one of the entities is busy");
            return Promise.resolve(false);
          }

          const fromContentMap = makeComponentMap(fromDevice.content);
          const toContentMap = makeComponentMap(toDevice.content);
          const inputContentMap = makeComponentMap(input);
          const outputContentMap = makeComponentMap(output);

          const fromHas = compareComponentMap(fromContentMap, inputContentMap, (a, b) => a >= b, false);
          const toHas = compareComponentMap(toContentMap, outputContentMap, (a, b) => a >= b, false);

          if (!fromHas || !toHas) {
            helpers.log(ctx, () => "one of the entities does not have the items");
            return Promise.resolve(false);
          }

          fromDevice.isBusy = true;
          toDevice.isBusy = true;

          return helpers
            .netscriptDelay(ctx, transferSpeed(transferLvl) * isolationMult(myrian.glitches[GlitchEnum.Isolation]), true)
            .then(() => {
              const previousSize = container.content.length;

              (Object.keys(inputContentMap) as Component[]).forEach((k) => {
                fromContentMap[k] = (fromContentMap[k] ?? 0) - (inputContentMap[k] ?? 0);
                toContentMap[k] = (toContentMap[k] ?? 0) + (inputContentMap[k] ?? 0);
              });
              (Object.keys(outputContentMap) as Component[]).forEach((k) => {
                toContentMap[k] = (toContentMap[k] ?? 0) - (outputContentMap[k] ?? 0);
                fromContentMap[k] = (fromContentMap[k] ?? 0) + (outputContentMap[k] ?? 0);
              });
              toDevice.content = (Object.keys(toContentMap) as Component[])
                .map((k) => new Array<Component>(toContentMap[k] ?? 0).fill(k))
                .flat();

              fromDevice.content = (Object.keys(fromContentMap) as Component[])
                .map((k) => new Array<Component>(fromContentMap[k] ?? 0).fill(k))
                .flat();

              if (isDeviceISocket(container) && previousSize > container.content.length) {
                const cooldown = emissionSpeed(container.emissionLvl);
                container.cooldownUntil = Date.now() + cooldown;
                setTimeout(() => {
                  container.content = new Array<Component>(container.maxContent).fill(container.emitting);
                }, cooldown);
              }
              if (isDeviceOSocket(container) && inventoryMatches(container.currentRequest, container.content)) {
                const gain = contentVulnsValue(container.content) * getTotalGlitchMult();
                myrian.vulns += gain;
                myrian.totalVulns += gain;
                container.content = [];
                const request = getNextOSocketRequest(myrian.glitches[GlitchEnum.Encryption]);
                container.currentRequest = request;
                container.maxContent = request.length;
              }
              return Promise.resolve(true);
            })
            .finally(() => {
              fromDevice.isBusy = false;
              toDevice.isBusy = false;
            });
        },
    reduce:
      (ctx) =>
        async (_busID, _reducerID): Promise<boolean> => {
          const busID = helpers.deviceID(ctx, "bus", _busID);
          const reducerID = helpers.deviceID(ctx, "reducer", _reducerID);

          const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
          if (!bus) {
            helpers.log(ctx, () => `bus ${busID} not found`);
            return Promise.resolve(false);
          }

          const reducer = findDevice(reducerID, DeviceTypeEnum.Reducer) as Reducer;
          if (!reducer) {
            helpers.log(ctx, () => `reducer ${reducerID} not found`);
            return Promise.resolve(false);
          }

          if (!adjacent(bus, reducer)) {
            helpers.log(ctx, () => "entites are not adjacent");
            return Promise.resolve(false);
          }

          const recipe = recipes[reducer.tier].find((r) => inventoryMatches(r.input, reducer.content));

          if (!recipe) {
            helpers.log(ctx, () => "reducer content matches no recipe");
            return Promise.resolve(false);
          }

          if (bus.isBusy || reducer.isBusy) {
            helpers.log(ctx, () => "bus or reducer is busy");
            return Promise.resolve(false);
          }

          bus.isBusy = true;
          reducer.isBusy = true;
          return helpers
            .netscriptDelay(ctx, reduceSpeed(bus.reduceLvl) * jammingMult(myrian.glitches[GlitchEnum.Jamming]), true)
            .then(() => {
              reducer.content = [recipe.output];
              return Promise.resolve(true);
            })
            .finally(() => {
              bus.isBusy = false;
              reducer.isBusy = false;
            });
        },
    tweakISocket: (ctx) => async (_bus, _isocket, _component) => {
      const busID = helpers.deviceID(ctx, "bus", _bus);
      const isocketID = helpers.deviceID(ctx, "isocket", _isocket);
      const component = getEnumHelper("ComponentEnum").nsGetMember(ctx, _component, "component");

      if (!componentTiers[0].includes(component)) {
        helpers.log(ctx, () => `component ${component} is not a valid component`);
        return Promise.resolve(false);
      }

      const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(false);
      }
      const isocket = findDevice(isocketID, DeviceTypeEnum.ISocket) as ISocket;
      if (!isocket) {
        helpers.log(ctx, () => `isocket ${isocketID} not found`);
        return Promise.resolve(false);
      }

      if (!adjacent(bus, isocket)) {
        helpers.log(ctx, () => "bus and isocket are not adjacent");
        return Promise.resolve(false);
      }

      bus.isBusy = true;
      isocket.isBusy = true;

      return helpers
        .netscriptDelay(
          ctx,
          installSpeed(bus.installLvl) * virtualizationMult(myrian.glitches[GlitchEnum.Virtualization]),
          true,
        )
        .then(() => {
          isocket.emitting = component;
          isocket.content = [];
          const cooldown = emissionSpeed(isocket.emissionLvl);
          isocket.cooldownUntil = Date.now() + cooldown;
          setTimeout(() => {
            isocket.content = new Array<Component>(isocket.maxContent).fill(isocket.emitting);
          }, cooldown);
          return Promise.resolve(true);
        })
        .finally(() => {
          bus.isBusy = false;
          isocket.isBusy = false;
        });
    },
    energize: (ctx) => async (_bus, _battery) => {
      const busID = helpers.deviceID(ctx, "bus", _bus);
      const batteryID = helpers.deviceID(ctx, "battery", _battery);

      const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(-1);
      }

      const battery = findDevice(batteryID, DeviceTypeEnum.Battery) as Battery;
      if (!battery) {
        helpers.log(ctx, () => `battery ${batteryID} not found`);
        return Promise.resolve(-1);
      }

      const transfer = Math.min(battery.energy, bus.maxEnergy - bus.energy);
      bus.isBusy = true;
      battery.isBusy = true;

      return helpers
        .netscriptDelay(ctx, 100 * transfer, true)
        .then(() => {
          bus.energy += transfer;
          battery.energy -= transfer;
          return Promise.resolve(transfer);
        })
        .finally(() => {
          bus.isBusy = false;
          battery.isBusy = false;
        });
    },
    upgradeMaxContent: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const container = findDevice(id);
      if (!container) {
        helpers.log(ctx, () => `device ${id} not found`);
        return false;
      }

      if (!isDeviceContainer(container)) {
        helpers.log(ctx, () => `device ${id} is not a container`);
        return false;
      }

      const cost = upgradeMaxContentCost(container.type, container.maxContent);
      if (myrian.vulns < cost) {
        helpers.log(ctx, () => `not enough vulns to upgrade container`);
        return false;
      }

      myrian.vulns -= cost;
      container.maxContent++;

      return true;
    },

    getUpgradeMaxContentCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "id", _id);
      const container = findDevice(id);
      if (!container) {
        helpers.log(ctx, () => `container ${id} not found`);
        return -1;
      }

      if (!isDeviceContainer(container)) {
        helpers.log(ctx, () => `device ${id} is not a container`);
        return -1;
      }

      return upgradeMaxContentCost(container.type, container.maxContent);
    },

    getDeviceCost: (ctx) => (_type) => {
      const type = getEnumHelper("DeviceTypeEnum").nsGetMember(ctx, _type, "type");
      return installDeviceCost(type as DeviceType, countDevices(type as DeviceType));
    },

    installDevice: (ctx) => async (_bus, _name, _coord, _deviceType) => {
      const busID = helpers.deviceID(ctx, "bus", _bus);
      const name = helpers.string(ctx, "name", _name);
      const [x, y] = helpers.coord2d(ctx, "coord", _coord);
      const deviceType = getEnumHelper("DeviceTypeEnum").nsGetMember(ctx, _deviceType, "deviceType");

      const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(false);
      }

      if (findDevice(name)) {
        helpers.log(ctx, () => `device ${name} already exists`);
        return Promise.resolve(false);
      }

      const placedDevice = findDevice([x, y]);
      if (placedDevice) {
        helpers.log(ctx, () => `location [${x}, ${y}] is occupied`);
        return Promise.resolve(false);
      }

      if (bus.isBusy) {
        helpers.log(ctx, () => `bus ${busID} is busy`);
        return Promise.resolve(false);
      }

      const cost = installDeviceCost(deviceType, countDevices(deviceType));
      if (myrian.vulns < cost) {
        helpers.log(ctx, () => `not enough vulns to install device`);
        return Promise.resolve(false);
      }

      myrian.vulns -= cost;

      if (deviceType === DeviceTypeEnum.ISocket && y !== 0) {
        helpers.log(ctx, () => `ISocket must be placed on the top row`);
        return Promise.resolve(false);
      }

      if (deviceType === DeviceTypeEnum.OSocket && y !== myrianSize - 1) {
        helpers.log(ctx, () => `OSocket must be placed on the bottom row`);
        return Promise.resolve(false);
      }

      bus.isBusy = true;
      const lockName = `lock-${busID}`;
      const lock = NewLock(lockName, x, y);
      lock.isBusy = true;
      return helpers
        .netscriptDelay(
          ctx,
          installSpeed(bus.installLvl) * virtualizationMult(myrian.glitches[GlitchEnum.Virtualization]),
          true,
        )
        .then(() => {
          bus.isBusy = false;
          removeDevice(lockName);
          switch (deviceType) {
            case DeviceTypeEnum.Bus: {
              NewBus(name, x, y);
              break;
            }
            case DeviceTypeEnum.ISocket: {
              NewISocket(name, x, y, pickOne(componentTiers[0]));
              break;
            }
            case DeviceTypeEnum.OSocket: {
              NewOSocket(name, x, y);
              break;
            }
            case DeviceTypeEnum.Reducer: {
              NewReducer(name, x, y);
              break;
            }
            case DeviceTypeEnum.Cache: {
              NewCache(name, x, y);
              break;
            }
            case DeviceTypeEnum.Battery: {
              NewBattery(name, x, y);
              break;
            }
          }
          return Promise.resolve(true);
        })
        .finally(() => {
          bus.isBusy = false;
        });
    },
    uninstallDevice: (ctx) => async (_bus, _coord) => {
      const busID = helpers.string(ctx, "bus", _bus);
      const [x, y] = helpers.coord2d(ctx, "coord", _coord);

      const bus = findDevice(busID, DeviceTypeEnum.Bus) as Bus;
      if (!bus) {
        helpers.log(ctx, () => `bus ${busID} not found`);
        return Promise.resolve(false);
      }

      const placedDevice = findDevice([x, y]);
      if (!placedDevice) {
        helpers.log(ctx, () => `location [${x}, ${y}] is empty`);
        return Promise.resolve(false);
      }

      if (bus.isBusy || placedDevice.isBusy) {
        helpers.log(ctx, () => `bus or device is busy`);
        return Promise.resolve(false);
      }

      bus.isBusy = true;
      placedDevice.isBusy = true;
      return helpers
        .netscriptDelay(
          ctx,
          installSpeed(bus.installLvl) * virtualizationMult(myrian.glitches[GlitchEnum.Virtualization]),
          true,
        )
        .then(() => {
          bus.isBusy = false;
          placedDevice.isBusy = false;
          removeDevice([x, y]);
          return Promise.resolve(true);
        })
        .finally(() => {
          bus.isBusy = false;
          placedDevice.isBusy = false;
        });
    },
    getUpgradeTierCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isDeviceTiered(device)) return -1;
      return upgradeTierCost(device.type, device.tier);
    },
    upgradeTier: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isDeviceTiered(device)) return false;
      const cost = upgradeTierCost(device.type, device.tier);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.tier++;
      return true;
    },
    getUpgradeEmissionLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isEmittingDevice(device)) return -1;
      return upgradeEmissionCost(device.type, device.emissionLvl);
    },
    upgradeEmissionLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isEmittingDevice(device)) return false;
      const cost = upgradeEmissionCost(device.type, device.emissionLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.emissionLvl++;
      return true;
    },
    getUpgradeMoveLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isMovingDevice(device)) return -1;
      return upgradeMoveLvlCost(device.type, device.moveLvl);
    },
    upgradeMoveLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isMovingDevice(device)) return false;
      const cost = upgradeMoveLvlCost(device.type, device.moveLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.moveLvl++;
      return true;
    },
    getUpgradeTransferLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isTransferingDevice(device)) return -1;
      return upgradeTransferLvlCost(device.type, device.transferLvl);
    },
    upgradeTransferLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isTransferingDevice(device)) return false;
      const cost = upgradeTransferLvlCost(device.type, device.transferLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.transferLvl++;
      return true;
    },
    getUpgradeReduceLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isReducingDevice(device)) return -1;
      return upgradeReduceLvlCost(device.type, device.reduceLvl);
    },
    upgradeReduceLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isReducingDevice(device)) return false;
      const cost = upgradeReduceLvlCost(device.type, device.reduceLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.reduceLvl++;
      return true;
    },
    getUpgradeInstallLvlCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isInstallingDevice(device)) return -1;
      return upgradeInstallLvlCost(device.type, device.installLvl);
    },
    upgradeInstallLvl: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isInstallingDevice(device)) return false;
      const cost = upgradeInstallLvlCost(device.type, device.installLvl);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.installLvl++;
      return true;
    },
    getUpgradeMaxEnergyCost: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return -1;
      if (!isEnergyDevice(device)) return -1;
      return upgradeMaxEnergyCost(device.type, device.maxEnergy);
    },
    upgradeMaxEnergy: (ctx) => (_id) => {
      const id = helpers.deviceID(ctx, "device", _id);
      const device = findDevice(id);
      if (!device) return false;
      if (!isEnergyDevice(device)) return false;
      const cost = upgradeMaxEnergyCost(device.type, device.maxEnergy);
      if (myrian.vulns < cost) return false;
      myrian.vulns -= cost;
      device.maxEnergy++;
      return true;
    },
    setGlitchLvl: (ctx) => async (_glitch, _lvl) => {
      const glitch = getEnumHelper("GlitchEnum").nsGetMember(ctx, _glitch, "glitch");
      const lvl = helpers.number(ctx, "lvl", _lvl);
      if (lvl < 0 || lvl > glitchMaxLvl[glitch]) return Promise.resolve();
      const currentLvl = myrian.glitches[glitch];
      return helpers.netscriptDelay(ctx, Math.abs(lvl - currentLvl) * 5000, true).then(() => {
        myrian.glitches[glitch] = lvl;
      });
    },
    getGlitchLvl: (ctx) => (_glitch) => {
      const glitch = getEnumHelper("GlitchEnum").nsGetMember(ctx, _glitch, "glitch");
      return myrian.glitches[glitch];
    },
    getGlitchMaxLvl: (ctx) => (_glitch) => {
      const glitch = getEnumHelper("GlitchEnum").nsGetMember(ctx, _glitch, "glitch");
      return glitchMaxLvl[glitch];
    },
    getGlitchMult: (ctx) => (_glitch) => {
      const glitch = getEnumHelper("GlitchEnum").nsGetMember(ctx, _glitch, "glitch");
      return glitchMult(glitch, myrian.glitches[glitch]);
    },
    getTotalGlitchMult: () => () => getTotalGlitchMult(),
  };
}
