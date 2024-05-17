import { Button, Divider, Typography } from "@mui/material"
import React, { useState } from "react"
import { Worm } from "../Worm"
import { formatNumber, formatPercent } from "../../ui/formatNumber";
import { WormBonusModal } from "./WormBonusModal";
import { formatBonusDescription, getBonusEffect } from "../BonusType";

interface IProps {
	worm: Worm;
}

export function WormOverview({ worm }: IProps) {
	const [bonusModalOpen, setBonusModalOpen] = useState(false);

	return (
		<>
			<Typography variant="h5">Overview</Typography>
			<Typography>
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
			<Typography variant="h5">Bonus</Typography>
			<Typography>Current Completions: {formatNumber(worm.completions)}</Typography>
			<br />
			<Typography>Current Bonus: {worm.bonus.name} (#{worm.bonus.id})</Typography>
			<Typography>
				Effect: {formatBonusDescription(getBonusEffect(worm.bonus, worm.completions), worm.bonus.description)}
			</Typography>
			<Typography>Maximum: {formatPercent(worm.bonus.g)}</Typography>
			<br />
			<WormBonusModal worm={worm} open={bonusModalOpen} onClose={() => setBonusModalOpen(false)}/>
			<Button onClick={() => setBonusModalOpen(true)}>Change Bonus</Button>
		</>
	)
}
