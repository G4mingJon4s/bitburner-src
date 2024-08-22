import { CLIArgumentData, CLICommand, CLIOptionData, CLIProgram, NS, ScriptArg } from "@nsdefs";
import { WorkerScript } from "../Netscript/WorkerScript";
import { Terminal } from "../Terminal";

const SPECIAL_ARGS = ["--help", "--version", "-t", "--ram-override"];

export async function runCLIProgram(
  program: CLIProgram,
  rawArgs: ScriptArg[],
  workerScript: WorkerScript,
): Promise<void> {
  const { options, args, command, parsingError } = getCLIParams(rawArgs, program);
  if (parsingError) throw new Error(parsingError.error);

  const firstSpecial = rawArgs.find((arg) => typeof arg === "string" && SPECIAL_ARGS.includes(arg));
  if (firstSpecial === "--help") {
    printCLIHelp(program, command);
    return;
  }
  if (firstSpecial === "--version") {
    printCLIVersion(program);
    return;
  }

  const callback = command?.callback ?? program.callback;
  if (callback === undefined) throw new Error("No callback found for the cli. This is a bug.");

  const optionRecord = options.reduce((acc, option) => {
    acc[option.option.rep] = option.value;
    return acc;
  }, {} as Record<string, string | number | boolean>);

  // Casting to NS, NS is NSFull
  await callback(workerScript.env.vars as unknown as NS, args, optionRecord);
}

export function printCLIHelp(program: CLIProgram, command?: CLICommand): void {
  const main = command ?? program;

  const general =
    (command || !program.version ? "" : `Version: v${program.version}\n\n`) +
    (main.description ?? "No description provided.");

  const args =
    "Arguments:\n" +
    main.arguments
      .map((arg) => `\t${arg.name} (${arg.type})${arg.description ? `: ${arg.description}` : ""}`)
      .join("\n");

  const options =
    "Options:\n" +
    main.options
      .map(
        (option) =>
          `\t${option.required ? "" : "["}${"-".repeat(option.rep.length > 1 ? 2 : 1)}${option.rep} <${option.type}>${
            option.required ? "" : "]"
          }${option.description ? `: ${option.description}` : ""}`,
      )
      .join("\n");

  const message = general + "\n\n" + (main.options.length ? options + "\n\n" : "") + args;

  Terminal.print(`Help for ${program.name || program.script}${command ? `/${command.name}` : ""}:\n${message}`);
}

export function printCLIVersion(program: CLIProgram): void {
  Terminal.print(`${program.name || program.script} v${program.version || "N/A"}`);
}

export function getCLIParams(
  args: ScriptArg[],
  program: CLIProgram,
): {
  options: { option: CLIOptionData; value: string | number | boolean }[];
  args: (string | number | boolean)[];
  command?: CLICommand;
  parsingError?: {
    argIndex: number;
    error: string;
  };
} {
  const command = program.commands.find((command) => command.name === args[0]);
  if (command) args.shift();
  const definitions = command?.options ?? program.options;

  const foundArgs: (string | number | boolean)[] = [];
  const options: { option: CLIOptionData; value: string | number | boolean }[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg !== "string" || !arg.startsWith("-")) {
      foundArgs.push(arg);
      continue;
    }
    if (SPECIAL_ARGS.includes(arg)) continue;
    const rep = arg.replace(/^--?/, "");
    const option = definitions.find((option) => option.rep === rep);
    if (!option)
      return {
        options: [],
        args: [],
        command: undefined,
        parsingError: {
          error: `Unknown option '${arg}' for '${program.name || program.script}${command ? "/" + command.name : ""}'}`,
          argIndex: i,
        },
      };
    if (option.type === "boolean" && typeof args[i + 1] !== "boolean") options.push({ option, value: true });
    else {
      options.push({ option, value: args[i + 1] });
      i++;
    }
  }

  return { options, args: foundArgs };
}

export function getOption(options: CLIOptionData[], arg: string | number | boolean): CLIOptionData | undefined {
  if (typeof arg !== "string" || !arg.startsWith("-")) return undefined;
  const rep = arg.replace(/^--?/, "");
  return options.find((option) => option.rep === rep);
}

export function cliCompletionPossibilities(program: CLIProgram, args: ScriptArg[]): string[] {
  console.log(args);
  const { options, args: foundArgs, command, parsingError } = getCLIParams(args, program);
  if (parsingError && parsingError.argIndex !== args.length - 1) return [];

  const availableOptions = (command?.options ?? program.options).filter(
    (option) => !options.some((o) => o.option === option),
  );
  const optionSuggestions = availableOptions.map((option) => "-".repeat(option.rep.length > 1 ? 2 : 1) + option.rep);
  const nextArg: CLIArgumentData | undefined =
    foundArgs.length >= (command?.arguments.length ?? program.arguments.length)
      ? undefined
      : (command ?? program).arguments[foundArgs.length];

  console.log(optionSuggestions);

  return optionSuggestions.concat(nextArg?.type === "boolean" ? ["true", "false"] : []);
}

/*
	Autocompletion is currently dumb.
	If the option right before is of type string the arg not treated as option.
	This case can't be checked, because it can't be determined if a new arg is started.

	ex: 'run cli.js --needString --stringWithStartingDashes '
	'--stringWithStartingDashes' is treated as a string.
	With the current implementation of autocompletion, it is not known that a new arg is started.
*/
