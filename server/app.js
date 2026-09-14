import express from "express";
import cors from 'cors'
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRoute from './routes/user.route.js';
import jobRoute from './routes/job.route.js'
import companyRoute from './routes/company.route.js'
import applicationRoute from './routes/application.route.js'

const app=express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));


app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // ✅ Vite default port
        credentials: true,  // ✅ Fixed typo from "Credential"
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"]  // ✅ Important for cookies
    })
);


app.get('/health',(req,res)=>{
    res.status(200).json({
        success:true,
        message:'health check!'
    })
})

//route
app.use('/api/v1/user',userRoute);
app.use('/api/v1/company',companyRoute);
app.use('/api/v1/job',jobRoute);
app.use('/api/v1/application',applicationRoute);
app.use(errorMiddleware);

export default app;