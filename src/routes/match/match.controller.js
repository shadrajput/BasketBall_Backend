const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");

const prisma = new PrismaClient();

const matchScore = catchAsyncErrors(async(req, res, next)=>{
    const match_id = Number(req.params.match_id);

    const match_details = prisma.matches.findUnique({
        where:{
            id: match_id,
        },
        include:{
            tournaments: true,
            team_1: true,
            team_2: true,
            scorekeeper: true,
            won_by_team: true
        }
    })

    // const all_quarters = await prisma.match_score.findMany({
    //     include:{
    //         quarter: true
    //     }

    // })

    res.status(200).json({
        success: true, 
        data: {
            match_details,
            // match_score
        }
    })
});

const updateMatchDetails = catchAsyncErrors(async(req, res, next)=>{

});

module.exports = {
    matchScore,
    updateMatchDetails
}