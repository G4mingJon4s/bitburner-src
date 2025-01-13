import { Player } from "@player";
import { CodingContract } from "../CodingContracts";
import { CodingContractObj, CodingContract as ICodingContract } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { CodingContractName } from "@enums";
import { generateDummyContract } from "../CodingContractGenerator";
import { isCodingContractName } from "../data/codingcontracttypes";

export function NetscriptCodingContract(): InternalAPI<ICodingContract> {
  const getCodingContract = function (ctx: NetscriptContext, hostname: string, filename: string): CodingContract {
    const server = helpers.getServer(ctx, hostname);
    const contract = server.getContract(filename);
    if (contract == null) {
      throw helpers.errorMessage(ctx, `Cannot find contract '${filename}' on server '${hostname}'`);
    }

    return contract;
  };

  return {
    attempt: (ctx) => (answer: unknown, _filename: unknown, _hostname?: unknown, _type?: unknown) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, hostname, filename);

      if (_type) {
        const type = helpers.string(ctx, "type", _type);
        if (contract.type !== type)
          throw helpers.errorMessage(
            ctx,
            `The given type '${type}' is not the same as the one of contract '${contract.fn}' of type '${contract.type}'.`,
          );
      }

      if (!contract.isValid(answer))
        throw helpers.errorMessage(
          ctx,
          `Answer is not in the right format for contract '${contract.type}'. Got: ${answer}`,
        );

      const serv = helpers.getServer(ctx, hostname);
      if (contract.isSolution(answer)) {
        const reward = Player.gainCodingContractReward(contract.reward, contract.getDifficulty());
        helpers.log(ctx, () => `Successfully completed Coding Contract '${filename}'. Reward: ${reward}`);
        serv.removeContract(filename);
        return reward;
      } else {
        ++contract.tries;
        if (contract.tries >= contract.getMaxNumTries()) {
          helpers.log(ctx, () => `Coding Contract attempt '${filename}' failed. Contract is now self-destructing`);
          serv.removeContract(filename);
        } else {
          helpers.log(
            ctx,
            () =>
              `Coding Contract attempt '${filename}' failed. ${
                contract.getMaxNumTries() - contract.tries
              } attempts remaining.`,
          );
        }

        return "";
      }
    },
    getContractType: (ctx) => (_filename, _hostname?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, hostname, filename);
      return contract.getType();
    },
    getData:
      (ctx) =>
      (_filename: unknown, _hostname?: unknown, _type?: unknown): any => {
        const filename = helpers.string(ctx, "filename", _filename);
        const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
        const contract = getCodingContract(ctx, hostname, filename);
        if (_type) {
          const type = helpers.string(ctx, "type", _type);
          if (contract.type !== type)
            throw helpers.errorMessage(
              ctx,
              `The given type '${type}' is not the same as the one of contract '${contract.fn}' of type '${contract.type}'.`,
            );
        }
        return structuredClone(contract.getData());
      },
    getContract: (ctx) => (_filename, _hostname?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, hostname, filename);
      // asserting type here is required, since it is not feasible to properly type getData
      return {
        type: contract.type,
        data: contract.getData(),
        description: contract.getDescription(),
        numTriesRemaining: contract.getMaxNumTries() - contract.tries,
      } as CodingContractObj;
    },
    getDescription: (ctx) => (_filename, _hostname?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, hostname, filename);
      return contract.getDescription();
    },
    getNumTriesRemaining: (ctx) => (_filename, _hostname?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, hostname, filename);
      return contract.getMaxNumTries() - contract.tries;
    },
    createDummyContract: (ctx) => (_type) => {
      const type = helpers.string(ctx, "type", _type);
      if (!isCodingContractName(type))
        return helpers.errorMessage(ctx, `The given type is not a valid contract type. Got '${type}'`);
      return generateDummyContract(type);
    },
    getContractTypes: () => () => Object.values(CodingContractName),
  };
}
