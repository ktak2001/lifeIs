import * as React from 'react';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { IconButton, Link, Typography, CardContent, CardCover, Card } from '@mui/joy';
import { colors } from '@mui/material';

export default function LifeCard({ src, name, like, likedNumber, slug }) {
	return (
		<Card
			sx={{
				minHeight: 230,
				minWidth: 180,
				overflow: 'hidden',
				'&:hover img': {
					transform: 'scale(1.3)',
					transitionDuration: '0.5s'
				},
				'& img' : {
					width: '100%',
					transitionDuration: '0.5s'
				}
			}}
		>
			<CardCover>
				<img
					src={src}
					alt={name}
				/>
			</CardCover>
			<CardCover
				sx={{
					background:
						'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 320px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 300px)',
				}}
			/>
			<CardContent sx={{ justifyContent: 'flex-end' }}>
				<Typography level="h2" fontSize="lg" mb={1} textColor={colors.blue[100]}>
					{name}
				</Typography>
				<Typography startDecorator={like ? <Favorite /> : <FavoriteBorder />} textColor="neutral.300">
					{likedNumber}
				</Typography>
				<Link href={slug} overlay />
			</CardContent>
		</Card>
	);
}
