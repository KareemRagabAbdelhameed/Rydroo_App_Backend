import AppError from "../utils/AppError.js";

const allowedTo = (...roles)=>{
    console.log("roles : ",roles)
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                new AppError("this role is not authorized", 401)
              );
        }
        next();
    }
}

export default allowedTo