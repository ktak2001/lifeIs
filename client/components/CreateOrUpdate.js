import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import Layout from "./Layout";
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import Resizer from 'react-image-file-resizer';
import axios from "axios";
import { API, IMAGE_ON_ERROR } from "../config";
import { showErrorMessage, showSuccessMessage } from "../helpers/alerts";
import { getCookieFromBrowser } from "../helpers/auth";
import 'react-quill/dist/quill.snow.css';
import { Grid } from "@mui/material";
import FilterData from "./FilterData";
import DialogButton from './DialogButton'

const CreateOrUpdate = ({ data, list, isCreate, isLife, user }) => {
	const { lives, categories } = data
	let dataType = ''
	if (!isCreate) {
		dataType = data.type
	} else {
		dataType = isLife ? 'life' : 'category'
	}
	// console.log("data", data)
	const imageUrl = data.image !== undefined ? data.image.url : ""
	const [states, setState] = useState({
		name: data.name || "",
		error: "",
		success: "",
		buttonText: isCreate ? 'Create' : 'Update',
		image: imageUrl
	})
	const [values, setValues] = useState([])
	const [content, setContent] = useState(data.content || '')
	const [imageUploadButtonName, setImageUploadButtonName] = useState('Upload Image')
	const { name, error, success, buttonText, image } = states

	useEffect(() => {
		const chk = dataType !== 'category' ? categories : lives
		const mappedChk = chk.map(el => el._id)
		const filtered = list.filter(el => mappedChk.includes(el._id))
		setValues(filtered)
	}, [])

	const handleChange = name => e => {
		setState({ ...states, [name]: e.target.value, error: "", success: "" })
	}
	const handleContent = e => {
		setContent(e)
	}
	const handleImage = e => {
		setImageUploadButtonName(e.target.files[0].name)
		if (e.target.files[0]) {
			Resizer.imageFileResizer(
				e.target.files[0],
				300,
				300,
				"JPEG",
				100,
				0,
				uri => {
					setState({ ...states, image: uri, success: "", error: "" })
				},
				"base64"
			)
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setState({ ...states, buttonText: isCreate ? "Creating..." : "Updating..." })
		let finalList = values.map(el => el._id)
		const routerUrl = API
		routerUrl += `/${dataType}`
		routerUrl += isCreate ? "/create" : "/update"
		const submitImage = image !== imageUrl ? image : ''
		console.table({ name, submitImage, content, finalList, slug: data.slug })
		try {
			const token = getCookieFromBrowser("token")
			const res = await axios.post(
				routerUrl,
				{ user, name, content, image: submitImage, lives: finalList, categories: finalList, slug: data.slug },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					}
				}
			)
			if (isCreate) {
				setState({
					...states,
					name: "",
					image: "",
					buttonText: 'Create',
					success: `${res.data.name} is created.`,
					error: ''
				})
				setValues([])
				setImageUploadButtonName("Upload Image")
				setContent("")
			} else {
				setState({ ...states, success: `${res.data.name} is updated.`, buttonText: 'Update', error: '' })
			}
		} catch (error) {
			console.log(error)
			setState({ ...states, buttonText: isCreate ? "Create" : "Update", error: "error found", success: '' })
		}
	}

	const Form = () => (
		<form onSubmit={handleSubmit}>
			<div className='pb-3' >
				<label className="form-label">Name</label>
				<input onChange={handleChange("name")} value={states.name} type="text" className="form-control" required />
			</div>
			<div className="pb-3" >
				<label className="form-label">Content</label>
				<ReactQuill
					value={content}
					onChange={handleContent}
					placeholder="Write something..."
					// theme="bubble"
					className="pb-5 mb-3"
					style={{ border: "1px solid #666" }}
				/>
			</div>
			<div className="pb-4">
				<FilterData list={list} selectLife={dataType === 'category'} setValues={setValues} values={values} />
			</div>
			<div className="pb-3" >
				<label className="btn btn-outline-secondary form-label">
					{imageUploadButtonName}
					<input onChange={handleImage} type="file" accept="image/*" className="form-control" />
				</label>
			</div>
			<div className='pb-3'>
				<button className="btn btn-outline-warning" type="submit">{states.buttonText}</button>
			</div>
			{
				!isCreate && (
					<div>
						<DialogButton dataType={dataType} slug={data.slug} setError={setState} states={states} user={user} />
					</div>

				)
			}
		</form>
	)

	return (
		<Layout user={user} >
			<div className="col-md-8 offset-md-2 col-xs-10 offset-xs-1 p-5">
				<h1>{isCreate ? "Create " : "Edit "}{dataType}</h1>
				<br />
				{states.success && showSuccessMessage(states.success)}
				{states.error && showErrorMessage(states.error)}
				<img
					src={states.image || IMAGE_ON_ERROR}
					onError={e => e.target.src = IMAGE_ON_ERROR}
					style={{
						maxWidth: '50vw'
					}}
				/>
				{Form()}
			</div>
		</Layout>
	)
}

export default CreateOrUpdate;