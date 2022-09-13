import { useState, useEffect, Fragment } from "react"
import axios from "axios"
import { API, APP_NAME } from "../../config"
import { isAuth } from "../../helpers/auth"
import { Container, Grid, Box, IconButton, colors, Divider } from "@mui/material"
import { getCookie, getCookieFromBrowser } from "../../helpers/auth"
import Layout from "../../components/Layout"
import ShowPage from "../../components/ShowPage"

const Life = ({ user, lifeData, similarLives }) => {
	return (
		<Layout user={user} slug={`/admin/life/update/${lifeData.slug}`} >
			<ShowPage user={user} data={lifeData} livesList={similarLives} />
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		const { data: {lifeData} } = await axios.post(`${API}/life/content`, {
			slug: ctx.query.slug
		})
		// console.log('user', user)
		// console.log("lifecontent", lifeData)
		const { data: { similarLives } } = await axios.post(`${API}/similarLives`, {
			categories: lifeData.categories,
			getSimilarLives: true,
			thisId: lifeData._id
		})
		return {
			props: {
				user, lifeData, similarLives
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default Life