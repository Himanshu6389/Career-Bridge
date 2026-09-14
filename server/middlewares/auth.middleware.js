import jwt from "jsonwebtoken";
import Apperror from "../routes/error.util.js";

export const isLoggedIn=async(req,res,next)=>{
    const{token}=req.cookies;
    if(!token){
        return next(new Apperror('session expired please login again',400));
    }
    const userdetails=await jwt.verify(token,process.env.JWT_SECRET);
   req.user=userdetails;

   next();
}

export const authorizeRoles=(...roles)=>
    async(req,res,next)=>{
    const currentUserRoles=req.user.role;

    if(!roles.includes(currentUserRoles)){
        return next(new Apperror(`Access denied. This route is restricted to ${roles.join(', ')} only`,403))
    }
    next();
}

export const isEmployer = async(req, res, next) => {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return next(new Apperror('This action is only for employers', 403));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

export const isJobSeeker = async(req, res, next) => {
  try {
    if (req.user.role !== 'JOB_SEEKER') {
      return next(new Apperror('This action is only for job seekers', 403));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

export const isAdmin = async(req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new Apperror('This action is only for admins', 403));
    }
    next();
  } catch (error) {
    return next(error);
  }
};