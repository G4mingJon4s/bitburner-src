import React, { useState } from 'react'
import { Worm } from '../Worm';
import { Button, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { NumberInput } from '../../ui/React/NumberInput';
import { Paper } from '@mui/material'; 
import { endWormSession, getWormSession } from '../WormSessions';

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
	const [input, setInput] = useState("");
	const [state, setState] = useState("");
	const [result, setResult] = useState("");

	function handleTest() {
		const session = getWormSession(-1);
		const result = worm.evaluate(session, input);
		if (result === null) setState("INVALID");
		else setState(result);
	}

	function handleSolve() {
		const session = getWormSession(-1);
		const result = worm.solve(session);
		endWormSession(-1);
		setResult(result.toString());
	}

	return (
	<>
		<Typography>Valid Symbols: "{getWormSession(-1).data.graph.symbols.join("")}"</Typography>
		<Stack direction="row">
			<TextField
				value={input}
				onChange={event => setInput(event.target.value)}
				onSubmit={handleTest}
			/>
			<Button onClick={handleTest}>Submit</Button>
			{state !== "" && <Typography>Result: {state}</Typography>}
		</Stack>
		<Paper sx={{ p: 1, "& > *": { mb: 1, mr: 1, alignItems: "center" } }}>
			<Stack direction="row">
				<Switch onChange={event => getWormSession(-1).data.guess.bipartite = event.target.checked}/>
				<Typography>Bipartite</Typography>
			</Stack>
			<Stack direction="row">
				<TextField onChange={event => getWormSession(-1).data.guess.path = event.target.value} sx={{ mr: 1 }} placeholder="ABCD"/>
				<Typography>Shortest Path</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={value => getWormSession(-1).data.guess.value = value} sx={{ mr: 1 }} placeholder="0"/>
				<Typography>Node Value</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={indegree => getWormSession(-1).data.guess.indegree = indegree} sx={{ mr: 1 }} placeholder="0"/>
				<Typography>Node Indegree</Typography>
			</Stack>
			<Stack direction="row">
				<Select<number> onChange={event => getWormSession(-1).data.guess.dfsState = getWormSession(-1).data.graph.states[event.target.value as number]} defaultValue={0} sx={{ mr: 1, minWidth: 200 }}>
					{getWormSession(-1).data.graph.states.map((state, index) => <MenuItem key={state} value={index}>{state}</MenuItem>)}
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