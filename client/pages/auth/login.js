import { useState, useEffect } from "react"
import Router, { useRouter, withRouter } from "next/router"
import Layout from "../../components/Layout"
import axios from "axios"
import { showSuccessMessage, showErrorMessage } from '../../helpers/alerts';
import { API } from '../../config';
import { authenticate, getCookie, getCookieFromBrowser, isAuth } from '../../helpers/auth';
import { Grid } from "@mui/material";

const Login = ({ user }) => {
	const [state, setState] = useState({
		email: '',
		password: '',
		error: '',
		buttonText: 'Login'
	})

	const { email, password, error, buttonText } = state;

	const handleChange = name => e => {
		setState({ ...state, [name]: e.target.value, error: '', buttonText: 'Login' });
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setState({ ...state, buttonText: 'Logging in' });
		try {
			const response = await axios.post(`${API}/login`, {
				email,
				password
			});
			console.log(response); // data > token / user
			console.log("response: ", response.data.token)
			authenticate(response, () => {
			});
			const token = getCookieFromBrowser("token")
			console.log("getCookieFromBrowser", token)
			// response.data.tokenと、authenticateしたあとのtokenが違う!!!
			const { user } = await isAuth(response.data.token)
			user && Router.push("/")
		} catch (err) {
			console.log("err in Login", err);
			setState({ ...state, buttonText: 'Login', error: JSON.stringify(err) });
		}
	};

	const loginForm = () => (
		<form onSubmit={handleSubmit}>
			<div className="form-group">
				<input
					value={email}
					onChange={handleChange('email')}
					type="email"
					className="form-control"
					placeholder="Type your email"
					required
					style={{ height: '3rem' }}
				/>
			</div>
			<div className="form-group" style={{ paddingTop: '1rem' }} >
				<input
					value={password}
					onChange={handleChange('password')}
					type="password"
					className="form-control"
					placeholder="Type your password"
					required
					style={{ height: '3rem' }}
				/>
			</div>
			<div className="form-group" style={{ paddingTop: '2rem' }} >
				<button className="btn btn-outline-warning">{buttonText}</button>
			</div>
		</form>
	);

	return (
		<Layout user={user} >
			<div className="col-sm-8 offset-sm-2 col-xs-10 offset-xs-1" style={{ paddingTop: '3rem' }} >
				<h1>Login</h1>
				<br />
				{error && showErrorMessage(error)}
				{loginForm()}
			</div>
		</Layout>
	);
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user } = await isAuth(token)
		if (user !== null) {
			ctx.res.writeHead(200, {
				Location: '/'
			})
		}
		return {
			props : {
				user
			}
		}
	} catch (err) {
		console.log('err in LogIn')

	}
}

export default withRouter(Login);