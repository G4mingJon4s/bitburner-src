import { Box, Collapse, Divider, List, ListItemButton, ListItemText, Paper, Table, TableCell, TableRow, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react'
import { useRerender } from '../../ui/React/hooks';
import { WormSessionEvents } from '../WormEvents';
import { wormPreviousSessions, wormSessions } from '../WormSessions';
import { AutomataSession } from '../Automata';
import { workerScripts } from '../../Netscript/WorkerScripts';
import { convertTimeMsToTimeElapsedString } from '../../utils/StringHelperFunctions';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

export function WormHistory() {
	const rerender = useRerender();

	useEffect(() => WormSessionEvents.subscribe(() => rerender()));

	return (
		<>
			<Typography>History</Typography>
			<List dense>
				{Array.from(wormSessions.entries()).map(
					entry => <WormSessionDisplay key={entry[0] +  " " + entry[1].startTime} session={{ pid: entry[0], ...entry[1] }}/>
				)}
			</List>
			<Divider />
			<List dense>
				{wormPreviousSessions.map(
					session => <WormPreviousSessionDisplay key={session.pid + " " + session.startTime} session={session}/>
				)}
			</List>
		</>
	);
}

const useStyles = makeStyles({
	noBorder: {
		borderBottom: "none"
	}
});

export function WormSessionDisplay({ session }: { session: AutomataSession & { pid: number } }) {
	const [open, setOpen] = useState(false);
	const classes = useStyles();

	if (session.pid === -1) return null;
	if (session.done) return null;

	const workerScript = workerScripts.get(session.pid);
	if (workerScript === undefined) return null;

	return (
    <Box component={Paper}>
      <ListItemButton onClick={() => setOpen((old) => !old)}>
        <ListItemText primary={
					<Typography style={{ whiteSpace: "pre-wrap" }}>
						Host: {workerScript.hostname} - Script: {workerScript.scriptRef.filename} 
					</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2}>
        <Collapse in={open} timeout={0} unmountOnExit>
					<Table padding="none" size="small">
						<TableRow>
							<TableCell className={classes.noBorder}>
                <Typography>└ Time elapsed:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{convertTimeMsToTimeElapsedString(Date.now() - session.startTime)}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Amount of states:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.states.length}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Alphabet:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.symbols.join(", ")}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Current guess:</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>Shortest Input</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Bipartite</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Value</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Indegree</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Depth First Search State</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>"{session.guess.path}"</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.bipartite ? "true" : "false"}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.value}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.indegree}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.dfsState || "None"}</Typography>
							</TableCell>
						</TableRow>
					</Table>
        </Collapse>
      </Box>
    </Box>
	);
}

export function WormPreviousSessionDisplay({ session }: { session: AutomataSession & { pid: number } }) {
	const [open, setOpen] = useState(false);
	const classes = useStyles();

	return (
    <Box component={Paper}>
      <ListItemButton onClick={() => setOpen((old) => !old)}>
        <ListItemText primary={
					<Typography style={{ whiteSpace: "pre-wrap" }}>
						Host: {"HOST HERE"} - Script: {"SCRIPT HERE"} 
					</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Box mx={2}>
        <Collapse in={open} timeout={0} unmountOnExit>
					<Table padding="none" size="small">
						{session.finishTime && <TableRow>
							<TableCell className={classes.noBorder}>
                <Typography>└ Time spent:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{convertTimeMsToTimeElapsedString(session.finishTime - session.startTime)}</Typography>
							</TableCell>
						</TableRow>}
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Amount of states:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.states.length}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Alphabet:</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.symbols.join(", ")}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Final guess:</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>Shortest Input</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Bipartite</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Value</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Indegree</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Depth First Search State</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>"{session.guess.path}"</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.bipartite ? "true" : "false"}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.value}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.indegree}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.guess.dfsState || "None"}</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder}>
								<Typography>└ Correct properties:</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>Shortest Input</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Bipartite</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Value</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Node Indegree</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>Depth First Search State</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className={classes.noBorder} />
							<TableCell className={classes.noBorder}>
								<Typography>"{session.data.properties.shortestInput}"</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.properties.isBipartite ? "true" : "false"}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.properties.nodeValues[session.params.value]}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.properties.nodeIndegrees[session.params.indegree]}</Typography>
							</TableCell>
							<TableCell className={classes.noBorder}>
								<Typography>{session.data.properties.depthFirstSearchEnumeration[session.params.depthFirstSearchEnumeration] || "None"}</Typography>
							</TableCell>
						</TableRow>
					</Table>
        </Collapse>
      </Box>
    </Box>
	);
}