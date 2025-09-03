import { Device } from "@nsdefs";
import { Myrian, myrian } from "./Myrian";

const isMyrianShape = (value: unknown): value is Myrian => (
  typeof value === "object" &&
  value !== null &&
  Object.hasOwn(value, "vulns") &&
  Object.hasOwn(value, "totalVulns") &&
  Object.hasOwn(value, "devices") &&
  Object.hasOwn(value, "glitches") &&
  Object.hasOwn(value, "rust")
);

const isDevicesShape = (value: unknown): value is Device[] => (
  Array.isArray(value) &&
  value.every((entry: unknown) => (
    typeof entry === "object" &&
    entry !== null &&
    Object.hasOwn(entry, "name") &&
    Object.hasOwn(entry, "type") &&
    Object.hasOwn(entry, "x") &&
    Object.hasOwn(entry, "y") &&
    Object.hasOwn(entry, "isBusy")
  ))
);

export function loadMyrian(data: unknown): boolean {
  function showError(error: unknown): boolean {
    console.warn("Encountered the following issue while loading Myrian savedata:");
    console.error(error);
    console.warn("Savedata:");
    console.error(data);
    return false;
  }

  if (!data) return showError("There was no myrian savedata");
  if (typeof data !== "string") return showError("Savedata was not a string");
  let parsedData;

  try {
    parsedData = JSON.parse(data) as unknown;
  } catch (e) {
    return showError(`Cannot JSON.parse the savedata: ${e}`);
  }

  if (!parsedData || typeof parsedData !== "object") return showError("Parsed savedata was not an object");
  if (!isMyrianShape(parsedData)) return showError("Parsed savedata is malformed");
  if (!isDevicesShape(parsedData.devices)) return showError("Parsed devices savedata is malformed");

  myrian.vulns = parsedData.vulns;
  myrian.totalVulns = parsedData.totalVulns;
  myrian.devices = parsedData.devices;
  myrian.glitches = parsedData.glitches;
  myrian.rust = parsedData.rust;

  return true;
}