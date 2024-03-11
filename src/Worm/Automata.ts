import { WormChosenValues } from "@nsdefs";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { depthFirstSearchEnumeration, isBipartite, nodeIndegree, nodeValue, shortestInput } from "./calculations";
import { generateGraph } from "./GraphGenerator";

export type WormSession = {
	data: WormData;

	startTime: number;
	finishTime: number | null;
} & ({
	pid: -1;
} | {
	pid: number;

	host: string;
	script: string;
})

export type WormData = {
	graph: GraphData;
	guess: WormGuess;
	params: WormChosenValues;
}

export interface WormGuess {
	path: string;
	bipartite: boolean;
	value: number;
	indegree: number;
	dfsState: string;
}

export interface GraphData {
	states: string[];
	symbols: string[];
	targetState: string;
	startState: string;
	transitions: Record<string, Record<string, string>>;
	properties: GraphProperties;
}

export interface GraphProperties {
	pathLength: number;
	bipartite: boolean;
	values: Record<string, number>;
	indegrees: Record<string, number>;
	dfsOrder: string[];
}

export const base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const chooseRandomState = (states: string[]) => states[Math.floor(Math.random() * states.length)];

export function WormDataFactory(completions: number): WormData {
	const numStates = getRandomInt(2, 5) * 3 + Math.floor(completions);
	const numSymbols = 2 + Math.floor(Math.log10(numStates + 1));

	const states = Array.from({ length: numStates }, (_, i) => "s" + i.toString().padStart(Math.ceil(Math.log10(numStates)), "0"));
	const symbols = base64Characters.split("", numSymbols);

	const transitions = generateGraph(states, symbols);

	const graph: Omit<GraphData, "properties"> = {
		states,
		targetState: states[states.length - 1],
		startState: states[0],
		symbols,
		transitions
	};

	const properties = calculateProperties(graph);

	return {
		graph: {
			...graph,
			properties
		},
		guess: {
			path: "",
			value: -1,
			indegree: -1,
			bipartite: false,
			dfsState: ""
		},
		params: {
			indegree: chooseRandomState(states),
			value: chooseRandomState(states),
			dfsOrder: Math.floor(Math.random() * states.length)
		}
	};
}

export function calculateProperties(graph: Omit<GraphData, "properties">): GraphProperties {
	const bipartite = isBipartite(graph.transitions);
	const input = shortestInput(graph.transitions, graph.startState, graph.targetState);

	const values: Record<string, number> = {};
	const degrees: Record<string, number> = {};
	graph.states.forEach(state => {
		values[state] = nodeValue(graph.transitions, state, graph.states);
		degrees[state] = nodeIndegree(graph.transitions, state);
	});

	const dfs = depthFirstSearchEnumeration(graph.transitions, graph.startState, graph.symbols);

	return {
		pathLength: input.length,
		bipartite: bipartite,
		values: values,
		indegrees: degrees,
		dfsOrder: dfs
	}
}

export function evaluateInput(graph: GraphData, input: string) {
	let currentState = graph.startState;

	for (let i = 0; i < input.length; i++) {
		if (currentState === undefined) break;
		currentState = graph.transitions[currentState]?.[input[i]];
	}

	if (currentState === undefined) return "snull"
	return currentState;
}

// left here for debugging purposes, used to transform graph for online visualization sites
function __graphRepToAdj(graph: Record<string, Record<string, string>>, states: string[]) {
  const out: string[] = [];

  for (const row of states) {
    const values = states.map(col => Object.values(graph[row]).includes(col) ? "1" : "0");
    out.push(values.join(", "));
  }

  return out.join("\n");
}