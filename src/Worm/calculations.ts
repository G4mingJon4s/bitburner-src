import { Player } from "@player";
import { Multipliers, defaultMultipliers, mergeMultipliers } from "../PersonObjects/Multipliers";
import { getMultiplier } from "./BonusType";
import { Worm } from "./Worm";
import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";

export const wormSourceFilePower = (lvl: number) => (Math.pow(lvl, 3) / 120) - (Math.pow(lvl, 2) / 20) + (17 * lvl / 120); // 0 -> 0; 1 -> 0.1; 2 -> 0.15; 3 -> 0.2

export const WORM_SOLVE_COOLDOWN = 5000;
export const WORM_UI_NAME = "worm-ui";

export const getGuessTime = (threads: number) => (60 * 1000 / (threads * calculateIntelligenceBonus(Player.skills.intelligence, 1))) * (1 - wormSourceFilePower(Player.sourceFileLvl(16)));

export function updateWormMults(): void {
	const mults = calculateWormMults(Player.worm);
	Player.mults = mergeMultipliers(Player.mults, mults);
	Player.updateSkillLevels();
}

function calculateWormMults(worm: Worm | null): Multipliers {
	if (worm === null) return defaultMultipliers();

	const effect = getMultiplier(worm.bonus, worm.completions);

	if (effect === null) {
		return defaultMultipliers();
	} else {
		return effect;
	}
}

export function isBipartite(graph: Record<string, Record<string, string>>) {
  const sets = new Map<string, boolean>();

  function dfs(node: string, currentSet: boolean) {
    if (sets.has(node)) {
      return sets.get(node) === currentSet;
    }

    sets.set(node, currentSet);

    for (const edge in graph[node]) {
      const neighbor = graph[node][edge];
      if (!dfs(neighbor, !currentSet)) {
        return false;
      }
    }

    return true;
  }

  for (const vertex in graph) {
    if (!sets.has(vertex)) {
      if (!dfs(vertex, false)) {
        return false;
      }
    }
  }

  return true;
}

export function nodeIndegree(graph: Record<string, Record<string, string>>, node: string): number {
	let count = 0;
	for (const edge in graph) {
		for (const vertex in graph[edge]) {
			count += Number(graph[edge][vertex] === node);
		}
	}

	return count;
}

export function nodeValue(graph: Record<string, Record<string, string>>, node: string, orderedNodes: string[]): number {
	const startingValue = orderedNodes.indexOf(node);
	if (startingValue === -1) throw new Error(`Edge ${node} is not present in the list of ordered nodes.`);
	const values: number[] = [];
	for (const vertex in graph[node]) {
		const index = orderedNodes.indexOf(graph[node][vertex]);
		if (index === -1) throw new Error(`Edge ${graph[node][vertex]} is not present in the list of ordered nodes.`);
		values.push(index - startingValue);
	}
	return Math.max(...values);
}

export function shortestInput(graph: Record<string, Record<string, string>>, startingNode: string, targetNode: string) {
	// Dijkstra using a simple array
	let unvisited = Object.keys(graph).filter(s => s !== startingNode);

	const distances: Record<string, number> = {};
	const paths: Record<string, string> = {};
	for (const edge in graph) {
		distances[edge] = Number.MAX_SAFE_INTEGER;
		paths[edge] = "";
	}
	distances[startingNode] = 0;

	let currentNode = startingNode;

	while (distances[targetNode] === Number.MAX_SAFE_INTEGER && unvisited.length > 0) {
		for (const vertex in graph[currentNode]) {
			const newDistance = distances[currentNode] + 1;
			if (distances[graph[currentNode][vertex]] > newDistance) {
				distances[graph[currentNode][vertex]] =  newDistance;
				paths[graph[currentNode][vertex]] = paths[currentNode] + vertex;
			}
		}
		unvisited = unvisited.filter(s => s !== currentNode);
		currentNode = unvisited.reduce((acc, cur) => distances[acc] > distances[cur] ? cur : acc);
	}

	return paths[targetNode];
}

export function depthFirstSearchEnumeration(graph: Record<string, Record<string, string>>, startingState: string, orderedSymbols: string[]) {
	const order: string[] = [];

	function dfs(state: string) {
		if (order.includes(state)) return;
		order.push(state);
		for (const connection of orderedSymbols) {
			if (graph[state][connection] !== undefined) {
				dfs(graph[state][connection]);
			}
		}
	}

	dfs(startingState);
	return order;
}