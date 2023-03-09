const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const { getAdminByUser } = require("../model/admin.model");
const catchAsyncErrors = require('./catchAsyncErrors')
const ErrorHandler = require('../utils/ErrorHandler')
const prisma = require('prisma')

const JWTSign = process.env.JWT_SIGN;

async function createToken(userID) {
  try {
    const token = jwt.sign({ userID }, JWTSign);
    return token;
  } catch (error) {
    console.error(error);
  }
}

exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.headers.authorization;

    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401))
    }

    const decodedData = jwt.verify(token, JWTSign);

    // req.user = await User.findById(decodedData.id);

    next();
})
