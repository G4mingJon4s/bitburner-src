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
		Default = _Type | ((data: CLIData) => _Type) | undefined,
  >(
    rep: Rep,
    type: Type,
    synonyms: string[] = [],
    choices: _Type[] | ((data: CLIData) => _Type[]) | undefined = [],
    defaultValue?: Default,
    description?: string | ((data: CLIData) => string),
  ): CLIBuilder<
    Options & { [K in Rep[0]]: Default extends undefined ? _Type | undefined : _Type },
    Arguments
  > {
    this.cli.options = this.cli.options ?? [];
		const choicesArray = (Array.isArray(choices) ? [...choices] : choices(this.data)) as (string | number | boolean)[];
		const defaultChoice = defaultValue === undefined ? undefined : (defaultValue instanceof Function ? defaultValue(this.data) : defaultValue) as string | number | boolean | undefined;

		if (defaultChoice !== undefined && choicesArray.length !== 0 && !choicesArray.includes(defaultChoice)) throw new Error(`CLIBuilder: Default value ${defaultChoice} is not a valid choice for option ${rep}`);

    this.cli.options.push({
      rep: rep,
      type: type,
      choices: choicesArray,
      default: defaultChoice,
      description: typeof description === "string" ? description : description?.(this.data),
      required: false,
      synonyms,
    });
    return this;
  }

	requiredOption<
		Rep extends string,
		Type extends "string" | "number" | "boolean",
		_Type = Type extends "string" ? string : Type extends "number" ? number : boolean,
	>(
		rep: Rep,
		type: Type,
		synonyms: string[] = [],
		choices: _Type[] | ((data: CLIData) => _Type[]) | undefined = [],
		description?: string | ((data: CLIData) => string),
	): CLIBuilder<
		Options & { [K in Rep]: _Type },
		Arguments
	> {
		this.cli.options = this.cli.options ?? [];
		this.cli.options.push({
			rep: rep,
			type: type,
			choices: (Array.isArray(choices) ? [...choices] : choices(this.data)) as (string | number | boolean)[],
			default: undefined,
			description: typeof description === "string" ? description : description?.(this.data),
			required: true,
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
    choices: _Type[] | ((data: CLIData) => _Type[]) | undefined = [],
    description?: string | ((data: CLIData) => string),
  ): CLIBuilder<Options, [...Arguments, Type extends "string" ? string : Type extends "number" ? number : boolean]> {
    this.cli.arguments = this.cli.arguments ?? [];
    this.cli.arguments.push({
      name: name,
      type: type,
      choices: (Array.isArray(choices) ? [...choices] : choices(this.data)) as (string | number | boolean)[],
      description: typeof description === "string" ? description : description?.(this.data),
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
