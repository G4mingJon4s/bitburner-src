import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { PromptEvent } from "../../ui/React/PromptManager";
import { isDirectoryPath, type Directory } from "../../Paths/Directory";
import type { IReturnStatus } from "../../types";
import type { FilePath } from "../../Paths/FilePath";

export function rm(args: (string | number | boolean)[], server: BaseServer): void {
  const errors = {
    arg: (reason: string) => `Incorrect usage of rm command. ${reason}. Usage: rm [OPTION]... [FILE]...`,
    dirsProvided: () => "Incorrect usage of rm command. To delete directories, use the -r flag",
    invalidDir: (name: string) => `Invalid directory: ${name}`,
    invalidFile: (name: string) => `Invalid file: ${name}`,
    deleteFailed: (name: string, reason?: string) => `Failed to delete "${name}". ${reason ?? "Uncaught error"}`,
    rootDeletion: () =>
      "You are trying to delete all files within the root directory. If this is intentional, use the --no-preserve-root flag",
  } as const;

  if (args.length === 0) return Terminal.error(errors["arg"]("No arguments provided"));

  const recursive = args.includes("-r") || args.includes("-R") || args.includes("--recursive") || args.includes("-rf");
  const force = args.includes("-f") || args.includes("--force") || args.includes("-rf");
  const ignoreSpecialRoot = args.includes("--no-preserve-root");

  const isTargetString = (
    arg: string | number | boolean,
    index: number,
    array: (string | number | boolean)[],
  ): arg is string =>
    typeof arg === "string" && (!arg.startsWith("-") || (index - 1 >= 0 && array[index - 1] === "--"));
  const targets = args.filter(isTargetString);

  if (targets.length === 0) return Terminal.error(errors["arg"]("No targets provided"));
  if (!ignoreSpecialRoot && targets.includes("/")) return Terminal.error(errors["rootDeletion"]());

  const directories: Directory[] = [];
  const files: FilePath[] = [];

  for (const target of targets) {
    if (isDirectoryPath(target) || !/\..+$/.test(target)) {
      const dirPath = Terminal.getDirectory(target);
      if (dirPath === null) return Terminal.error(errors["invalidDir"](target));
      if (!recursive) return Terminal.error(errors["dirsProvided"]());
      directories.push(dirPath);
      continue;
    }

    const file = Terminal.getFilepath(target);
    if (file === null) return Terminal.error(errors["invalidFile"](target));

    files.push(file);
  }

  for (const dir of directories) {
    for (const file of server.scripts.keys()) {
      if (file.startsWith(dir)) files.push(file);
    }
    for (const file of server.textFiles.keys()) {
      if (file.startsWith(dir)) files.push(file);
    }
    for (const file of server.messages) {
      if (file.endsWith(".msg")) continue;
      if (file.startsWith(dir)) files.push(file as FilePath);
    }
    for (const file of server.contracts) {
      if (file.fn.startsWith(dir)) files.push(file.fn);
    }
    for (const file of server.programs) {
      if (file.startsWith(dir)) files.push(file as FilePath);
    }
  }

  const targetList = files.map((file) => "* " + file.toString()).join("\n");

  const reports: { target: string; result: IReturnStatus }[] = [];

  const deleteSelectedTargets = () => {
    for (const file of files) {
      reports.push({ target: file, result: server.removeFile(file) });
    }

    for (const report of reports) {
      if (report.result.res) {
        Terminal.success(`Deleted: ${report.target}`);
      } else {
        Terminal.error(errors["deleteFailed"](report.target, report.result.msg));
      }
    }
  };

  if (
    force ||
    (files.length === 1 && !files[0].endsWith(".exe") && !files[0].endsWith(".lit") && !files[0].endsWith(".cct"))
  ) {
    deleteSelectedTargets();
  } else {
    const promptText = `Are you sure you want to delete ${
      files.length === 1 ? files[0] : "these files"
    }? This is irreversible.${files.length > 1 ? "\n\nDeleting:\n" + targetList : ""}`;

    PromptEvent.emit({
      txt: promptText,
      resolve: (value: string | boolean) => {
        if (typeof value === "string") throw new Error("PromptEvent got a string, expected boolean");
        if (value) deleteSelectedTargets();
      },
    });
  }
}
