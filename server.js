import express from 'express';
import "dotenv/config"
const app = express();
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors'
import { limiter } from './config/ratelimiter.js';
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors())
app.use(limiter)


app.get('/',(req,res)=>{
    return res.json({message:"Hellow"})
})


// * import routers
import apiRoutes from './routes/api.js';
// import logger from './config/logger.js';
app.use("/api",apiRoutes);


// Job import
import './jobs/index.js'


// Logger
// this is for testing only to check , you can use logger in your route APIs.
// logger.info("I am just testing");

app.listen(PORT,()=>{
    console.log(`Server running at Port ${PORT}`);
})