import { Grid, Box, Card, CardContent, CardMedia, Typography, CardActionArea, Divider, Chip, Autocomplete, TextField, Stack, IconButton } from "@mui/material"
import { useRouter } from 'next/router';
import React, {useEffect, useState} from 'react';

export default function FilterData({ list, selectLife, setValues, values }) { // defaultValues: fulldata list, not just ids
	const [sortedList, setSortedList] = useState(list)
	const router = useRouter()
	useEffect(() => {
		setSortedList(list.sort((a, b) => a.pronounce.localeCompare(b.pronounce)))
	}, [])
	const handleChipClick = slug => {
		// router.push(`${selectLife ? '/life' : '/category'}/${slug}`) // real
		router.push(`/admin${selectLife ? '/life' : '/category'}/update/${slug}`)
		// TODO
	}
	const handleOnChange = (e, v) => {
		console.log('vales', v)
		setValues(v)
	}
	const handleChipDelete = (id) => {
		const newValues = values.filter(el => el._id !== id)
		setValues(newValues)
	}
	return (
		<Stack spacing={3} sx={{ width: 500 }}>
			<Autocomplete
				multiple
				value={values !== undefined ? values : []}
				id="tags-outlined"
				options={sortedList}
				groupBy={option => (option.pronounce !== undefined ? option.pronounce[0] : 'a')}
				getOptionLabel={(option) => option.name}
				filterSelectedOptions
				renderInput={(params) => (
					<TextField
						{...params}
						label={selectLife ? 'Select Lives' : 'Select Categories'}
						placeholder={selectLife ? 'Lives' : 'Categories'}
						color='primary'
						sx={{
							// input: { color: 'white' },
							label: { color: 'rgba(217, 217, 217, 0.4)' }
						}}
					/>
				)}
				onChange={handleOnChange}
				renderTags={(tagValue, getTagProps) => {
					return tagValue.map((option, idx) => (
						<Chip
							// {...getTagProps({ idx })}
							label={option.name}
							sx={{ color: 'yellow' }}
							onClick={() => handleChipClick(option.slug)}
							onDelete={() => handleChipDelete(option._id)}
							key={option._id}
						/>
					))
				}}
			/>
		</Stack>
	)
}