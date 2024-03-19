import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { BonusType, bonuses, formatBonusDescription, getBonusEffect, numberIsBonusValue } from '../BonusType'

interface IProps {
	completions: number;
	bonus: BonusType;
	setBonus(value: BonusType): void;
}

export function BonusSelector(props: IProps) {
	function onChange(event: SelectChangeEvent<number>) {
		const value = Number(event.target.value);
		if (!numberIsBonusValue(value)) throw new Error(`Chosen Bonus "${value}" does not exist.`);

		const data = bonuses.find(b => b.id === value);
		if (data === undefined) throw new Error(`Chosen Bonus "${value}" does not exist.`);

		props.setBonus(data);
	}

	return (
		<Select<number> onChange={onChange} value={props.bonus.id} sx={{ mx: 1, p: 1 }}>
			{bonuses.map(b => (
				<MenuItem key={String(b.id)} value={String(b.id)}>
					<BonusItem
						bonus={b}
						completions={props.completions}
					/>
				</MenuItem>
			))}
		</Select>
	)
}

interface ItemProps {
	bonus: BonusType,
	completions: number;
}

export function BonusItem({ bonus, completions }: ItemProps) {
	return (
		<>
		<Typography component="div">
			<Box sx={{ fontWeight: "bold" }}>{bonus.id} - {bonus.name}</Box>
			{formatBonusDescription(getBonusEffect(bonus, completions), bonus.description)}
		</Typography>
		</>
	)
}