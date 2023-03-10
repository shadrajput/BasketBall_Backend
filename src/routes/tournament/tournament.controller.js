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
                    //can't create the tournament with the same name until the tournament is upcoming/live
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
            start_date: new Date(start_date), //date should be in YYYY-mm-dd format
            end_date: new Date(end_date),
            gender_types,
            age_categories,
            level, 
            prize
        }
    })

    res.status(201).json({success: true, message: "Registration successfull. Soon Admin will verify your tournament."})

})

const updateTournamentDetails = catchAsyncErrors(async(req, res, next) => {
    const {tournament_id} = req.params
    
    const {logo, tournament_name, address, start_date, end_date, gender_types, age_categories, level, prize} = req.body

    await prisma.tournaments.update({
        where:{
            id: Number(tournament_id)
        },
        data:{
            tournament_name,
            address,
            start_date: new Date(start_date), //date should be in YYYY-mm-dd format
            end_date: new Date(end_date),
            gender_types,
            age_categories,
            level, 
            prize
        }
    })

    res.status(200).json({success: true, message: "Tournament details updated"})
})

module.exports ={
    tournamentRegistration,
    updateTournamentDetails
}