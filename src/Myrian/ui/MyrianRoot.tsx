import React from "react";
import { Container, IconButton, Typography } from "@mui/material";

import { myrian } from "../Myrian";
import { useRerender } from "../../ui/React/hooks";
import { Info } from "@mui/icons-material";
import { Grid } from "./Grid";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";

export const MyrianRoot = (): React.ReactElement => {
  useRerender(50);

  const onHelp = () => Router.toPage(Page.Documentation, { docPage: "advanced/myrian.md" });
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">
        Myrian OS
        <IconButton onClick={onHelp}>
          <Info />
        </IconButton>
      </Typography>
      <Typography>
        {myrian.vulns} vulns : {myrian.totalVulns} total vulns
      </Typography>
      <Grid />
    </Container>
  );
};
