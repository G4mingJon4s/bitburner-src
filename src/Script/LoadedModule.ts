import { CLIBuilder } from "../CLI/CLIBuilder";
import type { NSFull } from "../NetscriptFunctions";
import type { AutocompleteData, CLI, ScriptArg } from "@nsdefs";

// The object portion of this type is not runtime information, it's only to ensure type validation
// And make it harder to overwrite a url with a random non-url string.
export type ScriptURL = string & { __type: "ScriptURL" };

export interface ScriptModule {
  main?: (ns: NSFull, ...args: ScriptArg[]) => unknown;
  autocomplete?: (data: AutocompleteData, flags: string[]) => unknown;
  cli?: (builder: CLIBuilder) => CLI;
}

export class LoadedModule {
  url: ScriptURL;
  module: Promise<ScriptModule>;

  constructor(url: ScriptURL, module: Promise<ScriptModule>) {
    this.url = url;
    this.module = module;
  }
}
