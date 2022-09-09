import ShowUserPage from "../../components/ShowUserPage"
import Layout from "../../components/Layout"
import { isAuth, getCookie } from "../../helpers/auth"
import axios from "axios"
import { API } from "../../config"

const UserPage = ({ user, userData, similarLives, isAdmin }) => {
	return (
		<Layout user={user}>
			<ShowUserPage user={user} userData={userData} similarLives={similarLives} />
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	console.log("ctx.query.slug", ctx.query.slug)
	try {
		const { user, isAdmin } = await isAuth(token)
		const { data: { user: userData } } = await axios.post(`${API}/user/content`, {
			slug: ctx.query.slug
		})
		console.log("lifecontent", userData)
		const categories = userData.categories.map(el => el._id)
		console.log('categories', categories)
		const { data: { similarLives } } = await axios.post(`${API}/similarLives`, {
			categories: categories !== undefined ? categories : [],
			getSimilarLives: true
		})
		const filteredSimilarLives = similarLives.filter(el => typeof el !== 'undefined' && el !== null)
		const idx = filteredSimilarLives.findIndex(el => el._id === userData._id)
		console.log('similarLives', filteredSimilarLives)
		console.log('lifeData._id', userData._id)
		if (idx > -1) {
			filteredSimilarLives.splice(idx, 1)
		}
		return {
			props: {
				user, isAdmin, userData, similarLives: filteredSimilarLives
			}
		}
	} catch (err) {
		console.log('err in UserPage', err)
	}
}

export default UserPage