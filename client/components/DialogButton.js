import { useState } from 'react';
import { Button, DialogActions, Dialog, DialogContent, DialogTitle, DialogContentText } from '@mui/material'
import { useRouter } from 'next/router';
import axios from 'axios';
import { API } from '../config';
import { getCookieFromBrowser } from '../helpers/auth';

export default function DialogButton({ isLife, slug, setError, states }) {
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
		const { data: { success, error }} = await axios.delete(`${API}/${isLife ? 'life' : 'category'}/${slug}`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		if (success !== undefined) {
			router.push({
				pathname: '/',
				query: { success }
			})
		} else {
			setError({ ...states, error }	)
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
					{`Are you sure you want to Delete this ${isLife ? 'Life' : 'Category'}?`}
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
