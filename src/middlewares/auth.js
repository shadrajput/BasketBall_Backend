const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const catchAsyncErrors = require('./catchAsyncErrors')
const ErrorHandler = require('../utils/ErrorHandler')
const bcrypt = require('bcrypt')
const { PrismaClient } =  require('@prisma/client')

const prisma = new PrismaClient();

const JWTSign = process.env.JWT_SIGN;

exports.generateToken = (userID) => {
    const token = jwt.sign(userID, JWTSign);
    if(!token){
      return new ErrorHandler('Failed to generate token', 500)
    }

    return token;
} 

exports.comparePassword = async function (enteredPassword, dbPassword){
    const result = await bcrypt.compare(enteredPassword, dbPassword)
    return result
};


exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{
    const token = req.headers.token;

    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401))
    }

    const user_id = jwt.verify(token, JWTSign);


    req.user = await prisma.users.findFirst({ where: {name: 'sadik'}});

    next();
})
