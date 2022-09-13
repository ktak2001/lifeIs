import ShowPage from "../../components/ShowPage"
import Layout from "../../components/Layout"
import { isAuth, getCookie } from "../../helpers/auth"
import axios from "axios"
import { API } from "../../config"

const UserPage = ({ user, userData, similarLives }) => {
	return (
		<Layout user={user}>
			<ShowPage user={user} data={userData} livesList={similarLives} />
		</Layout>	
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user } = await isAuth(token)
		// console.log('user auth', user)
		const { data: { user: userData } } = await axios.post(`${API}/user/content`, {
			slug: ctx.query.slug
		})
		// console.log("userData", userData)
		const categories = userData.categories.map(el => el._id)
		// console.log('categories', categories)
		const { data: { similarLives } } = await axios.post(`${API}/similarLives`, {
			categories: categories !== undefined ? categories : [],
			getSimilarLives: true,
			thisId: userData._id
		})
		return {
			props: {
				user, userData, similarLives
			}
		}
	} catch (err) {
		console.log('err in userPage', err)
		return {
			props: {
				user: null, userData: null, similarLives:[]
			}
		}
	}
}

export default UserPage