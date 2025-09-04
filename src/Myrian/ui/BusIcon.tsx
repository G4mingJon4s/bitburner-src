import React from "react";
import { defaultIconStyle } from "./common";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { styled } from "@mui/styles";
import { Bus } from "@nsdefs";
import { TooltipContent } from "./TooltipContent";
import { DeviceTooltip } from "./DeviceTooltip";
import { TooltipEnergy } from "./TooltipEnergy";
import { Typography } from "@mui/material";

const Template = styled(DirectionsBusIcon)(defaultIconStyle);
const Icon = <Template />;

interface IBusIconProps {
  bus: Bus;
}

export const BusIcon = ({ bus }: IBusIconProps): React.ReactElement => (
  <DeviceTooltip device={bus} icon={Icon}>
    <Typography>Movement: {bus.upgrades.movement}</Typography>
    <Typography>Transfer: {bus.upgrades.transfer}</Typography>
    <Typography>Reduce: {bus.upgrades.reduce}</Typography>
    <Typography>Install: {bus.upgrades.install}</Typography>
    <TooltipEnergy device={bus} />
    <TooltipContent device={bus} />
  </DeviceTooltip>
);
