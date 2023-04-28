const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const bcrypt = require('bcrypt')
const { PrismaClient } =  require('@prisma/client')
const tokenGenerator = require("../../utils/tokenGenerator");
const { comparePassword, generateToken  } = require('../../middlewares/auth');
const registrationMail = require('../../routes/mail/registrationMail')
const resendVerificationMail = require('../../routes/mail/resendVerificationMail')
const resetPassword = require('../../routes/mail/resetPassword')
const ErrorHandler = require("../../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const axios = require('axios')

const prisma = new PrismaClient();

const userSignup = catchAsyncErrors(async(req, res, next) =>{
    const {email, password} = req.body
    const name = req.body.fullname;
    const mobile = req.body.phone
    const recaptcha = req.body.recaptcha

    const recapthaResponse = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`,
        method: 'POST'
    })

    if(!recapthaResponse.data.success){
        return next(new ErrorHandler('Recaptcha verification failed', 500))
    }

    //checking mobile number already exist
    let user = await prisma.users.findFirst({where: {mobile}});

    if(user){
        return next(new ErrorHandler('User already exists with this mobile number', 400))
    }

    //checking email already exist
    user = null
    user = await prisma.users.findUnique({where: {email}});

    if(user){
        return next(new ErrorHandler('User already exists with this email', 400))
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const token = tokenGenerator(32);

    const user_details = await prisma.users.create({
        data:{
            name: name,
            email: email.trim(),
            password: hashedPassword,
            mobile: mobile.trim(),
            is_visitor: true,
            is_player: false,
            is_organizer: false,
            is_manager: false,
            is_admin: false,
            is_verified: false,
            token
        }
    })
    

    const link = `http://127.0.0.1:5173/user/verify/${user_details.id}/${token}`

    await registrationMail({name: user_details.name, email: user_details.email, link})

    res.status(201).json({success: true, message: 'Signup successfully'})
})

const userLogin = catchAsyncErrors(async(req, res, next) =>{
    const {mobile, password} = req.body
    const user = await prisma.users.findUnique({
        where:{mobile},
        include:{
            players: {
                select: {
                    id: true,
                },
            }
        }
    });

    if(!user || !await comparePassword(password, user.password)){
        return next(new ErrorHandler('Invalid mobile or password', 400));
    }
    
    delete user.password
    const token = generateToken(user.id);

    res.status(200).json({success: true, message: 'Login successful', token, user })
    
})

const resendVerificationEmail = catchAsyncErrors(async(req, res, next) => {
    const user = await prisma.users.findUnique({
        where:{
            id: req.user.id
        }
    })

    const link = `http://127.0.0.1:5173/user/verify/${user.id}/${user.token}`

    await resendVerificationMail({name: user.name, email: user.email, link})

    res.status(200).json({success: true, message: 'Link has been sent to your email'})
})

const sendResetPasswordLink = catchAsyncErrors(async(req, res, next) => {
    const {email} = req.body;
    
    const user = await prisma.users.findFirst({
        where:{
            email
        }
    })

    if(!user){
        return next(new ErrorHandler('User not found with this email', 400))
    }

    const token = tokenGenerator(32)

    await prisma.users.update({
        where:{
            id: user.id
        },
        data:{
            token
        }
    })
    const link = `http://127.0.0.1:5173/reset-password/${token}`

    await resetPassword({name: user.name, email: user.email, link})

    res.status(200).json({success: true, message: 'Reset password link has been sent to your email'})
})

const resetUserPassword = catchAsyncErrors(async(req, res, next)=>{
    const {token, newPassword} = req.body

    const user = await prisma.users.findFirst({
        where:{
            token
        }
    })

    if(!user){
        return next(new ErrorHandler('Your link has been expired', 400))
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10)

    await prisma.users.update({
        where:{
            id: user.id,
        },
        data:{
            password: hashedPassword,
            token: null
        }
    })

    res.status(200).json({success: true, message: 'Password updated successfully'})
})

const getUserData = catchAsyncErrors(async(req, res, next)=>{
    const token = req.headers.authentication;
    const JWTSign = process.env.JWT_SIGN;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const user_id = jwt.verify(token, JWTSign);

    const user = await prisma.users.findUnique({
        where: { id: Number(user_id) },
        include:{
            players: {
                select: {
                    id: true,
                },
            }
        }
    });

    res.status(200).json({success: true, user})
})

const googleLogin = catchAsyncErrors(async(req, res, next)=>{
    const accessToken = req.body.access_token

    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
		headers: {
			'Authorization': `Bearer ${accessToken}`,
		},
    })

    if(response){
        const firstName = response.data.given_name;
        const lastName = response.data.family_name;
        const email = response.data.email;
        // const photo = response.data.picture

        const existingUser = await prisma.users.findFirst(
            {
                where:{email},
                include:{
                    players: {
                        select: {
                            id: true,
                        },
                    }
                }
            },
        )

        if(!existingUser){
            const newUser = await prisma.users.create({
                data:{
                    name: `${firstName} ${lastName}`,
                    email,
                    is_google: true,
                    is_visitor: true,
                    is_player: false,
                    is_organizer: false,
                    is_manager: false,
                    is_admin: false,
                    is_verified: true,
                }
            })

            const token = generateToken(newUser.id);
            return res.status(201).json({success: true, message: 'Signup successfull', token, user: newUser})
        }
        else{
            if(!existingUser.is_google){
                return next(new ErrorHandler('Account already exist with this email', 400))
            }

            const token = generateToken(existingUser.id);
            return res.status(200).json({success: true, message: 'Login successfull', token, user: existingUser})
        }
    }
})

const updateUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user_id = req.user.id

    const {full_name, email, password} = req.body

    let hashedPassword = null
    if(password != 'Wellbenix'){
        hashedPassword = await bcrypt.hash(password.trim(), 10)
    }
    await prisma.users.update({
        where: {
            id: user_id
        },
        data:{
            name: full_name.trim(),
            email: req.user.email == email.trim() ? undefined : email.trim(),
            password: hashedPassword ? hashedPassword : undefined
        }
    })

    res.status(200).json({success: true, message: 'Profile updated successfully'})
})

const verifyAccount = catchAsyncErrors(async(req, res, next) => {
    const {user_id, token} = req.params;

    let user = await prisma.users.findFirst({
        where: {
            AND:[
                { id: Number(user_id) },
                { token: token }
            ]
        }
    })

    if(!user){
        return next(new ErrorHandler('Your link has expired', 400));
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
    resendVerificationEmail,
    sendResetPasswordLink,
    resetUserPassword,
    getUserData,
    googleLogin,
    updateUserProfile,
    verifyAccount
}