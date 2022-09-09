import '../styles/globals.css'
import { SSRProvider } from 'react-aria'

function MyApp({ Component, pageProps }) {

	return (
		<SSRProvider>
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossOrigin="anonymous" />
			<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
			<Component {...pageProps} />
		</SSRProvider>
	)
}

export default MyApp
