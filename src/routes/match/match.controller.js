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
            tournament_id: true,
            team_1_id: true,
            team_2_id: true,
            scorekeeper_id: true,
            won_by_team_id
        }
    })

    // const all_quarters = await prisma.match_score.findMany({
    //     include:{
    //         quarter_id:{

    //         }
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

module.exports = {
    matchScore
}