const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");

const prisma = new PrismaClient();

const tournamentRegistration = catchAsyncErrors(async(req, res, next) => {
    const {user_id, logo, tournament_name, address, start_date, end_date, gender_types, age_categories, level, prize} = req.body

    const result = await prisma.tournaments.findFirst({ 
        where: {
            AND:[
                {
                    tournament_name :{
                        equals: tournament_name,
                        mode: 'insensitive'
                    }
                },
                {
                    status: {
                        in: [1, 2]
                    }
                }
            ]
        }
    })

    if(result){
        return next(new ErrorHandler('Please change the tournament name'))
    }


    await prisma.tournaments.create({
        data:{
            user_id,
            tournament_name,
            address,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            gender_types,
            age_categories,
            level, 
            prize
        }
    })

    res.status(201).json({success: true, message: "Registration successfull. Soon Admin will verify your tournament."})

})

module.exports ={
    tournamentRegistration
}