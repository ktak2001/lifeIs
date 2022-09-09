import Carousel from 'react-bootstrap/Carousel'
import { IMAGE_ON_ERROR } from '../config';
import { colors, Typography } from '@mui/material';

const CarouselView = ({ list }) => {
	return (
		<Carousel fade>
			{
				list.map(el => (
					<Carousel.Item key={el._id}>
						<img
							className='d-block w-100'
							src={el.image ? el.image.url : IMAGE_ON_ERROR}
							alt={el.name}
							style={{
								maxHeight: '50vh',
								objectFit: 'cover'
							}}
						/>
						<Carousel.Caption>
							<Typography href={`/life/${el.slug}`} level="h1" fontSize='2rem' mb={1} color={colors.blue[100]} >
								{el.name}
							</Typography>
						</Carousel.Caption>
						<a href={`/lives/${el.slug}`} className='stretched-link' />
					</Carousel.Item>
				))
			}
		</Carousel>
	)
}

export default CarouselView;