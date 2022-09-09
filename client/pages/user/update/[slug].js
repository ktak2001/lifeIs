import axios from "axios";
import CreateOrUpdate from "../../../components/CreateOrUpdate";
import { API } from "../../../config";
import { isAuth, getCookie } from "../../../helpers/auth";

const UpdateUser = ({ user, userData, similarLives }) => {
	return (
		<CreateOrUpdate data={userData} list={similarLives} isCreate={false} isLife={true} user={user} />
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		const { data: { user: userData} } = await axios.post(`${API}/user/content`, {
			slug: ctx.query.slug
		})
		if (!isAdmin && user._id !== userData._id) {
			ctx.res.writeHead(302, {
				Location: `/category/${ctx.query.slug}`
			})
			ctx.res.end()
		}
		const categories = userData.categories.map(el => el._id)
		console.log('categories', categories)
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
		console.log(err)
	}
}

export default UpdateUser;