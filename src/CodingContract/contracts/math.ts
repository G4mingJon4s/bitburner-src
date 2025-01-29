import { randomBigIntExclusive } from "../../utils/helpers/randomBigIntExclusive";
import { type CodingContractTypes } from "../ContractTypes";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractName } from "@enums";

export const mathDefinitions = {
  [CodingContractName.FindLargestPrimeFactor]: {
    desc: (n: number): string => {
      return ["A prime factor is a factor that is a prime number.", `What is the largest prime factor of ${n}?`].join(
        " ",
      );
    },
    difficulty: 1,
    generate: (): number => {
      return getRandomIntInclusive(500, 1e9);
    },
    solver: (data, answer) => {
      let fac = 2;
      let n: number = data;
      while (n > (fac - 1) * (fac - 1)) {
        while (n % fac === 0) {
          n = Math.round(n / fac);
        }
        ++fac;
      }

      return (n === 1 ? fac - 1 : n) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.SquareRoot]: {
    difficulty: 5,
    desc(data: bigint): string {
      return `You are given a ~200 digit BigInt. Find the square root of this number, to the nearest integer.\n
The input is a BigInt value. The answer must be the string representing the solution's BigInt value. The trailing "n" is not part of the string.\n
Hint: If you are having trouble, you might consult https://en.wikipedia.org/wiki/Methods_of_computing_square_roots

Input number:
${data}`;
    },
    generate(): [string, string] {
      const half = BigInt(2 ** 332);
      // We will square this, meaning the result won't be uniformly distributed anymore.
      // That's OK, we never claimed that (just that it would be random).
      // We cap the low end to 2^332 so that the problem input is always in the range [2^664, 2^666) which is 200-201 digits.
      const ans = randomBigIntExclusive(half) + half;
      let offset: bigint;
      // The numbers x for which round(sqrt(x)) = n are the integer range [n^2 - n + 1, n^2 + n + 1)
      if (Math.random() >= 0.5) {
        // Half the time, we will test the edge cases
        offset = Math.random() >= 0.5 ? ans : 1n - ans;
      } else {
        offset = randomBigIntExclusive(ans + ans) + 1n - ans;
      }
      // Bigints can't be JSON serialized, so we use strings.
      return [ans.toString(), offset.toString()];
    },
    getData(state: [string, string]): bigint {
      const ans = BigInt(state[0]);
      return ans * ans + BigInt(state[1]);
    },
    solver: (state, answer) => {
      return state[0] === answer.toString();
    },
    convertAnswer: (ans) => BigInt(ans),
    validateAnswer: (ans): ans is bigint => typeof ans === "bigint",
  },
} satisfies Partial<CodingContractTypes>;