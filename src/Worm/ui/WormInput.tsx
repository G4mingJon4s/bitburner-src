import React, { useRef, useState } from 'react'
import { Worm } from '../Worm';
import { Button, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { isValidInput } from '../Automata';
import { NumberInput } from '../../ui/React/NumberInput';
import { Paper } from '@mui/material'; 

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
	const [input, setInput] = useState("");
	const [state, setState] = useState("");
	const [result, setResult] = useState("");
	const values = useRef({
		path: "",
		bipartite: false,
		value: 0,
		indegree: 0,
		dfsState: ""
	});

	function handleTest() {
		if (!isValidInput(worm.data, input)) return;
		const result = worm.evaluate(input);
		if (result === null) setState("INVALID");
		else setState(result);
	}

	function handleSolve() {
		worm.providedValues = values.current;
		const result = worm.solve();
		setResult(result.toString());
	}

	return (
	<>
		<Typography>Valid Symbols: "{worm.data.symbols.join("")}"</Typography>
		<Stack direction="row">
			<TextField
				value={input}
				onChange={event => setInput(event.target.value)}
				onSubmit={handleTest}
			/>
			<Button disabled={!isValidInput(worm.data, input)} onClick={handleTest}>Submit</Button>
			{state !== "" && <Typography>Result: {state}</Typography>}
		</Stack>
		<Typography>Chosen "Value" Node: {worm.userValues.value}</Typography>
		<Typography>Chosen "Indegree" Node: {worm.userValues.indegree}</Typography>
		<Typography>Chosen Depth-First-Search Index: {worm.userValues.depthFirstSearchEnumeration}</Typography>
		<Paper sx={{ p: 1, "& > *": { mb: 1, mr: 1, alignItems: "center" } }}>
			<Stack direction="row">
				<Switch onChange={event => values.current.bipartite = event.target.checked}/>
				<Typography>Bipartite</Typography>
			</Stack>
			<Stack direction="row">
				<TextField onChange={event => values.current.path = event.target.value} sx={{ mr: 1 }} placeholder="ABCD"/>
				<Typography>Shortest Path</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={value => values.current.value = value} sx={{ mr: 1 }} defaultValue={0} placeholder="0"/>
				<Typography>Node Value</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={indegree => values.current.indegree = indegree} sx={{ mr: 1 }} defaultValue={0} placeholder="0"/>
				<Typography>Node Indegree</Typography>
			</Stack>
			<Stack direction="row">
				<Select<number> onChange={event => values.current.dfsState = worm.data.states[event.target.value as number]} defaultValue={0} sx={{ mr: 1, minWidth: 200 }}>
					{worm.data.states.map((state, index) => <MenuItem key={state} value={index}>{state}</MenuItem>)}
				</Select>
				<Typography>Depth-First-Search State</Typography>
			</Stack>
			<Stack direction="row">
				<Button disabled={false} onClick={handleSolve}>Guess</Button>
				{result !== "" && <Typography>Reward: {result}</Typography>}
			</Stack>
		</Paper>
	</>
	);
}