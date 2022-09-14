import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import axios from "axios"
import { getCookie, getCookieFromBrowser } from "../helpers/auth"
import { useState, useEffect } from "react"
import { isAuth, logout } from "../helpers/auth"
import Router, { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Autocomplete, colors, IconButton, Box, InputLabel, MenuItem, FormControl, Select, TextField } from "@mui/material"
import { Filter, Search } from '@mui/icons-material'
import FilterData from './FilterData';
import { API } from '../config';

Router.onRouteChangeStart = url => NProgress.start();
Router.onRouteChangeComplete = url => NProgress.done();
Router.onRouteChangeError = url => NProgress.done();

const Layout = ({ children, slug, user, inCategoriesPage }) => {
	const authed = user !== null
	let isAdmin = false
	if (user !== null) {
		isAdmin = user.role === 'admin'
	}

	const [selectLife, setSelectLife] = useState(inCategoriesPage !== undefined)
	const [allCategories, setAllCategories] = useState([]) // full
	const [allLives, setAllLives] = useState([]) //full
	const [selectedLife, setLife] = useState('') // full
	const [selectedCategories, setCategories] = useState([]) // id
	const router = useRouter()
	const handleCategorySubmit = e => {
		e.preventDefault()
		if (selectedCategories.length === 0) {
			router.push({
				pathname: '/categories/[multiSlugs]',
				query: { multiSlugs: 'notSelected' }
			})
		} else {
			router.push({
				pathname: '/categories/[multiSlugs]',
				query: { multiSlugs: selectedCategories.map(el => el._id) }
			})
		}
		// router.push('/categories/')
	}
	const handleLifeSubmit = e => {
		e.preventDefault()
		console.log(e)
		router.push({
			pathname: '/life/[slug]',
			query: { slug: selectedLife.slug }
		})
	}
	const handleSelectLife = e => {
		setSelectLife(e.target.value === 'Life' ? true : false)
	}
	const getCategories = async () => {
		const { data: { categories } } = await axios.get(`${API}/categories`)
		setAllCategories(categories)
	}
	const getLives = async () => {
		const { data: { lives } } = await axios.get(`${API}/lives`)
		setAllLives(lives)
	}
	useEffect(() => {
		getCategories(), getLives()
	}, [])


	return (
		<div style={{ backgroundColor: colors.cyan[50], minHeight: '100vh' }} className='flex-fill' >
			<Navbar variant="dark" expand="lg" bg='dark' >
				<Container fluid className='justify-content-between' >
					<Navbar.Brand href="/">Life Is</Navbar.Brand>
					<Navbar.Toggle aria-controls="navbar" />
					<Navbar.Collapse id="responsive-navbar-nav" >
						<Nav
							className="me-auto my-2 my-lg-0"
						>
							{
								!authed &&
								(
									<>
										<Nav.Link href="/auth/login">Log In</Nav.Link>
										<Nav.Link href="/auth/register">Register</Nav.Link>
									</>
								)
							}
							{
								authed && (
									<>
										<Nav.Link href={`/user/${user.slug}`}>myPage</Nav.Link>
									</>
								)
							}
							{
								isAdmin && (
									<NavDropdown title="Admin" id="basic-nav-dropdown">
										<NavDropdown.Item href="/admin/life/create">Create Life</NavDropdown.Item>
										<NavDropdown.Item href="/admin/category/create">
											Create Category
										</NavDropdown.Item>
										{
											slug && (
												<>
													<NavDropdown.Divider />
													<NavDropdown.Item href={slug}>
														Edit
													</NavDropdown.Item>
												</>
											)
										}
									</NavDropdown>
								)
							}
						</Nav>
						<Nav className="my-2 my-lg-0 align-items-center pe-2">
							<Box sx={{ minWidth: 120 }}>
								<FormControl fullWidth>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										value={selectLife ? 'Life' : 'Category'}
										onChange={handleSelectLife}
										sx={{
											color: 'white'
										}}
									>
										<MenuItem value={'Life'}>Life</MenuItem>
										{
											inCategoriesPage === undefined && (<MenuItem value={'Category'}>Category</MenuItem>)
										}
									</Select>
								</FormControl>
							</Box>
							<Form className='d-flex' onSubmit={selectLife ? handleLifeSubmit : handleCategorySubmit} >
								<div className='pe-2' >
								{
									!selectLife ? (
									<FilterData list={allCategories} selectLife={false} setValues={setCategories} values={selectedCategories} />
									) : (
										<Autocomplete
											onChange={(event, newValue) => {
												// console.log('newValue: ', newValue)
												setLife(newValue)
											}}
											id="controllable-states-demo"
											options={allLives}
											getOptionLabel={option => option.name}
											sx={{ width: 500 }}
											renderInput={(params) => <TextField {...params} label="Select Life"
											placeholder='Select Life'
											color='primary'
											sx={{
												input: { color: 'white' },
												label: { color: 'rgba(217, 217, 217, 0.4)' }
											}}
											/>}
										/>
									)
								}
								</div>
								<Button variant='outline-success' type='submit'>Search</Button>
							</Form>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<div>
				{children}
			</div>
		</div>
	);
}

export default Layout;