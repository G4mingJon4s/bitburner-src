import { APIBreakInfo } from "./APIBreak";

export const breakInfos300: APIBreakInfo[] = [
  {
    brokenFunctions: ["ns.formatNumber", "ns.formatRam", "ns.formatPercent", "ns.tFormat"],
    info:
      "The formatting functions have been moved to their own interface, ns.format.\n" +
      "Additionally, the naming of ns.tFormat has been changed to ns.format.time.",
  },
  {
    brokenFunctions: ["ns.nFormat"],
    info: "The ns.nFormat function has been removed. Use ns.format.number instead.",
  },
];
