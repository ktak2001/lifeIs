import { useState, useEffect, Fragment } from "react"
import axios from "axios"
import { API, APP_NAME } from "../../config"
import { isAuth } from "../../helpers/auth"
import { Container, Grid, Box, IconButton, colors, Divider } from "@mui/material"
import { getCookie, getCookieFromBrowser } from "../../helpers/auth"
import ShowContent from '../../components/ShowContent'
import Layout from "../../components/Layout"

const Life = ({ user, isAdmin, data, similarLives }) => {
	console.log("user.likedLives", typeof user.likedLives[0])
	console.log('data._id', typeof data._id)
	return (
		<Layout authed={user !== undefined} isAdmin={isAdmin} slug={`/admin/life/update/${data.slug}`} >
			<ShowContent
				user={user}
				data={data}
				isLife={true}
				list={similarLives}
			/>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	console.log("ctx.query.slug", ctx.query.slug)
	const { user, isAdmin } = await isAuth(token)
	const { data: {life: lifeData} } = await axios.post(`${API}/life/content`, {
		slug: ctx.query.slug
	})
	console.log("lifecontent", lifeData)
	const categories = lifeData.categories.map(el => el._id)
	console.log('categories', categories)
	const { data: { similarLives } } = await axios.post(`${API}/similarLives`, {
		categories: categories !== undefined ? categories : [],
		getSimilarLives: true
	})
	const filteredSimilarLives = similarLives.filter(el => typeof el !== 'undefined' && el !== null)
	const idx = filteredSimilarLives.findIndex(el => el._id === lifeData._id)
	console.log('similarLives', filteredSimilarLives)
	console.log('lifeData._id', lifeData._id)
	if (idx > -1) {
		filteredSimilarLives.splice(idx, 1)
	}
	return {
		props: {
			user, isAdmin, data: lifeData, similarLives: filteredSimilarLives
		}
	}
}

export default Life