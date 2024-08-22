import { CLICommand, CLIOptionData, CLIArgumentData, NS } from "@nsdefs";

export class CLICommandBuilder {
  private name: string | null = null;
  private description: string | null = null;
  private options: CLIOptionData[] = [];
  private arguments: CLIArgumentData[] = [];
  private action:
    | ((ns: NS, args: (string | number | boolean)[], opts: Record<string, string | number | boolean>) => Promise<void>)
    | null = null;

  addName(name: string): CLICommandBuilder {
    this.name = name;
    return this;
  }

  addDescription(description: string): CLICommandBuilder {
    this.description = description;
    return this;
  }

  addOption(
    rep: string,
    type: "string" | "number" | "boolean",
    description?: string,
    required?: boolean,
  ): CLICommandBuilder {
    this.options.push({
      rep: rep,
      type: type,
      description: description,
      required: required,
    });
    return this;
  }

  addArgument(name: string, type: "string" | "number" | "boolean", description?: string): CLICommandBuilder {
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
  ): CLICommandBuilder {
    this.action = callback;
    return this;
  }

  build(): CLICommand {
    if (this.name === null) throw new Error("CLICommandBuilder.build() called without a name");
    if (this.action === null) throw new Error("CLICommandBuilder.build() called without an action");

    return {
      name: this.name,
      description: this.description ? this.description : undefined,
      options: this.options,
      arguments: this.arguments,
      callback: this.action,
    };
  }
}
