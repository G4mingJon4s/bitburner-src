import React, { useRef, useState } from "react";
import { Worm } from "../Worm";
import { Button, Divider, List, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { NumberInput } from "../../ui/React/NumberInput";
import { Paper } from "@mui/material";
import { finishedWormSessions, getWormSession, serverCanSolveWorm } from "../WormSession";
import { WormGuess } from "../Graph";
import { WormPreviousSessionDisplay } from "./WormHistory";
import { WORM_UI_NAME } from "../calculations";
import { makeStyles } from "@mui/styles";

interface IProps {
  worm: Worm;
}

const inputStyles = makeStyles((theme: Theme) => ({
	history: {
		overflowY: "scroll",
		height: "45vh",
		width: "100%",
	},
	paramsText: {
		color: theme.palette.info.main,
	},
	cricticalInfoText: {
		color: theme.palette.info.light,
	},
}));

export function WormInput({ worm }: IProps) {
	const classes = inputStyles();

  const [input, setInput] = useState("");
  const [state, setState] = useState("");
  const [reward, setReward] = useState("");
  const guess = useRef<WormGuess>({
    bipartite: false,
    path: "",
    value: -1,
    indegree: -1,
    dfsState: getWormSession(-1).graph.states[0],
  });

  const canSolve = serverCanSolveWorm(WORM_UI_NAME);

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
      <Typography variant="h5">Session Information</Typography>
      <Typography className={classes.cricticalInfoText}>Valid Symbols: "{getWormSession(-1).graph.symbols.join("")}"</Typography>
      <Typography className={classes.cricticalInfoText}>
        States: {getWormSession(-1).graph.states.at(0)} - {getWormSession(-1).graph.states.at(-1)}
      </Typography>
			<Typography className={classes.paramsText}>
				Chosen state for "node value": {getWormSession(-1).params.value}
			</Typography>
			<Typography className={classes.paramsText}>
				Chosen state for "node indegree": {getWormSession(-1).params.indegree}
			</Typography>
			<Typography className={classes.paramsText}>
				Chosen index for "DFS-Enumeration": {getWormSession(-1).params.dfsOrder}
			</Typography>
			<br />
			<Typography>Symbol input</Typography>
      <Stack direction="row" component="div" sx={{ alignItems: "center" }}>
        <TextField
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onSubmit={handleTest}
          sx={{ mr: 1 }}
        />
        <Button onClick={handleTest} sx={{ mr: 1 }}>
          Submit
        </Button>
        {state !== "" && <Typography>Result: {state}</Typography>}
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="h5">Propeties Input</Typography>
      <Paper sx={{ my: 1, p: 1, "& > *": { mb: 1, mr: 1, alignItems: "center" } }}>
        <Stack direction="row">
          <Switch onChange={(event) => (guess.current.bipartite = event.target.checked)} />
          <Typography>Bipartite</Typography>
        </Stack>
        <Stack direction="row">
          <TextField
            onChange={(event) => (guess.current.path = event.target.value)}
            sx={{ mr: 1 }}
            placeholder="ABCD"
          />
          <Typography>Shortest Path</Typography>
        </Stack>
        <Stack direction="row">
          <NumberInput onChange={(value) => (guess.current.value = value)} sx={{ mr: 1 }} placeholder="0" />
          <Typography>Node Value</Typography>
        </Stack>
        <Stack direction="row">
          <NumberInput onChange={(indegree) => (guess.current.indegree = indegree)} sx={{ mr: 1 }} placeholder="0" />
          <Typography>Node Indegree</Typography>
        </Stack>
        <Stack direction="row">
          <Select<number>
            onChange={(event) =>
              (guess.current.dfsState = getWormSession(-1).graph.states[event.target.value as number])
            }
            defaultValue={0}
            sx={{ mr: 1, minWidth: 200 }}
          >
            {getWormSession(-1).graph.states.map((state, index) => (
              <MenuItem key={state} value={index}>
                {state}
              </MenuItem>
            ))}
          </Select>
          <Typography>Depth-First-Search State</Typography>
        </Stack>
        <Stack direction="row">
          <Button disabled={!canSolve} onClick={handleSolve}>
            Solve
          </Button>
          {reward !== "" && <Typography sx={{ ml: 1.5 }}>Reward: {reward}</Typography>}
        </Stack>
      </Paper>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="h5">Previous sessions</Typography>
      <List dense className={classes.history}>
				{finishedWormSessions.every(session => session.pid !== -1) && <Typography>You have not finished any Worm sessions manually...</Typography>}
        {finishedWormSessions.filter((session) => session.pid === -1).map((session) => (
					<WormPreviousSessionDisplay key={session.startTime + "-" + session.finishTime ?? "DNF"} session={session} />
        ))}
      </List>
    </>
  );
}
