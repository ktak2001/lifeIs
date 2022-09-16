import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate"

const EditLife = ({ lifeData, allCategories, user }) => <CreateOrUpdate data={lifeData} list={allCategories} isCreate={false} isLife={true} user={user} key={lifeData._id} />

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		if (!isAdmin) {
			ctx.res.writeHead(302, {
				Location: `/lives/${ctx.query.slug}`
			})
		}
		const { data: { lifeData } } = await axios.post(`${API}/life/content`, {
			slug: ctx.query.slug
		})
		const { data: { allCategories } } = await axios.get(`${API}/categories`)
		// console.log("allLives", categories)
		return {
			props: {
				user, lifeData, allCategories
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default EditLife;