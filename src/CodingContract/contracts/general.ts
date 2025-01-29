import { CodingContractName } from "@enums";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { convert2DArrayToString, removeBracketsFromArrayString, type CodingContractTypes } from "../ContractTypes";

export const generalDefinitions = {
  [CodingContractName.MergeOverlappingIntervals]: {
    desc: (arr: number[][]): string => {
      return [
        "Given the following array of arrays of numbers representing a list of",
        "intervals, merge all overlapping intervals.\n\n",
        `[${convert2DArrayToString(arr)}]\n\n`,
        "Example:\n\n",
        "[[1, 3], [8, 10], [2, 6], [10, 16]]\n\n",
        "would merge into [[1, 6], [8, 16]].\n\n",
        "The intervals must be returned in ASCENDING order.",
        "You can assume that in an interval, the first number will always be",
        "smaller than the second.",
      ].join(" ");
    },
    difficulty: 3,
    generate: (): [number, number][] => {
      const intervals: [number, number][] = [];
      const numIntervals: number = getRandomIntInclusive(3, 20);
      for (let i = 0; i < numIntervals; ++i) {
        const start: number = getRandomIntInclusive(1, 25);
        const end: number = start + getRandomIntInclusive(1, 10);
        intervals.push([start, end]);
      }

      return intervals;
    },
    numTries: 15,
    solver: (data, answer) => {
      const intervals: [number, number][] = data.slice();
      intervals.sort((a: [number, number], b: [number, number]) => {
        return a[0] - b[0];
      });

      const result: [number, number][] = [];
      let start: number = intervals[0][0];
      let end: number = intervals[0][1];
      for (const interval of intervals) {
        if (interval[0] <= end) {
          end = Math.max(end, interval[1]);
        } else {
          result.push([start, end]);
          start = interval[0];
          end = interval[1];
        }
      }
      result.push([start, end]);

      return result.length === answer.length && result.every((a, i) => a[0] === answer[i][0] && a[1] === answer[i][1]);
    },
    convertAnswer: (ans) => {
      const arrayRegex = /\[\d+,\d+\]/g;
      const matches = ans.replace(/\s/g, "").match(arrayRegex);
      if (matches === null) return null;
      const arr = matches.map((a) =>
        removeBracketsFromArrayString(a)
          .split(",")
          .map((n) => parseInt(n)),
      );
      // An inline function is needed here, so that TS knows this returns true if it matches the type
      if (((a: number[][]): a is [number, number][] => a.every((n) => n.length === 2))(arr)) return arr;
      return null;
    },
    validateAnswer: (ans): ans is [number, number][] =>
      typeof ans === "object" &&
      Array.isArray(ans) &&
      ans.every((a) => Array.isArray(a) && a.length === 2 && a.every((n) => typeof n === "number")),
  },
  [CodingContractName.SpiralizeMatrix]: {
    desc: (n: number[][]): string => {
      let d: string = [
        "Given the following array of arrays of numbers representing a 2D matrix,",
        "return the elements of the matrix as an array in spiral order:\n\n",
      ].join(" ");
      // for (const line of n) {
      //   d += `${line.toString()},\n`;
      // }
      d += "&nbsp;&nbsp;&nbsp;&nbsp;[\n";
      d += n
        .map(
          (line: number[]) =>
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[" +
            line.map((x: number) => `${x}`.padStart(2, " ")).join(",") +
            "]",
        )
        .join("\n");
      d += "\n&nbsp;&nbsp;&nbsp;&nbsp;]\n";
      d += [
        "\nHere is an example of what spiral order should be:\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[1, 2, 3]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[4, 5, 6]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[7, 8, 9]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;]\n\n",
        "Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]\n\n",
        "Note that the matrix will not always be square:\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[1,&nbsp;&nbsp;2,&nbsp;&nbsp;3,&nbsp;&nbsp;4]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[5,&nbsp;&nbsp;6,&nbsp;&nbsp;7,&nbsp;&nbsp;8]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[9,&nbsp;10,&nbsp;11,&nbsp;12]\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;]\n\n",
        "Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]",
      ].join(" ");

      return d;
    },
    difficulty: 2,
    generate: (): number[][] => {
      const m: number = getRandomIntInclusive(1, 15);
      const n: number = getRandomIntInclusive(1, 15);
      const matrix: number[][] = [];
      matrix.length = m;
      for (let i = 0; i < m; ++i) {
        matrix[i] = [];
        matrix[i].length = n;
      }

      for (let i = 0; i < m; ++i) {
        for (let j = 0; j < n; ++j) {
          matrix[i][j] = getRandomIntInclusive(1, 50);
        }
      }

      return matrix;
    },
    solver: (data, answer) => {
      const spiral: number[] = [];
      const m: number = data.length;
      const n: number = data[0].length;
      let u = 0;
      let d: number = m - 1;
      let l = 0;
      let r: number = n - 1;
      let k = 0;
      let done = false;
      while (!done) {
        // Up
        for (let col: number = l; col <= r; col++) {
          spiral[k] = data[u][col];
          ++k;
        }
        if (++u > d) {
          done = true;
          continue;
        }

        // Right
        for (let row: number = u; row <= d; row++) {
          spiral[k] = data[row][r];
          ++k;
        }
        if (--r < l) {
          done = true;
          continue;
        }

        // Down
        for (let col: number = r; col >= l; col--) {
          spiral[k] = data[d][col];
          ++k;
        }
        if (--d < u) {
          done = true;
          continue;
        }

        // Left
        for (let row: number = d; row >= u; row--) {
          spiral[k] = data[row][l];
          ++k;
        }
        if (++l > r) {
          done = true;
          continue;
        }
      }

      return spiral.length === answer.length && spiral.every((n, i) => n === answer[i]);
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "").split(",");
      return sanitized.map((s) => parseInt(s));
    },
    validateAnswer: (ans): ans is number[] =>
      typeof ans === "object" && Array.isArray(ans) && ans.every((n) => typeof n === "number"),
  },
} satisfies Partial<CodingContractTypes>;