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
		const filteredFull = filtered.map(id => allLives[allLives.map(el => el._id).indexOf(id)])
		console.log(filteredFull)
		setLives(filteredFull)
	}, [categories])

	return (
		<Layout user={user}>
			<Grid container direction='column' justifyContent='space-evenly' alignItems='center'>
				<Grid item sx={{ pt: 6 }}>
					<FilterData list={allCategories} selectLife={false} setList={setCategories} defaultValues={selectedCategories} />
				</Grid>
				<Divider variant='middle' />
				<CardList user={user} list={lives} />
			</Grid>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		const onlyIdCategories = ctx.query.multiSlugs.split(',')
		console.log('onlyIdCategories', onlyIdCategories)
		const { data: { lives: allLives }} = await axios.get(`${API}/lives`)
		const { data: { categories: allCategories }} = await axios.get(`${API}/categories`)
		const selectedCategories = allCategories.filter(el => onlyIdCategories.includes(el._id))
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