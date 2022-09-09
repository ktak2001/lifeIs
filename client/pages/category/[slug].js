import { useState, useEffect, Fragment } from "react"
import axios from "axios"
import { API, APP_NAME } from "../../config"
import { isAuth } from "../../helpers/auth"
import { Container, Grid, Box, IconButton, colors, Divider } from "@mui/material"
import { getCookie, getCookieFromBrowser } from "../../helpers/auth"
import ShowContent from '../../components/ShowContent'
import Layout from "../../components/Layout"
import ShowPage from "../../components/ShowPage"

const Category = ({ user, categoryData }) => {
	return (
		<Layout user={user} slug={`/admin/category/update/${categoryData.slug}`} >
			<ShowPage user={user} data={categoryData} />
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		const { data: categoryData } = await axios.post(`${API}/category/content`, {
			slug: ctx.query.slug
		})
		console.log('category data', categoryData)
		return {
			props: {
				user, categoryData
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default Category;