import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {useRouter} from 'next/router';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../../helpers/alerts';
import { API } from '../../config';
import { getCookie, isAuth } from '../../helpers/auth';

const Register = ({user}) => {
	const [state, setState] = useState({
		name: 'kazuki',
		email: 'kazuki.tkh@gmail.com',
		password: 'kkkkkk',
		error: '',
		success: '',
		buttonText: 'Register'
	});

	const { name, email, password, error, success, buttonText } = state;

	const handleChange = name => e => {
		setState({ ...state, [name]: e.target.value, error: '', success: '', buttonText: 'Register' });
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setState({ ...state, buttonText: 'Registering' });
		try {
			// console.log("Hello")
			const response = await axios.post(`${API}/register`, {
				name,
				email,
				password
			});
			// console.log(response);
			setState({
				...state,
				name: '',
				email: '',
				password: '',
				buttonText: 'Submitted',
				success: response.data.message
			});
		} catch (error) {
			console.log(error);
			setState({ ...state, buttonText: 'Register', error: error.response.data.error });
		}
	};

	const registerForm = () => (
		<form onSubmit={handleSubmit}>
			<div className="form-group">
				<input
					value={name}
					onChange={handleChange('name')}
					type="text"
					className="form-control"
					placeholder="Type your name"
					required
				/>
			</div>
			<div className="form-group">
				<input
					value={email}
					onChange={handleChange('email')}
					type="email"
					className="form-control"
					placeholder="Type your email"
					required
				/>
			</div>
			<div className="form-group">
				<input
					value={password}
					onChange={handleChange('password')}
					type="password"
					className="form-control"
					placeholder="Type your password"
					required
				/>
			</div>
			<div className="form-group">
				<button className="btn btn-outline-warning">{buttonText}</button>
			</div>
		</form>
	);

	return (
		<Layout user={user} >
			<div className="col-md-6 offset-md-3">
				<h1>Register</h1>
				<br />
				{success && showSuccessMessage(success)}
				{error && showErrorMessage(error)}
				{registerForm()}
			</div>
		</Layout>
	);
};


export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user } = await isAuth(token)
		console.log('user', user)
		if (user !== null) {
			ctx.res.writeHead(200, {
				Location: '/'
			})
		}
		return {
			props: {
				user
			}
		}
	} catch (err) {
		console.log('err in Register', err)
	}
}

export default Register;
