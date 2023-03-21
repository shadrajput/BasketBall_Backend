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

exports.verifyScorekeeper = catchAsyncErrors(async(req, res, next)=>{
    const scorekeeper_id = Number(req.params.id)
    const match_id = Number(req.params.match_id)
    const token = Number(req.params.token)

    if(token == null){
        return next(new ErrorHandler("Link expired", 400))
    }

    const scorekeeper_details = await prisma.scorekeeper.findFirst({
        where:{
            id: scorekeeper_id,
            token
        }
    })

    if(!scorekeeper_details){
        return next(new ErrorHandler("You are not authorized to access this page", 400))
    }

    const match_detail = await prisma.matches.findFirst({
      where: {
        scorekeeper_id: scorekeeper_details.id
      },
    });

    if (!match_detail || match_detail.id != match_id) {
      return next(
        new ErrorHandler("You are not authorized to access this page", 400)
      );
    }

    next();    
})
