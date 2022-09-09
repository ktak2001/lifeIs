import { useState, useEffect, Fragment } from "react"
import axios from "axios"
import { API, APP_NAME } from "../../config"
import { isAuth } from "../../helpers/auth"
import { Container, Grid, Box, IconButton, colors, Divider } from "@mui/material"
import { getCookie, getCookieFromBrowser } from "../../helpers/auth"
import ShowContent from '../../components/ShowContent'
import Layout from "../../components/Layout"

const Category = ({ user, isAdmin, categoryData, selectedLives }) => {
	return (
		<Layout authed={user !== undefined} isAdmin={isAdmin} slug={`/admin/category/update/${categoryData.slug}`} >
			<ShowContent
				user={user}
				data={categoryData}
				isLife={false}
				list={selectedLives}
			/>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	const { user, isAdmin } = await isAuth(token)
	const { data: categoryData } = await axios.post(`${API}/category/content`, {
		slug: ctx.query.slug
	})
	console.log('category data', categoryData)
	const { data: { selectedLives } } = await axios.post(`${API}/category/containedLives`, {
		category: categoryData
	})
	// console.log('lives in category/[slug]', selectedLives)
	return {
		props: {
			user, isAdmin, categoryData, selectedLives
		}
	}
}

export default Category;