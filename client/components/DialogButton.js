import { useState } from 'react';
import { Button, DialogActions, Dialog, DialogContent, DialogTitle, DialogContentText } from '@mui/material'
import { useRouter } from 'next/router';
import axios from 'axios';
import { API } from '../config';
import { getCookieFromBrowser, logout } from '../helpers/auth';

export default function DialogButton({ dataType, slug, setError, states, user }) {
	const router = useRouter()
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleButton = async () => {
		const token = getCookieFromBrowser('token')
		try {
			const { data: { success }} = await axios.delete(`${API}/${dataType}/${slug}`, {
				headers: {
					Authorization: `Bearer ${token}`
				},
				data: {
					user
				}
			})
			if (dataType === 'user') {
				logout()
			}
			router.push({   
				pathname: '/',
				query: { success }
			})
		} catch (err) {
			setError({ ...states, error: 'error deleting' })
		}
	}

	return (
		<div>
			<Button variant="outlined" onClick={handleClickOpen}>
				Delete
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{`Are you sure you want to Delete this ${dataType}?`}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleButton} autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
