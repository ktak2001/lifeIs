import { getCookie, isAuth } from "../../../../helpers/auth";
import axios from "axios";
import { API } from "../../../../config";
import CreateOrUpdate from "../../../../components/CreateOrUpdate";

const CreateCategory = ({ lives, user }) => <CreateOrUpdate data={{}} list={lives} isCreate={true} isLife={false} user={user} />

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
		const { data: { lives } } = await axios.get(`${API}/lives`)
		return {
			props: {
				lives, user
			}
		}
	} catch (err) {
		console.log(err)
	}
}

export default CreateCategory;