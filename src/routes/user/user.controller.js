const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const bcrypt = require('bcrypt')
const { PrismaClient } =  require('@prisma/client')
const { comparePassword, generateToken } = require('../../middlewares/auth');
const ErrorHandler = require("../../utils/ErrorHandler");

const prisma = new PrismaClient();

const userSignup = catchAsyncErrors(async(req, res, next) =>{
    const {name, email, password, mobile} = req.body

    //checking mobile number already exist
    let user = await prisma.users.findFirst({where: {mobile}});

    if(user){
        return next(new ErrorHandler('User already exists with this mobile number'))
    }

    //checking email already exist
    user = null
    user = await prisma.users.findUnique({where: {email}});

    if(user){
        return next(new ErrorHandler('User already exists with this email'))
    }


    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.users.create({
        data:{
            name,
            email,
            password: hashedPassword,
            mobile,
            is_visitor: true,
            is_player: false,
            is_organizer: false,
            is_manager: false,
            is_admin: false,
            is_verified: false,
        }
    })

    res.status(201).json({success: true, message: 'Signup successfully'})
})

const userLogin = catchAsyncErrors(async(req, res, next) =>{
    const {mobile, password} = req.body
    const user = await prisma.users.findUnique({where:{mobile}});
    
    if(!user || ! await comparePassword(password, user.password)){
        return next(new ErrorHandler('Invalid mobile or password', 400));
    }

    const token = generateToken(user.id);

    res.status(200).json({success: true, message: 'Login successfully', token, is_account_verified: user.is_verified })
    
})

const verifyAccount = catchAsyncErrors(async(req, res, next) => {
    const {user_id, token} = req.params;

    let user = await prisma.users.findFirst({
        where: {
            AND:{
                id: Number(user_id),
                token: token
            }
        }
    })

    if(!user){
        return next(new ErrorHandler('Link is expired', 400));
    }

    user = null
    user = await prisma.users.update({ 
        where:{
            id: Number(user_id),
        },
        data:{
            is_verified: true,
            token: null
        }
    })


    res.status(200).json({success: true, message: 'Account verified successfully'})
})


module.exports = {
    userSignup, 
    userLogin,
    verifyAccount
}