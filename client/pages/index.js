import Layout from "../components/Layout"
import { API, IMAGE_ON_ERROR } from '../config'
import { getCookie, getCookieFromBrowser } from '../helpers/auth'
import { isAuth } from '../helpers/auth'
import axios from 'axios'
import CardList from '../components/CardList'
import { Box, Grid } from "@mui/material"
import CarouselView from "../components/CarouselView"

const Home = ({user, lives}) => {
	return (
		<Layout user={user} >
			{
				lives !== undefined && lives.length > 0 && <CarouselView list={lives} />
			}
			<Grid container sx={{ px: 5 }} >
				<CardList user={user} list={lives} />
			</Grid>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie("token", ctx.req)
	try {
		const {user, isAdmin} = await isAuth(token)
		const { data: {lives} } = await axios.get(`${API}/ranking`)
		console.log('user', user)
		console.log('isAdmin', isAdmin)
		console.log('data', lives)
		return {
			props: {
				user,
				lives
			}
		}
	} catch (err) {
		console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', err)
		return {
			props: {
				
			}
		}
	}
}

export default Home;

// memo: authmiddlewareで統一し、adminmiddlewareは後半部分だけを追加する感じ。/admin行って、req.headers.cookieあるか確認