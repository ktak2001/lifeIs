import { Container, Grid, Box, IconButton, colors, Divider, Chip, Tabs, Tab, Button } from "@mui/material"
import ReactDOM from "react-dom"
import parse from "html-react-parser"
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import CardList from "./CardList"
import { useRouter } from "next/router"
import Content from "./Content";
import { useState } from "react";
import { IMAGE_ON_ERROR } from "../config";
import { Link } from "@mui/material";

export default function ShowUserPage({ user, userData, similarLives }) {
	const router = useRouter()
	const [tabValue, setTabValue] = useState(0);
	const isMe = user._id === userData._id

	const handleListClick = slug => {
		if (typeof window !== 'undefined') {
			router.push(`/category/${slug}`)
		}
	}
	const handlePageChange = (e, newValue) => {
		setTabValue(newValue);
	};
	const TabPanel = (props) => {
		const { children, value, tabValue } = props;
		console.log(props.children)

		return (
			<div
				role="tabpanel"
				hidden={value !== tabValue}
				id={`simple-tabpanel-${tabValue}`}
				aria-labelledby={`simple-tab-${tabValue}`}
			>
				{value === tabValue && children}
			</div>
		);
	}
	function tabProps(index) {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		};
	}

	return (
		<Container maxWidth="lg">
			<Grid container spacing={4} sx={{ py: 5 }} >
				<Grid item xs={12} md={5} >
					<Box
						component='img'
						src={userData.image !== undefined ? userData.image.url : IMAGE_ON_ERROR}
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
						{userData.categories.map(ct => (
							<Box>
								<Chip
									label={ct.name}
									onClick={() => handleListClick(ct.slug)}
								/>
							</Box>
						))}
					</Box>
				</Grid>
				<Grid item>
					{
						isMe && (
							<Button
								variant='contained'
								component={Link}
								href={`/user/update/${user.slug}`}
							>
								Edit
							</Button>
						)
					}
				</Grid>
				<Grid item xs={12}>
					<Box sx={{ width: '100%' }}>
						<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
							<Tabs value={tabValue} onChange={handlePageChange} aria-label="basic tabs example">
								<Tab label="myContent" {...tabProps(0)} />
								<Tab label="similarLives" {...tabProps(1)} />
								<Tab label="livesILiked" {...tabProps(2)} />
								<Tab label="likedBy" {...tabProps(3)} />
							</Tabs>
						</Box>
						<TabPanel value={tabValue} tabValue={0}>
							<Content user={user} data={userData} />
						</TabPanel>
						<TabPanel value={tabValue} tabValue={1}>
							<CardList list={similarLives} user={user} />
						</TabPanel>
						<TabPanel value={tabValue} tabValue={2}>
							<CardList list={userData.livesILiked} user={user} />
						</TabPanel>
						<TabPanel value={tabValue} tabValue={3}>
							<CardList list={userData.likedBy} user={user} />
						</TabPanel>
					</Box>
				</Grid>
			</Grid>
		</Container>
	)
}