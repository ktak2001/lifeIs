import axios from "axios";
import CreateOrUpdate from "../../../components/CreateOrUpdate";
import { API } from "../../../config";
import { isAuth, getCookie } from "../../../helpers/auth";

const UpdateUser = ({ user, userData, allCategories }) => {
	return (
		<CreateOrUpdate data={userData} list={allCategories} isCreate={false} isLife={true} user={user} />
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
		const { data: { allCategories } } = await axios.get(`${API}/categories`)
		return {
			props: {
				user, userData, allCategories
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default UpdateUser;