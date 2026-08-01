import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {

    return jwt.sign(

        { id },

        process.env.JWT_SECRET,

        {

            expiresIn:"7d"

        }

    );

};

export const loginUser = async(req,res)=>{

const {email,password}=req.body;

const user=await User.findOne({email}).select("+password");

if(!user){

return res.status(400).json({

message:"Invalid Email"

});

}

const isMatch=await user.matchPassword(password);

if(!isMatch){

return res.status(400).json({

message:"Invalid Password"

});

}

res.json({

token:generateToken(user._id),

user:{

id:user._id,

name:user.name,

email:user.email

}

});

};