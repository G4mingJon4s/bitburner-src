import { CodingContractName } from "@enums";
import { filterTruthy } from "../../utils/helpers/ArrayHelpers";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { removeBracketsFromArrayString, removeQuotesFromString, type CodingContractTypes } from "../ContractTypes";

export const stringDefinitions = {
  [CodingContractName.SanitizeParenthesesInExpression]: {
    desc: (data: string): string => {
      return [
        "Given the following string:\n\n",
        `${data}\n\n`,
        "remove the minimum number of invalid parentheses in order to validate",
        "the string. If there are multiple minimal ways to validate the string,",
        "provide all of the possible results. The answer should be provided",
        "as an array of strings. If it is impossible to validate the string",
        "the result should be an array with only an empty string.\n\n",
        "IMPORTANT: The string may contain letters, not just parentheses.\n\n",
        `Examples:\n\n`,
        `"()())()" -> ["()()()", "(())()"]\n`,
        `"(a)())()" -> ["(a)()()", "(a())()"]\n`,
        `")(" -> [""]`,
      ].join(" ");
    },
    difficulty: 10,
    generate: (): string => {
      const len: number = getRandomIntInclusive(6, 20);
      const chars: string[] = [];
      chars.length = len;

      // 80% chance of the first parenthesis being (
      Math.random() < 0.8 ? (chars[0] = "(") : (chars[0] = ")");

      for (let i = 1; i < len; ++i) {
        const roll = Math.random();
        if (roll < 0.4) {
          chars[i] = "(";
        } else if (roll < 0.8) {
          chars[i] = ")";
        } else {
          chars[i] = "a";
        }
      }

      return chars.join("");
    },
    solver: (data, answer) => {
      let left = 0;
      let right = 0;
      const res: string[] = [];

      for (let i = 0; i < data.length; ++i) {
        if (data[i] === "(") {
          ++left;
        } else if (data[i] === ")") {
          left > 0 ? --left : ++right;
        }
      }

      function dfs(
        pair: number,
        index: number,
        left: number,
        right: number,
        s: string,
        solution: string,
        res: string[],
      ): void {
        if (s.length === index) {
          if (left === 0 && right === 0 && pair === 0) {
            for (let i = 0; i < res.length; i++) {
              if (res[i] === solution) {
                return;
              }
            }
            res.push(solution);
          }
          return;
        }

        if (s[index] === "(") {
          if (left > 0) {
            dfs(pair, index + 1, left - 1, right, s, solution, res);
          }
          dfs(pair + 1, index + 1, left, right, s, solution + s[index], res);
        } else if (s[index] === ")") {
          if (right > 0) dfs(pair, index + 1, left, right - 1, s, solution, res);
          if (pair > 0) dfs(pair - 1, index + 1, left, right, s, solution + s[index], res);
        } else {
          dfs(pair, index + 1, left, right, s, solution + s[index], res);
        }
      }

      dfs(0, 0, left, right, data, "", res);

      if (res.length !== answer.length) return false;
      return res.every((sol) => answer.includes(sol));
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).split(",");
      return sanitized.map((s) => removeQuotesFromString(s.replace(/\s/g, "")));
    },
    validateAnswer: (ans): ans is string[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((s) => typeof s === "string"),
  },
  [CodingContractName.FindAllValidMathExpressions]: {
    desc: (data: [string, number]): string => {
      const digits: string = data[0];
      const target: number = data[1];

      return [
        "You are given the following string which contains only digits between 0 and 9:\n\n",
        `${digits}\n\n`,
        `You are also given a target number of ${target}. Return all possible ways`,
        "you can add the +(add), -(subtract), and *(multiply) operators to the string such",
        "that it evaluates to the target number. (Normal order of operations applies.)\n\n",
        "The provided answer should be an array of strings containing the valid expressions.",
        "The data provided by this problem is an array with two elements. The first element",
        "is the string of digits, while the second element is the target number:\n\n",
        `["${digits}", ${target}]\n\n`,
        "NOTE: The order of evaluation expects script operator precedence.\n",
        "NOTE: Numbers in the expression cannot have leading 0's. In other words,",
        `"1+01" is not a valid expression.\n\n`,
        "Examples:\n\n",
        `Input: digits = "123", target = 6\n`,
        `Output: ["1+2+3", "1*2*3"]\n\n`,
        `Input: digits = "105", target = 5\n`,
        `Output: ["1*0+5", "10-5"]`,
      ].join(" ");
    },
    difficulty: 10,
    generate: (): [string, number] => {
      const numDigits = getRandomIntInclusive(4, 12);
      const digitsArray: string[] = [];
      digitsArray.length = numDigits;
      for (let i = 0; i < digitsArray.length; ++i) {
        if (i === 0) {
          digitsArray[i] = String(getRandomIntInclusive(1, 9));
        } else {
          digitsArray[i] = String(getRandomIntInclusive(0, 9));
        }
      }

      const target: number = getRandomIntInclusive(-100, 100);
      const digits: string = digitsArray.join("");

      return [digits, target];
    },
    solver: (data, answer) => {
      const num = data[0];
      const target = data[1];

      function helper(
        res: string[],
        path: string,
        num: string,
        target: number,
        pos: number,
        evaluated: number,
        multed: number,
      ): void {
        if (pos === num.length) {
          if (target === evaluated) {
            res.push(path);
          }
          return;
        }

        for (let i = pos; i < num.length; ++i) {
          if (i != pos && num[pos] == "0") {
            break;
          }
          const cur = parseInt(num.substring(pos, i + 1));

          if (pos === 0) {
            helper(res, path + cur, num, target, i + 1, cur, cur);
          } else {
            helper(res, path + "+" + cur, num, target, i + 1, evaluated + cur, cur);
            helper(res, path + "-" + cur, num, target, i + 1, evaluated - cur, -cur);
            helper(res, path + "*" + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur);
          }
        }
      }

      const result: string[] = [];
      helper(result, "", num, target, 0, 0, 0);

      if (result.length !== answer.length) return false;

      const solutions = new Set(answer);
      return result.every((sol) => solutions.has(sol));
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).split(",");
      return filterTruthy(sanitized).map((s) => removeQuotesFromString(s.replace(/\s/g, "")));
    },
    validateAnswer: (ans): ans is string[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((s) => typeof s === "string"),
  },
  [CodingContractName.GenerateIPAddresses]: {
    desc: (data: string): string => {
      return [
        "Given the following string containing only digits, return",
        "an array with all possible valid IP address combinations",
        "that can be created from the string:\n\n",
        `${data}\n\n`,
        "Note that an octet cannot begin with a '0' unless the number",
        "itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.\n\n",
        "Examples:\n\n",
        '25525511135 -> ["255.255.11.135", "255.255.111.35"]\n',
        '1938718066 -> ["193.87.180.66"]',
      ].join(" ");
    },
    difficulty: 3,
    generate: (): string => {
      let str = "";
      for (let i = 0; i < 4; ++i) {
        const num: number = getRandomIntInclusive(0, 255);
        const convNum: string = num.toString();
        str += convNum;
      }

      return str;
    },
    solver: (data, answer) => {
      const ret: string[] = [];
      for (let a = 1; a <= 3; ++a) {
        for (let b = 1; b <= 3; ++b) {
          for (let c = 1; c <= 3; ++c) {
            for (let d = 1; d <= 3; ++d) {
              if (a + b + c + d === data.length) {
                const A = parseInt(data.substring(0, a), 10);
                const B = parseInt(data.substring(a, a + b), 10);
                const C = parseInt(data.substring(a + b, a + b + c), 10);
                const D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
                if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                  const ip: string = [A.toString(), ".", B.toString(), ".", C.toString(), ".", D.toString()].join("");
                  if (ip.length === data.length + 3) {
                    ret.push(ip);
                  }
                }
              }
            }
          }
        }
      }

      return ret.length === answer.length && ret.every((ip) => answer.includes(ip));
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "");
      return sanitized.split(",").map((ip) => ip.replace(/^(?<quote>['"])([\d.]*)\k<quote>$/g, "$2"));
    },
    validateAnswer: (ans): ans is string[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((s) => typeof s === "string"),
  },
} satisfies Partial<CodingContractTypes>;
