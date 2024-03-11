import { WormChosenValues } from "@nsdefs";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { depthFirstSearchEnumeration, isBipartite, nodeIndegree, nodeValue, shortestInput } from "./calculations";
import { generateGraph } from "./GraphGenerator";

export type AutomataSession = {
	data: AutomataData;
	guess: AutomataGuess;
	params: WormChosenValues;
} & ({
	done: false,
	startTime: number;
	finishTime: null;
} | {
	done: true,
	startTime: number,
	finishTime: number;
})

export interface AutomataGuess {
	path: string;
	bipartite: boolean;
	value: number;
	indegree: number;
	dfsState: string;
}

export interface AutomataData {
	states: string[];
	symbols: string[];
	targetState: string;
	startState: string;
	transitions: Record<string, Record<string, string>>;
	properties: AutomataProperties;
}

export interface AutomataProperties {
	isBipartite: boolean;
	shortestInput: number;
	nodeValues: Record<string, number>;
	nodeIndegrees: Record<string, number>;
	depthFirstSearchEnumeration: string[];
}

export const base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const chooseRandomState = (states: string[]) => states[Math.floor(Math.random() * states.length)];

export function AutomataFactory(completions: number): AutomataSession {
	const numStates = getRandomInt(2, 5) * 3 + Math.floor(completions);
	const numSymbols = 2 + Math.floor(Math.log10(numStates + 1));

	const states = Array.from({ length: numStates }, (_, i) => "s" + i.toString().padStart(Math.ceil(Math.log10(numStates)), "0"));
	const symbols = base64Characters.split("", numSymbols);

	const transitions = generateGraph(states, symbols);

	const data: Omit<AutomataData, "properties"> = {
		states,
		targetState: states[states.length - 1],
		startState: states[0],
		symbols,
		transitions
	};

	const properties = calculateProperties(data);

	return {
		data: {
			...data,
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
			depthFirstSearchEnumeration: Math.floor(Math.random() * states.length)
		},
		done: false,
		startTime: Date.now(),
		finishTime: null
	};
}

export function calculateProperties(data: Omit<AutomataData, "properties">): AutomataProperties {
	const bipartite = isBipartite(data.transitions);
	const input = shortestInput(data.transitions, data.startState, data.targetState);

	const values: Record<string, number> = {};
	const degrees: Record<string, number> = {};
	data.states.forEach(state => {
		values[state] = nodeValue(data.transitions, state, data.states);
		degrees[state] = nodeIndegree(data.transitions, state);
	});

	const depthFirstSearch = depthFirstSearchEnumeration(data.transitions, data.startState, data.symbols);

	return {
		isBipartite: bipartite,
		shortestInput: input.length,
		nodeValues: values,
		nodeIndegrees: degrees,
		depthFirstSearchEnumeration: depthFirstSearch
	}
}

export function evaluateInput(data: AutomataData, input: string) {
	let currentState = data.startState;

	for (let i = 0; i < input.length; i++) {
		if (currentState === undefined) break;
		currentState = data.transitions[currentState]?.[input[i]];
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