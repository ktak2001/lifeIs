import { Grid, Box, Card, CardContent, CardMedia, Typography, CardActionArea, Divider, Chip, Autocomplete, TextField, Stack, IconButton } from "@mui/material"
import { useRouter } from 'next/router';
import * as React from 'react';

export default function FilterData({ list, selectLife, setList, defaultValues }) { // defaultValues: fulldata list, not just ids
	const router = useRouter()
	const handleChipClick = slug => {
		router.push(`${selectLife ? '/life' : '/category'}/${slug}`)
	}
	return (
		<Stack spacing={3} sx={{ width: 500 }}>
			<Autocomplete
				multiple
				defaultValue={defaultValues || []}
				id="tags-outlined"
				options={list}
				getOptionLabel={(option) => option.name}
				filterSelectedOptions
				renderInput={(params) => (
					<TextField
						{...params}
						label={selectLife ? 'Select Lives' : 'Select Categories'}
						placeholder={selectLife ? 'Lives' : 'Categories'}
						color='primary'
						sx={{
							input: { color: 'white' },
							label: { color: 'rgba(217, 217, 217, 0.4)' }
						}}
					/>
				)}
				onChange={(e, value) => {
					console.log('value', value)
					setList(value)
				}}
				renderTags={(tagValue, getTagProps) => {
					console.log('getTagProps', getTagProps)
					return tagValue.map((option, idx) => (
						<Chip
							{...getTagProps({ idx })}
							label={option.name}
							sx={{ color: 'yellow' }}
							onClick={() => handleChipClick(option.slug)}
							key={option._id}
						/>
					))
				}}
			/>
		</Stack>
	)
}