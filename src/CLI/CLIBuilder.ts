import { NS, CLI, CLIData } from "@nsdefs";

export class CLIBuilder<
  Options extends Record<string, string | number | boolean> = Record<string, never>,
  Arguments extends (string | number | boolean)[] = [],
> {
  private cli: Partial<CLI> = {};

  private data: CLIData;
  constructor(data: CLIData) {
    this.data = data;
  }

  command(callback: (builder: CLIBuilder) => CLI): CLIBuilder<Options, Arguments> {
    this.cli.commands = this.cli.commands ?? [];
    this.cli.commands.push(callback(new CLIBuilder(this.data)));
    return this;
  }

  name(name: string): CLIBuilder<Options, Arguments> {
    this.cli.name = name;
    return this;
  }

  description(description: string): CLIBuilder<Options, Arguments> {
    this.cli.description = description;
    return this;
  }

  version(version: string): CLIBuilder<Options, Arguments> {
    this.cli.version = version;
    return this;
  }

  option<
    Rep extends string,
    Type extends "string" | "number" | "boolean",
    _Type = Type extends "string" ? string : Type extends "number" ? number : boolean,
  >(
    rep: Rep,
    type: Type,
    synonyms: string[] = [],
    required?: boolean,
    choices: _Type[] | undefined = [],
    defaultValue?: _Type,
    description?: string | ((data: CLIData) => string),
  ): CLIBuilder<
    Options & { [K in Rep[0]]: Type extends "string" ? string : Type extends "number" ? number : boolean },
    Arguments
  > {
    this.cli.options = this.cli.options ?? [];
    this.cli.options.push({
      rep: rep,
      type: type,
      choices: [...choices] as (string | number | boolean)[],
      default: defaultValue as string | number | boolean | undefined,
      description: typeof description === "string" ? description : description?.(this.data),
      required: required ?? false,
      synonyms,
    });
    return this;
  }

  argument<
    Type extends "string" | "number" | "boolean",
    _Type = Type extends "string" ? string : Type extends "number" ? number : boolean,
  >(
    name: string,
    type: Type,
    choices: _Type[] | undefined = [],
    description?: string,
  ): CLIBuilder<Options, [...Arguments, Type extends "string" ? string : Type extends "number" ? number : boolean]> {
    this.cli.arguments = this.cli.arguments ?? [];
    this.cli.arguments.push({
      name: name,
      type: type,
      choices: [...choices] as (string | number | boolean)[],
      description: description,
    });
    return this;
  }

  action(
    callback: (
      ns: NS,
      args: (string | number | boolean)[],
      opts: Record<string, string | number | boolean>,
    ) => Promise<void>,
  ): CLIBuilder<Options, Arguments> {
    this.cli.callback = callback;
    return this;
  }

  build(): CLI {
    if (this.cli.name === undefined) throw new Error("CLIBuilder: No name specified");
    if (this.cli.commands?.length === 0 && !this.cli.callback)
      throw new Error("CLIBuilder: No commands or action specified");

    const cli: CLI = {
      commands: [],
      options: [],
      arguments: [],
      parent: null,
      name: this.cli.name,
      ...this.cli,
    };

    cli.commands.forEach((command) => (command.parent = cli));
    return cli;
  }
}
