import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate"

const EditLife = ({ data, list, user }) => <CreateOrUpdate data={data} list={list} isCreate={false} isLife={true} user={user} />

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	const { user, isAdmin } = await isAuth(token)
	if (!isAdmin) {
		ctx.res.writeHead(302, {
			Location: `/lives/${ctx.query.slug}`
		})
	}
	const { data } = await axios.post(`${API}/life/content`, {
		slug: ctx.query.slug
	})
	const { data: { categories } } = await axios.get(`${API}/categories`)
	// console.log("allLives", categories)
	return {
		props: {
			user, isAdmin, data, list: categories
		}
	}
}

export default EditLife;