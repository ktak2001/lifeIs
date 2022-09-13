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

export default function ShowPage({ user, data, livesList }) {
	const router = useRouter()
	const [tabValue, setTabValue] = useState('content');
	const isMe = user._id === data._id
	const dataType = data.type
	let listILiked = []
	if (dataType === 'user') {
		listILiked = data.usersILiked.concat(data.livesILiked)
	}

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
		// console.log(props.children)

		return (
			<div
				hidden={value !== tabValue}
				role="tabpanel"
				id={`simple-tabpanel-${value}`}
				aria-labelledby={`simple-tab-${value}`}
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
						src={data.image !== undefined ? (data.image.url || IMAGE_ON_ERROR) : IMAGE_ON_ERROR}
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
						{dataType !== 'category' && data.categories.map(ct => (
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
								<Tab label="Content" {...tabProps(0)} value='content' />
								<Tab label={dataType === 'category' ? 'Lives' : 'Similar Lives'} {...tabProps(1)} value='lives' />
								{
									dataType === 'user' && (<Tab label={`Lives ${data.name} liked`} {...tabProps(2)} value='livesUserLiked' />)
								}
								{
									dataType !== 'category' && (<Tab label="likedBy" {...tabProps(3)} value='likedBy' />)
								}
							</Tabs>
						</Box>
						<TabPanel value={tabValue} tabValue='content'>
							<Content user={user} data={data} />
						</TabPanel>
						<TabPanel value={tabValue} tabValue='lives'>
							<CardList list={livesList} user={user} />
						</TabPanel>
						{
							dataType === 'user' && (
								<TabPanel value={tabValue} tabValue='livesUserLiked' >
									<CardList list={listILiked} user={user} />
								</TabPanel>
							)
						}
						{
							dataType !== 'category' && (
								<TabPanel value={tabValue} tabValue='likedBy' >
									<CardList list={data.likedBy} user={user} />
								</TabPanel>
							)
						}
					</Box>
				</Grid>
			</Grid>
		</Container>
	)
}