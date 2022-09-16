import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate";

const CreateCategory = ({ allLives, user }) => <CreateOrUpdate data={{}} list={allLives} isCreate={true} isLife={false} user={user} />

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	try {
		const {user, isAdmin} = await isAuth(token)
		if (!isAdmin) {
			ctx.res.writeHead(302, {
				Location: "/"
			});
			ctx.res.end();
		}
		const { data: { allLives } } = await axios.get(`${API}/lives`)
		return {
			props: {
				allLives, user
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default CreateCategory;