import { Grid, Box } from "@mui/material"
import LifeCard from "./LifeCard"
import { IMAGE_ON_ERROR } from "../config"

const CardList = ({ user, list }) => {
	// console.log('user in cardlist', user)
	// console.log('list in cardlist', list)
	// 
	return (
		// <Box sx={{ py: 3 }} >
		<Grid container spacing={2} sx={{ py: 3 }} item >
			{
				list !== undefined && list.length > 0 && list.map(el => {
					let href = 'category'
					switch (el.type) {
						case 'life':
							href = 'life'
							break ;
						case 'user':
							href = 'user'
					}
					return (
					<Grid item xs={6} sm={4} md={3} lg={2} key={el._id} >
						<LifeCard
							src={el.image !== undefined ? el.image.url : IMAGE_ON_ERROR}
							name={el.name}
							like={user !== null ? user.livesILiked.includes(el._id) : false }
							likedNumber={el.likedBy !== undefined ? el.likedBy.length : 0}
							slug={`/${href}/${el.slug}`}
							lifeId={el._id}
						/>
					</Grid>
				)
				})
			}
		</Grid>
		// </Box>
	)
}

export default CardList;