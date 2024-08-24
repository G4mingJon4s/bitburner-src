import { CLIArgumentData, CLI, CLIOptionData, NS, ScriptArg } from "@nsdefs";
import { WorkerScript } from "../Netscript/WorkerScript";
import { Terminal } from "../Terminal";

// -t and --ram-override are handled by the command execution of the terminal
const SPECIAL_ARGS = ["--help", "--version"];

class CLIError extends Error {
  message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export async function runCLIProgram(program: CLI, rawArgs: ScriptArg[], workerScript: WorkerScript): Promise<void> {
  try {
    const { cli, options, arguments: parsedArgs, specialArgs } = getCLIParams(rawArgs, program);

    const firstSpecial = specialArgs[0];
    if (firstSpecial === "--help") {
      printCLIHelp(cli);
      return;
    }
    if (firstSpecial === "--version") {
      printCLIVersion(cli);
      return;
    }

    const callback = cli.callback;
    if (callback === undefined) throw new Error("No callback found for the cli. This is a bug.");

    const optionRecord = options.reduce((acc, option) => {
      acc[option.option.rep] = option.value;
      return acc;
    }, {} as Record<string, string | number | boolean>);

    // Casting to NS, NS is NSFull
		// The type of NS in the callback can't be NSFull, the type is defined to the player
    await callback(workerScript.env.vars as unknown as NS, parsedArgs, optionRecord);
  } catch (e) {
    if (e instanceof CLIError) return Terminal.error(e.message);
    throw e;
  }
}

export function printCLIHelp(program: CLI): void {
  const general =
    (!program.version ? "" : `Version: v${program.version}\n\n`) + (program.description ?? "No description provided.");

	const commands = "Commands:\n" + program.commands.map(command => "  " + getCLISubCommandDisplay(command)).join("\n");

  const args =
    "Arguments:\n" +
    program.arguments
      .map(arg => getCLIArgumentDisplay(arg).map(s => `  ${s}`).join("\n"))
      .join("\n");

  const options =
    "Options:\n" +
    program.options
      .map(option => getCLIOptionDisplay(option).map(s => `  ${s}`).join("\n"))
      .join("\n");

  const message = [
		general,
		program.commands.length ? commands : "",
		program.arguments.length ? args : "",
		program.options.length ? options : "",
	].filter(s => s !== "").join("\n\n");

  Terminal.print(`Help for ${getCLIDisplayName(program)}:\n${message}`);
}

export function printCLIVersion(program: CLI): void {
  Terminal.print(program.version ? `${getCLIDisplayName(program)} v${program.version}` : `No version specified for ${getCLIDisplayName(program)}`);
}

export function getCLIParams(
  args: ScriptArg[],
  program: CLI,
): {
  cli: CLI;
  arguments: (string | number | boolean)[];
  options: { option: CLIOptionData; value: string | number | boolean }[];
  specialArgs: string[];
} {
  let cli = program;
  while (args.length > 0) {
    const command = cli.commands.find((command) => command.name === args[0]);
    if (!command) break;
    args.shift();
    cli = command;
  }

  const options: { option: CLIOptionData; value: string | number | boolean }[] = [];
  const parsedArgs: (string | number | boolean)[] = [];
  const specialArgs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const current = args[i];
    if (typeof current !== "string" || !current.startsWith("-")) {
      parsedArgs.push(current);
      continue;
    }

    if (SPECIAL_ARGS.includes(current)) {
      specialArgs.push(current);
      continue;
    }

    const rep = current.replace(/^--?/, "");
    const option = cli.options.find((option) => option.rep === rep || option.synonyms.includes(rep));
    if (!option) throw new CLIError(`Unknown option '${current}' for '${getCLIDisplayName(cli)}'`);

    if (option.type === "boolean" && typeof args[i + 1] !== "boolean") {
      options.push({ option, value: true });
      continue;
    }

    if (typeof args[i + 1] !== option.type)
      throw new CLIError(`Option '${current}' requires type '${option.type}', got '${typeof args[i + 1]}'`);

    if (option.choices && !option.choices.includes(args[i + 1]))
      throw new CLIError(`'${args[i + 1]}' is not a valid choice for option '${convertOptionRep(option.rep)}' for '${getCLIDisplayName(cli)}'`);

    options.push({ option, value: args[i + 1] });
    i++;
  }

  // If there are special args provided, the arguments and options are irrelevant
  if (specialArgs.length !== 0) return { cli, arguments: parsedArgs, options, specialArgs };

  for (const option of cli.options) {
    if (options.findIndex((o) => o.option === option) !== -1) continue;
    if (option.required && !option.default) throw new CLIError(`Option '${convertOptionRep(option.rep)}' is required but not provided for '${getCLIDisplayName(cli)}'`);
    if (option.default) options.push({ option, value: option.default });
  }

  if (cli.arguments.length !== parsedArgs.length) {
    if (parsedArgs.length > cli.arguments.length)
      throw new CLIError(`Too many arguments provided for '${getCLIDisplayName(cli)}'`);

    const missingArg = cli.arguments[parsedArgs.length];
    throw new CLIError(`Missing argument '${missingArg.name}' for '${getCLIDisplayName(cli)}'`);
  }

	for (let i = 0; i < cli.arguments.length; i++) {
		const arg = cli.arguments[i];
		const parsedArg = parsedArgs[i];
		if (typeof parsedArg !== arg.type) throw new CLIError(`Argument '${arg.name}' is not of type '${arg.type}', got '${typeof parsedArg}'`);
		if (arg.choices && !arg.choices.includes(parsedArg)) throw new CLIError(`'${parsedArg}' is not a valid choice for argument '${arg.name}' of '${getCLIDisplayName(cli)}'`);
	}

  return { cli, arguments: parsedArgs, options, specialArgs };
}

export function getCLIDisplayName(cli: CLI): string {
  let name = cli.name;
  while (cli.parent) {
    name = `${cli.parent.name}/${name}`;
    cli = cli.parent;
  }
  return name;
}

export function convertOptionRep(rep: string): string {
	return "-".repeat(rep.length > 1 ? 2 : 1) + rep;
}

export function getCLISubCommandDisplay(command: CLI): string {
	return `${command.name}${command.description ? `: ${command.description}` : ""}`;
}

export function getCLIArgumentDisplay(arg: CLIArgumentData): string[] {
	const general = `<${arg.name}> (${arg.type})`;
	const choices = arg.choices.length ? `Choices: [${arg.choices.map(c => typeof c === "string" ? `'${c}'` : c).join(", ")}]` : "";

	if (!arg.description && !choices) return [general];
	return [general, ...[arg.description ?? "", choices].filter(s => s !== "").map(s => `: ${s}`)];
}

export function getCLIOptionDisplay(option: CLIOptionData): string[] {
	const general = `${[option.rep, ...option.synonyms].map(s => convertOptionRep(s)).join(", ")} <${option.type}>${option.required ? " (required)" : ""}`;
	const choices = option.choices.length ? `Choices: [${option.choices.map(c => typeof c === "string" ? `'${c}'` : c).join(", ")}]` : "";
	const defaultValue = option.default ? `Default: ${option.default}` : "";

	if (!option.description && !choices) return [general];
	return [general, ...[option.description ?? "", choices, defaultValue].filter(s => s !== "").map(s => `: ${s}`)];
}

export function getOption(options: CLIOptionData[], arg: string | number | boolean): CLIOptionData | undefined {
  if (typeof arg !== "string" || !arg.startsWith("-")) return undefined;
  const rep = arg.replace(/^--?/, "");
  return options.find((option) => option.rep === rep);
}

export function cliCompletionPossibilities(program: CLI, args: ScriptArg[]): string[] {
  try {
    const { cli, options, arguments: parsedArgs } = getCLIParams(args, program);

    const availableOptions = cli.options.filter((option) => !options.some((o) => o.option === option));
    const optionSuggestions = availableOptions.map((option) => convertOptionRep(option.rep));
    const nextArg: CLIArgumentData | undefined =
      parsedArgs.length >= cli.arguments.length ? undefined : cli.arguments[parsedArgs.length];

    return optionSuggestions.concat(nextArg?.type === "boolean" ? ["true", "false"] : []);
  } catch (e) {
    return [];
  }
}
