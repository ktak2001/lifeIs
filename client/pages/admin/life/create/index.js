import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate"

const CreateLife = ({ categories, user }) => <CreateOrUpdate data={{}} list={categories} isCreate={true} isLife={true} user={user} />

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	try {
		const { user, isAdmin } = await isAuth(token)
		const { data: { categories } } = await axios.get(`${API}/categories`)
		if (!isAdmin) {
			ctx.res.writeHead(302, {
				Location: "/"
			});
			ctx.res.end();
		}
		return {
			props: {
				categories,
				user
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default CreateLife;