const express = require("express")
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

mongoose
	.connect(process.env.DATABASE_CLOUD, {}) // connect to my database(mongo atlas)
	.then(() => console.log('DB connected'))
	.catch(err => console.log("DB error => ", err));

const authRoutes = require("./routes/auth")
const lifeRoutes = require("./routes/life")
const categoryRoutes = require("./routes/category")
const userRoutes = require('./routes/user')

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "25mb", type: 'application/json' }));

app.use(cors({
	origin: process.env.CLIENT_URL,
	// credentials: true,
	// exposedHeaders: ["set-cookie"]
})); // only origin url has access.

app.use("/api", authRoutes)
app.use("/api", lifeRoutes)
app.use("/api", categoryRoutes)
app.use("/api", userRoutes)

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API is running on port ${port}`));