import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { removeBracketsFromArrayString, type CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const graphDefinitions = {
  [CodingContractName.Proper2ColoringOfAGraph]: {
    difficulty: 7,
    numTries: 5,
    desc: (data: [number, [number, number][]]): string => {
      return [
        `You are given the following data, representing a graph:\n`,
        `${JSON.stringify(data)}\n`,
        `Note that "graph", as used here, refers to the field of graph theory, and has`,
        `no relation to statistics or plotting.`,
        `The first element of the data represents the number of vertices in the graph.`,
        `Each vertex is a unique number between 0 and ${data[0] - 1}.`,
        `The next element of the data represents the edges of the graph.`,
        `Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].`,
        `Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.`,
        `You must construct a 2-coloring of the graph, meaning that you have to assign each`,
        `vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have`,
        `the same color. Submit your answer in the form of an array, where element i`,
        `represents the color of vertex i. If it is impossible to construct a 2-coloring of`,
        `the given graph, instead submit an empty array.\n\n`,
        `Examples:\n\n`,
        `Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]\n`,
        `Output: [0, 0, 1, 1]\n\n`,
        `Input: [3, [[0, 1], [0, 2], [1, 2]]]\n`,
        `Output: []`,
      ].join(" ");
    },
    generate: (): [number, [number, number][]] => {
      //Generate two partite sets
      const n = Math.floor(Math.random() * 5) + 3;
      const m = Math.floor(Math.random() * 5) + 3;

      //50% chance of spawning any given valid edge in the bipartite graph
      const edges: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          if (Math.random() > 0.5) {
            edges.push([i, n + j]);
          }
        }
      }

      //Add an edge at random with no regard to partite sets
      let a = Math.floor(Math.random() * (n + m));
      let b = Math.floor(Math.random() * (n + m));
      if (a > b) [a, b] = [b, a]; //Enforce lower numbers come first
      if (a != b && !edges.includes([a, b])) {
        edges.push([a, b]);
      }

      //Randomize array in-place using Durstenfeld shuffle algorithm.
      function shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

      //Replace instances of the original vertex names in-place
      const vertexShuffler = Array.from(Array(n + m).keys());
      shuffle(vertexShuffler);
      for (let i = 0; i < edges.length; i++) {
        edges[i] = [vertexShuffler[edges[i][0]], vertexShuffler[edges[i][1]]];
        if (edges[i][0] > edges[i][1]) {
          //Enforce lower numbers come first
          [edges[i][0], edges[i][1]] = [edges[i][1], edges[i][0]];
        }
      }

      //Shuffle the order of the edges themselves, as well
      shuffle(edges);

      return [n + m, edges];
    },
    solver: (data, answer) => {
      //Helper function to get neighbourhood of a vertex
      function neighbourhood(vertex: number): number[] {
        const adjLeft = data[1].filter(([a]) => a == vertex).map(([, b]) => b);
        const adjRight = data[1].filter(([, b]) => b == vertex).map(([a]) => a);
        return adjLeft.concat(adjRight);
      }

      const coloring: (1 | 0 | undefined)[] = Array<1 | 0 | undefined>(data[0]).fill(undefined);
      while (coloring.some((val) => val === undefined)) {
        //Color a vertex in the graph
        const initialVertex: number = coloring.findIndex((val) => val === undefined);
        coloring[initialVertex] = 0;
        const frontier: number[] = [initialVertex];

        //Propagate the coloring throughout the component containing v greedily
        while (frontier.length > 0) {
          const v: number = frontier.pop() || 0;
          const neighbors: number[] = neighbourhood(v);

          //For each vertex u adjacent to v
          for (const u of neighbors) {
            //Set the color of u to the opposite of v's color if it is new,
            //then add u to the frontier to continue the algorithm.
            if (coloring[u] === undefined) {
              if (coloring[v] === 0) coloring[u] = 1;
              else coloring[u] = 0;

              frontier.push(u);
            }

            //Assert u,v do not have the same color
            else if (coloring[u] === coloring[v]) {
              //If u,v do have the same color, no proper 2-coloring exists
              return answer.length === 0;
            }
          }
        }
      }

      return data[1].every(([a, b]) => answer[a] !== answer[b]);
    },
    convertAnswer: (ans) => {
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "");
      if (sanitized === "") return [];
      const arr = sanitized.split(",").map((s) => parseInt(s, 10));
      // An inline function is needed here, so that TS knows this returns true if it matches the type
      if (((a): a is (1 | 0)[] => !a.some((n) => n !== 1 && n !== 0))(arr)) return arr;
      return null;
    },
    validateAnswer: (ans): ans is (1 | 0)[] =>
      typeof ans === "object" && Array.isArray(ans) && !ans.some((a) => a !== 1 && a !== 0),
  },
  [CodingContractName.UniquePathsInAGridI]: {
    desc: (data: number[]): string => {
      const numRows = data[0];
      const numColumns = data[1];
      return [
        "You are in a grid with",
        `${numRows} rows and ${numColumns} columns, and you are`,
        "positioned in the top-left corner of that grid. You are trying to",
        "reach the bottom-right corner of the grid, but you can only",
        "move down or right on each step. Determine how many",
        "unique paths there are from start to finish.\n\n",
        "NOTE: The data returned for this contract is an array",
        "with the number of rows and columns:\n\n",
        `[${numRows}, ${numColumns}]`,
      ].join(" ");
    },
    difficulty: 3,
    generate: (): [number, number] => {
      const numRows: number = getRandomIntInclusive(2, 14);
      const numColumns: number = getRandomIntInclusive(2, 14);

      return [numRows, numColumns];
    },
    solver: (data, answer) => {
      const n: number = data[0]; // Number of rows
      const m: number = data[1]; // Number of columns
      const currentRow: number[] = [];
      currentRow.length = n;

      for (let i = 0; i < n; i++) {
        currentRow[i] = 1;
      }
      for (let row = 1; row < m; row++) {
        for (let i = 1; i < n; i++) {
          currentRow[i] += currentRow[i - 1];
        }
      }

      return currentRow[n - 1] === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.UniquePathsInAGridII]: {
    desc: (data: number[][]): string => {
      let gridString = "";
      for (const line of data) {
        gridString += `${line.toString()},\n`;
      }
      return [
        "You are located in the top-left corner of the following grid:\n\n",
        `${gridString}\n`,
        "You are trying reach the bottom-right corner of the grid, but you can only",
        "move down or right on each step. Furthermore, there are obstacles on the grid",
        "that you cannot move onto. These obstacles are denoted by '1', while empty",
        "spaces are denoted by 0.\n\n",
        "Determine how many unique paths there are from start to finish.\n\n",
        "NOTE: The data returned for this contract is an 2D array of numbers representing the grid.",
      ].join(" ");
    },
    difficulty: 5,
    generate: (): (1 | 0)[][] => {
      const numRows: number = getRandomIntInclusive(2, 12);
      const numColumns: number = getRandomIntInclusive(2, 12);

      const grid: (1 | 0)[][] = [];
      grid.length = numRows;
      for (let i = 0; i < numRows; ++i) {
        grid[i] = [];
        grid[i].length = numColumns;
        grid[i].fill(0);
      }

      for (let r = 0; r < numRows; ++r) {
        for (let c = 0; c < numColumns; ++c) {
          if (r === 0 && c === 0) {
            continue;
          }
          if (r === numRows - 1 && c === numColumns - 1) {
            continue;
          }

          // 15% chance of an element being an obstacle
          if (Math.random() < 0.15) {
            grid[r][c] = 1;
          }
        }
      }

      return grid;
    },
    solver: (data, answer) => {
      const obstacleGrid: number[][] = [];
      obstacleGrid.length = data.length;
      for (let i = 0; i < obstacleGrid.length; ++i) {
        obstacleGrid[i] = data[i].slice();
      }

      for (let i = 0; i < obstacleGrid.length; i++) {
        for (let j = 0; j < obstacleGrid[0].length; j++) {
          if (obstacleGrid[i][j] == 1) {
            obstacleGrid[i][j] = 0;
          } else if (i == 0 && j == 0) {
            obstacleGrid[0][0] = 1;
          } else {
            obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0);
          }
        }
      }

      return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1] === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
  [CodingContractName.ShortestPathInAGrid]: {
    desc: (data: number[][]): string => {
      return [
        "You are located in the top-left corner of the following grid:\n\n",
        `&nbsp;&nbsp;[${data.map((line) => `[${line}]`).join(",\n&nbsp;&nbsp;&nbsp;")}]\n\n`,
        "You are trying to find the shortest path to the bottom-right corner of the grid,",
        "but there are obstacles on the grid that you cannot move onto.",
        "These obstacles are denoted by '1', while empty spaces are denoted by 0.\n\n",
        "Determine the shortest path from start to finish, if one exists.",
        "The answer should be given as a string of UDLR characters, indicating the moves along the path\n\n",
        "NOTE: If there are multiple equally short paths, any of them is accepted as answer.",
        "If there is no path, the answer should be an empty string.\n",
        "NOTE: The data returned for this contract is an 2D array of numbers representing the grid.\n\n",
        "Examples:\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[[0,1,0,0,0],\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0,0,0,1,0]]\n",
        "\n",
        "Answer: 'DRRURRD'\n\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;[[0,1],\n",
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[1,0]]\n",
        "\n",
        "Answer: ''",
      ].join(" ");
    },
    difficulty: 7,
    generate: (): (1 | 0)[][] => {
      const height = getRandomIntInclusive(6, 12);
      const width = getRandomIntInclusive(6, 12);
      const dstY = height - 1;
      const dstX = width - 1;
      const minPathLength = dstY + dstX; // Math.abs(dstY - srcY) + Math.abs(dstX - srcX)

      const grid: (1 | 0)[][] = new Array<(1 | 0)[]>(height);
      for (let y = 0; y < height; y++) grid[y] = new Array<1 | 0>(width).fill(0);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (y == 0 && x == 0) continue; // Don't block start
          if (y == dstY && x == dstX) continue; // Don't block destination

          // Generate more obstacles the farther a position is from start and destination.
          // Raw distance factor peaks at 50% at half-way mark. Rescale to 40% max.
          // Obstacle chance range of [15%, 40%] produces ~78% solvable puzzles
          const distanceFactor = (Math.min(y + x, dstY - y + dstX - x) / minPathLength) * 0.8;
          if (Math.random() < Math.max(0.15, distanceFactor)) grid[y][x] = 1;
        }
      }

      return grid;
    },
    solver: (data, answer) => {
      const width = data[0].length;
      const height = data.length;
      const dstY = height - 1;
      const dstX = width - 1;

      const distance: number[][] = new Array<number[]>(height);
      //const prev: [[number, number] | undefined][] = new Array(height);
      const queue: [number, number][] = [];

      for (let y = 0; y < height; y++) {
        distance[y] = new Array<number>(width).fill(Infinity);
        //prev[y] = new Array(width).fill(undefined) as [undefined];
      }

      function validPosition(y: number, x: number): boolean {
        return y >= 0 && y < height && x >= 0 && x < width && data[y][x] == 0;
      }

      // List in-bounds and passable neighbors
      function* neighbors(y: number, x: number): Generator<[number, number]> {
        if (validPosition(y - 1, x)) yield [y - 1, x]; // Up
        if (validPosition(y + 1, x)) yield [y + 1, x]; // Down
        if (validPosition(y, x - 1)) yield [y, x - 1]; // Left
        if (validPosition(y, x + 1)) yield [y, x + 1]; // Right
      }

      // Prepare starting point
      distance[0][0] = 0;
      queue.push([0, 0]);

      // Take next-nearest position and expand potential paths from there
      while (queue.length > 0) {
        const [y, x] = queue.shift() as [number, number];
        for (const [yN, xN] of neighbors(y, x)) {
          if (distance[yN][xN] == Infinity) {
            queue.push([yN, xN]);
            distance[yN][xN] = distance[y][x] + 1;
          }
        }
      }

      if (!Number.isFinite(distance[dstY][dstX])) return answer === "";
      if (answer.length > distance[dstY][dstX]) return false;

      let ansX = 0;
      let ansY = 0;
      for (const direction of answer.split("")) {
        switch (direction) {
          case "U":
            ansY -= 1;
            break;
          case "D":
            ansY += 1;
            break;
          case "L":
            ansX -= 1;
            break;
          case "R":
            ansX += 1;
            break;
          default:
            return false;
        }
      }

      return ansX === dstX && ansY === dstY;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string =>
      typeof ans === "string" && ans.split("").every((c) => ["U", "D", "L", "R"].includes(c)),
  },
} satisfies Partial<CodingContractTypes>;
