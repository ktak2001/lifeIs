import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import { API } from '../../../config';
import { withRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { getCookie, isAuth } from '../../../helpers/auth';
import { useRouter } from 'next/router'

const ActivateAccount = ({ router, user }) => {
	const [state, setState] = useState({
		name: '',
		token: '',
		buttonText: 'Activate Account',
		success: '',
		error: ''
	});
	const { name, token, buttonText, success, error } = state;

	useEffect(() => {
		let token = router.query.id;
		if (token) {
			const {name} = jwt.decode(token);
			setState({ ...state, name, token })
		}
	}, [router])

	const clickSubmit = async e => {
		e.preventDefault();
		setState({ ...state, buttonText: 'Activating...' });

		try {
			const res = await axios.post(`${API}/register/activate`, {
				token
			});
			setState({
				error: '', name: '', token: '', buttonText: 'Activated!', success: res.data.message
			});
		} catch (err) {
			setState({
				...state, buttonText: 'Activate Account', error: err.response.data.error
			});
		}
	}
	
	return (
		<Layout user={user} >
			<div className='row'>
				<div className='col-md-6 offset-md-3'>
					<h1>G'day {name}, Ready to activate your account?</h1>
					<br />
					{success && showSuccessMessage(success)}
					{error && showErrorMessage(error)}
					<button className="btn btn-outline-warning btn-block" onClick={clickSubmit}>
						{buttonText}
					</button>
				</div>
			</div>
		</Layout>
	)
}

export async function getServerSideProps(ctx) {
	const token = getCookie('token', ctx.req)
	try {
		const { user } = await isAuth(token)
		if (user !== null) {
			ctx.res.writeHead(200, {
				Location: "/"
			});
			ctx.res.end();
		}
		return {
			props: {
				user
			}
		}
	} catch (err) {
		console.log('err in LogIn', err)
		return {
			props: {
				user: null
			}
		}
	}
}

export default withRouter(ActivateAccount);