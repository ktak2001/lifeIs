import { Grid, Box, Card, CardContent, CardMedia, Typography, CardActionArea, Divider, Chip, Autocomplete, TextField, Stack, IconButton } from "@mui/material"
import axios from "axios"
import { isAuth } from "../../helpers/auth"
import { getCookie } from "../../helpers/auth"
import { useState, useEffect } from "react"
import FilterData from "../../components/FilterData"
import CardList from "../../components/CardList"
import Layout from '../../components/Layout'
import { API } from "../../config"

const multiCategories = ({ user, onlyIdCategories, allLives, allCategories }) => {
	const selectedCategories = allCategories.filter(el => onlyIdCategories.includes(el._id))
	const [lives, setLives] = useState([])
	const [categories, setCategories] = useState(selectedCategories !== undefined ? selectedCategories : []) // full data
	useEffect(() => {
		const tmpLives = {}
		console.log('categories', categories)
		for (let idx = 0; idx < categories.length; idx++) {
			categories[idx].lives.forEach(id => {
				tmpLives[id] !== undefined ? tmpLives[id] += 1 : tmpLives[id] = 1
			})
		}
		// console.log('allLives', allLives)
		const filtered = Object.keys(tmpLives).filter(id => tmpLives[id] === categories.length)
		// console.log('filtered', filtered)
		// console.log('allLives.map(el => el._id)', allLives.map(el => el._id))
		let filteredFull = filtered.map(id => allLives[allLives.map(el => el._id).indexOf(id)])
		console.log(filteredFull)
		if (categories.length === 0) {
			filteredFull = allLives
		}
		setLives(filteredFull)
	}, [categories])

	return (
		<Layout user={user} inCategoriesPage={true} >
			<Grid container direction='column' justifyContent='space-evenly' alignItems='center' key={user._id} >
				<Grid item sx={{ pt: 6 }}>
					<FilterData list={allCategories} selectLife={false} setValues={setCategories} values={categories} />
				</Grid>
				<Divider variant='middle'  sx={{ bgcolor: 'black' }} />
				<Grid item sx={{ pt: 3, px: 5 }} container >
				<CardList user={user} list={lives} />
				</Grid>
			</Grid>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		let onlyIdCategories = ctx.query.multiSlugs.split(',')
		console.log('onlyIdCategories', onlyIdCategories)
		if (onlyIdCategories[0] === 'notSelected') {
			onlyIdCategories = []
		}
		const { data: { allLives }} = await axios.get(`${API}/lives`)
		const { data: { categories: allCategories }} = await axios.get(`${API}/categories`)
		return {
			props: {
				onlyIdCategories, // full data, not just ids
				user,
				allLives,
				allCategories
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default multiCategories