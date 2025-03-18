import express from 'express';
import "dotenv/config"
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    return res.json({message:"Hellow"})
})


// * import routers
import apiRoutes from './routes/api.js';
app.use("/api",apiRoutes);


app.listen(PORT,()=>{
    console.log(`Server running at Port ${PORT}`);
})