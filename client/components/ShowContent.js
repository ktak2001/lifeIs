import Link from "next/link"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { autocompleteClasses, CssBaseline } from "@mui/material"
import { Container, Grid, Box, IconButton, colors, Divider, Chip } from "@mui/material"
import ReactDOM from "react-dom"
import parse from "html-react-parser"
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Content from './Content'
import { useRouter } from "next/router"
import { IMAGE_ON_ERROR } from "../config"


export default function ShowContent ({ user, data, isLife }) {
	const router = useRouter()
	const handleListClick = slug => {
		if (typeof window !== 'undefined') {
			router.push(`/${isLife ? 'category' : 'life'}/${slug}`)
		}
	}

	return (
		<Container maxWidth="lg">
			<Grid container spacing={4} sx={{ py: 5 }} >
				<Grid item xs={12} md={5} >
					<Box
						component='img'
						src={data.image.url || IMAGE_ON_ERROR}
						sx={{
							height: 300,
							width: 'auto',
							borderColor: colors.blue[200],
							borderRadius: '15%'
						}}
					/>
				</Grid>
				<Grid item xs={12} md={7}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							flexWrap: "wrap",
							justifyContent: "space-evenly",
							p: 1,
							m: 1
						}}
					>
						{isLife && data.categories.map(ct => (
							<Box>
							<Chip
								label={ct.name}
								onClick={() => handleListClick(ct.slug)}
							/>
							</Box>
						))}
						{!isLife && data.lives.map(lv => (
							<Box>
								<Chip
									label={lv.name}
									onClick={() => handleListClick(lv.slug)}
								/>
							</Box>
						))}
					</Box>
				</Grid>
			</Grid>
			<Divider variant='middle' />
			<Content user={user} data={data} />
		</Container>
	)
}