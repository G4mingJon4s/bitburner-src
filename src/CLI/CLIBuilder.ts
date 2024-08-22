import {
  CLIArgumentData,
  CLICommand,
  CLICommandBuilder as NSCLICommandBuilder,
  CLIOptionData,
  NS,
  CLIProgram,
} from "@nsdefs";
import { CLICommandBuilder } from "./CLICommandBuilder";

export class CLIBuilder<
  Options extends Record<string, string | number | boolean>,
  Arguments extends (string | number | boolean)[],
> {
  private name: string | null = null;
  private description: string | null = null;
  private version: string | null = null;
  private options: CLIOptionData[] = [];
  private arguments: CLIArgumentData[] = [];
  private commands: CLICommand[] = [];
  private action:
    | ((ns: NS, args: (string | number | boolean)[], opts: Record<string, string | number | boolean>) => Promise<void>)
    | null = null;

  private script: string;
  constructor(script: string) {
    this.script = script;
  }

  addCommand(callback: (builder: NSCLICommandBuilder) => CLICommand): CLIBuilder<Options, Arguments> {
    this.commands.push(callback(new CLICommandBuilder() as unknown as NSCLICommandBuilder));
    return this;
  }

  addName(name: string): CLIBuilder<Options, Arguments> {
    this.name = name;
    return this;
  }

  addDescription(description: string): CLIBuilder<Options, Arguments> {
    this.description = description;
    return this;
  }

  addVersion(version: string): CLIBuilder<Options, Arguments> {
    this.version = version;
    return this;
  }

  addOption<Rep extends string, Type extends "string" | "number" | "boolean">(
    rep: Rep,
    type: Type,
    description?: string,
    required?: boolean,
  ): CLIBuilder<
    Options & { [K in Rep[0]]: Type extends "string" ? string : Type extends "number" ? number : boolean },
    Arguments
  > {
    this.options.push({
      rep: rep,
      type: type,
      description: description,
      required: required,
    });
    return this;
  }

  addArgument<Type extends "string" | "number" | "boolean">(
    name: string,
    type: Type,
    description?: string,
  ): CLIBuilder<Options, [...Arguments, Type extends "string" ? string : Type extends "number" ? number : boolean]> {
    this.arguments.push({
      name: name,
      type: type,
      description: description,
    });
    return this;
  }

  addAction(
    callback: (
      ns: NS,
      args: (string | number | boolean)[],
      opts: Record<string, string | number | boolean>,
    ) => Promise<void>,
  ): CLIBuilder<Options, Arguments> {
    this.action = callback;
    return this;
  }

  build(): CLIProgram {
    if (this.commands.length === 0 && this.action === null)
      throw new Error("CLIBuilder: No commands or action specified");

    return {
      script: this.script,
      name: this.name ?? "",
      description: this.description ?? "",
      version: this.version ?? "",
      options: this.options,
      arguments: this.arguments,
      commands: this.commands,
      callback: this.action ?? undefined,
    };
  }
}
