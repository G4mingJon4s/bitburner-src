import { Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Worm } from "../Worm";
import { useRerender } from "../../ui/React/hooks";
import { WormEvents } from "../WormEvents";
import { WormInput } from "./WormInput";
import { WormHistory } from "./WormHistory";
import { WormHelp } from "./WormHelp";
import { WormOverview } from "./WormOverview";

interface IProps {
  worm: Worm | null;
}

export function WormRoot({ worm }: IProps): React.ReactElement {
  const possiblePages = ["Overview", "Input", "History", "Help"];
  const [currentPage, setCurrentPage] = useState(possiblePages[0]);
  const rerender = useRerender();
  useEffect(() => WormEvents.subscribe(rerender), [rerender]);

  if (worm === null) return <Typography>You shouldn't be here...</Typography>;

  return (
    <Container disableGutters sx={{ mx: 0 }}>
      <Tabs value={currentPage} onChange={(_, newPage) => setCurrentPage(newPage)}>
        {possiblePages.map((page) => (
          <Tab key={page} value={page} label={page} />
        ))}
      </Tabs>
      <Paper sx={{ p: 1 }}>
        {currentPage === possiblePages[0] && <WormOverview worm={worm}/>}
        {currentPage === possiblePages[1] && <WormInput worm={worm} />}
        {currentPage === possiblePages[2] && <WormHistory />}
				{currentPage === possiblePages[3] && <WormHelp />}
      </Paper>
    </Container>
  );
}
