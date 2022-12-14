import { Container, Grid, Box, IconButton, colors, Divider, Chip } from "@mui/material"
import parse from "html-react-parser"
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import CardList from "./CardList"
import { useState } from "react";
import { getCookieFromBrowser } from "../helpers/auth";
import axios from "axios";
import { API } from "../config";

export default function Content ({ user, data }) {
	const [like, setLike] = useState(user !== null ? user.livesILiked.includes(data._id) : false)
	const dataType = data.type
	const isMe = user !== null ? (user._id === data._id) : false

	const handleLike = async e => {
		console.log('event', e)
		const token = getCookieFromBrowser("token")
		try {
			const res = await axios.post(`${API}/user/update/like${dataType}`, {
				liked: !like,
				id: data._id
			}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			console.log("like: ", res.data)
			setLike(!like)
		} catch (err) {
			console.log('error', err)
		}
	}

	return (
		<Box sx={{ flexDirection: 'column', py: 5 }}>
			<Box sx={{ width: 1 }} >
				{parse(data.content || "")}

				{dataType !== 'category' && !isMe && user !== null && (<IconButton
					aria-label={`Like ${data.name}`}
					size="lg"
					variant="solid"
					sx={{
						overFlow: 'hidden',
						position: 'relative',
						zIndex: 2,
						borderRadius: '50%',
						left: '85%',
						minHeight: '6.5rem',
						minWidth: '6.5rem'
					}}
					onClick={e => handleLike(e)}
				>
					{like ? <Favorite sx={{ fontSize: '3.5rem' }} /> : <FavoriteBorder sx={{ fontSize: '3.5rem' }} />}
				</IconButton>)}
			</Box>
			{/* <Grid container>
				<CardList user={user} list={list} />
			</Grid> */}
		</Box>
	)
}