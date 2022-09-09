import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate"

const EditCategory = ({ data, list, user }) => <CreateOrUpdate data={data} list={list} isCreate={false} isLife={false} user={user} />

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	console.log("ctx.query.slug", ctx.query.slug)
	try {
		const { user, isAdmin } = await isAuth(token)
		if (!isAdmin) {
			ctx.res.writeHead(302, {
				Location: `/category/${ctx.query.slug}`
			})
			ctx.res.end()
		}
		const { data } = await axios.post(`${API}/category/content`, {
			slug: ctx.query.slug
		})
		const { data: { lives } } = await axios.get(`${API}/lives`)
		// console.log("allLives", lives)
		return {
			props: {
				user, isAdmin, data, list: lives
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default EditCategory;