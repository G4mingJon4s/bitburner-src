import React, { useRef, useState } from 'react'
import { Worm } from '../Worm';
import { Box, Button, Divider, List, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { NumberInput } from '../../ui/React/NumberInput';
import { Paper } from '@mui/material'; 
import { finishedWormSessions, getWormSession } from '../WormSession';
import { WormGuess } from '../Graph';
import { WormPreviousSessionDisplay } from './WormHistory';

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
	const [input, setInput] = useState("");
	const [state, setState] = useState("");
	const [reward, setReward] = useState("");
	const guess = useRef<WormGuess>({
		bipartite: false,
		path: "",
		value: -1,
		indegree: -1,
		dfsState: getWormSession(-1).graph.states[0]
	});

	function handleTest() {
		const session = getWormSession(-1);
		const result = session.evaluate(input);
		setState(result);
	}

	function handleSolve() {
		const session = getWormSession(-1);
		session.guess = { ...session.guess, ...guess.current };
		const sessionReward = session.solve(worm);
		setReward(sessionReward.toString());
	}

	return (
	<>
		<Typography><Box sx={{ fontWeight: "bold" }}>Session Information</Box></Typography>
		<Typography>Valid Symbols: "{getWormSession(-1).graph.symbols.join("")}"</Typography>
		<Typography>States: {getWormSession(-1).graph.states.at(0)} - {getWormSession(-1).graph.states.at(-1)}</Typography>
		<Stack direction="row" component="div" sx={{ alignItems: "center" }}>
			<TextField
				value={input}
				onChange={event => setInput(event.target.value)}
				onSubmit={handleTest}
				sx={{ mr: 1 }}
			/>
			<Button onClick={handleTest} sx={{ mr: 1}}>Submit</Button>
			{state !== "" && <Typography>Result: {state}</Typography>}
		</Stack>
		<Divider sx={{ my: 1.5 }}/>
		<Typography><Box sx={{ fontWeight: "bold" }}>Manual Input</Box></Typography>
		<Paper sx={{ my: 1, p: 1, "& > *": { mb: 1, mr: 1, alignItems: "center" } }}>
			<Stack direction="row">
				<Switch onChange={event => guess.current.bipartite = event.target.checked}/>
				<Typography>Bipartite</Typography>
			</Stack>
			<Stack direction="row">
				<TextField onChange={event => guess.current.path = event.target.value} sx={{ mr: 1 }} placeholder="ABCD"/>
				<Typography>Shortest Path</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={value => guess.current.value = value} sx={{ mr: 1 }} placeholder="0"/>
				<Typography>Node Value</Typography>
			</Stack>
			<Stack direction="row">
				<NumberInput onChange={indegree => guess.current.indegree = indegree} sx={{ mr: 1 }} placeholder="0"/>
				<Typography>Node Indegree</Typography>
			</Stack>
			<Stack direction="row">
				<Select<number>
					onChange={event => guess.current.dfsState = getWormSession(-1).graph.states[event.target.value as number]}
					defaultValue={0}
					sx={{ mr: 1, minWidth: 200 }}
				>
					{getWormSession(-1).graph.states.map(
						(state, index) => <MenuItem key={state} value={index}>{state}</MenuItem>
					)}
				</Select>
				<Typography>Depth-First-Search State</Typography>
			</Stack>
			<Stack direction="row">
				<Button disabled={false} onClick={handleSolve}>Guess</Button>
				{reward !== "" && <Typography>Reward: {reward}</Typography>}
			</Stack>
		</Paper>
		<Divider sx={{ my: 1.5 }}/>
		<Typography><Box sx={{ fontWeight: "bold" }}>Previous sessions</Box></Typography>
		<List dense>
			{Array.from(finishedWormSessions.values()).filter(session => session.pid === -1).map(
				session => <WormPreviousSessionDisplay key={session.startTime + "-" + session.finishTime ?? "DNF"} session={session}/>
			)}
		</List>
	</>
	);
}