import { Box, Divider, Typography } from "@mui/material"
import React from "react"
import { BonusSelector } from "./BonusSelector"
import { Worm } from "../Worm"
import { formatNumber } from "../../ui/formatNumber";

interface IProps {
	worm: Worm;
}

export function WormOverview({ worm }: IProps) {
	return (
		<>
			<Typography>
				<Box sx={{ fontWeight: "bold" }}>Overview</Box>
        The Worm is a highly complex program that infected the entire bitnode and created a giant network of resources.
        <br />
        Simulating the behaviour of the virus gives you access to a small portion of its wealth.
        <br />
        Though the program is not easily decieved, emulating the way it calculates the networks properties allows you to
        bypass most of its security measures.
        <br />
        It is your task to develop a program that can solve the networks properties as efficient as possible.
			</Typography>
			<Divider sx={{ my: 1.5 }}/>
			<Typography>
				<Box sx={{ fontWeight: "bold" }}>Bonus</Box>
			</Typography>
			<Typography>Current Completions: {formatNumber(worm.completions)}</Typography>
			<BonusSelector
				completions={worm.completions}
				bonus={worm.bonus}
				setBonus={b => worm.bonus = b}
			/>
		</>
	)
}
