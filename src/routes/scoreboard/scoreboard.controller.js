const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");

const prisma = new PrismaClient();

const startMatch = catchAsyncErrors(async(req, res, next)=>{
    const match_id = Number(req.params.match_id);

    const match = await prisma.matches.findUnique({ where: {id: match_id}});

    if(!match){
        return next(new ErrorHandler('No match found', 400));
    }

    await prisma.matches.update({
        where:{
            id: match_id
        },
        data:{
            status: 2
        }
    })

    const last_score_detail = await prisma.match_score.findFirst({
        orderBy:{
            created_at: 'desc'
        }
    })
    await prisma.match_quarters.create({
        match_id,
        quarter_number: 1,
        timeline_start_score_id: last_score_detail.id,
        timeline_end_score_id: last_score_detail.id
    })

    res.status(200).json({success: true, message: 'Match has been started'});
})

const addScore = catchAsyncErrors(async(req, res, next) =>{
    const match_id = Number(req.params.match_id);
    const team_id = Number(req.body.team_id)
    const player_id = Number(req.body.player_id);
    const point_type = req.body.point_type

    let points = 0;

    if(point_type == 'free shot'){
        points = 1
    }
    else if(point_type == 'in 3 point'){
        points = 2
    }
    else{
        points = 3
    }

    const quarter_details = await prisma.match_quarters.findFirst({ 
        where:{ match_id, status: 2 },
    })

    let pointScoreByTeam = '';
    
    const match_details = await prisma.matches.findUnique({
        where:{id: match_id},
        include: {
            team_1_id: true,
            team_2_id: true
        }
    })

    //Updating score in match_quarter table
    if(match_details.team_1_id == team_id){

        pointScoreByTeam = match_details.team_1_id.team_name
        
        //Updating point in team 1
        await prisma.match_quarters.update({
            where:{
                id: quarter_details.id
            },
            data:{
                team_1_points: {
                    increament: points
                }
            }
        })
    }
    else{

        pointScoreByTeam = match_details.team_2_id.team_name
        
        //Updating point in team 2
        await prisma.match_quarters.update({
            where:{
                id: quarter_details.id
            },
            data:{
                team_2_points: {
                    increament: points
                }
            }
        })
    }

    //Adding player points in match_players table
    const match_player = await prisma.match_players.findFirst({ 
        where: {
            match_id, 
            player_id
        } 
    })
    await prisma.match_players.update({
        where:{
            id: match_player.id
        },
        data:{
            points: {
                increament: points
            }
        }
    })

    //Adding player points in player table according to the tournament level (international, national, state, local, friendly)
    const tournament_details = await prisma.tournaments.findUnique({ where: { id: match_details.tournament_id } });

    const player_points =  getPlayerRankingPoints(tournament_details.level);

    await prisma.player_statistics.update({
        where: {
            player_id
        },
        data:{
            points:{
                increament: player_points
            }
        }
    })

    //Adding new entry in match_score table
    const match_score_details = await prisma.match_score.create({
        team_id,
        player_id,
        points,
        point_status: point_type,
        quarter_id: quarter_details.id
    })

    //updating timeline_end_id in match_quarters table
    await prisma.match_quarters.update({
        where:{
            id: quarter_details.id
        },
        data:{
            timeline_end_score_id: match_score_details.id
        }
    })

    res.status(200).json({success: true, message: `${points} points added to ${pointScoreByTeam}`});
})

const teamFoul = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id)
    const team_id = Number(req.params.team_id)
    let foulScoreByTeam = '';

    const match_details = await prisma.matches.findUnique({ 
        where: { id: match_id },
        include: {
            team_1_id: true,
            team_2_id: true
        } 
    });

    const match_quarter_details = await prisma.match_quarters.findFirst({ 
        where: { match_id, status: 2 },
    })

    if(match_details.team_1_id == team_id){ //If team 1 foul
        foulScoreByTeam = match_details.team_1_id.team_name
        await prisma.match_quarters.update({
            where: {
                id: match_quarter_details.id
            },
            data:{
                team_1_fouls:{
                    increament: 1
                }
            }
        })
    }
    else{ //If team 2 foul
        foulScoreByTeam = match_details.team_2_id.team_name
        await prisma.match_quarters.update({
            where: {
                id: match_quarter_details.id
            },
            data:{
                team_2_fouls:{
                    increament: 1
                }
            }
        })
    }

    res.status(200).json({success: true, message: `Foul added to ${foulScoreByTeam}`});
})

const playerFoul = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id)
    const player_id = Number(req.params.player_id)

    const match_player_details = await prisma.match_players.findFirst({
        where:{
            match_id,
            player_id
        },
        include:{
            player_id: true
        }
    })

    await prisma.match_players.update({
        where:{
            id: match_player_details.id
        },
        data:{
            fouls:{
                increament: 1
            }
        }
    })

    res.status(200).json({success: true, message: `Foul added to ${match_player_details.player_id.first_name}`});

})

const changeQuarter = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id);

    const all_quarters = await prisma.match_quarters.findMany({ 
        where: { match_id },
        orderBy:{
            created_at: 'desc'
        }
    })
    
    if(all_quarters.length == 5){
        return next(new ErrorHandler("This game can't have more than 5 quarters"))
    }

    //updating current quarter details
    const match_details = await prisma.matches.findUnique({ where: { id: match_id } });
    const current_quarter = all_quarters[0];
    let quarter_won_by = null

    if(current_quarter.team_1_points > current_quarter.team_2_points){
        quarter_won_by = match_details.team_1_id
    }
    else if(current_quarter.team_2_points > current_quarter.team_1_points){
        quarter_won_by = match_details.team_2_id
    }

    //Getting last score id from match_score table
    const last_score_detail = await prisma.match_score.findFirst({
        where:{
            id:{
                gte: current_quarter.timeline_start_score_id,
                lte: current_quarter.timeline_end_score_id
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    })

    //Updating current quarter
    await prisma.match_quarters.update({
        where: {
            id: current_quarter.id
        },
        data:{
            won_by_team_id: quarter_won_by,
            status: 1,
            is_undo_score: 0,
            timeline_end_score_id: last_score_detail.id
        }
    })


    //Creating new quarter
    await prisma.match_quarters.create({
        match_id,
        is_undo_score: 1,
        quarter_number: all_quarters.length,
        timeline_start_score_id: last_score_detail.id,
        timeline_end_score_id: last_score_detail.id
    })

})

const undoScore = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id);
    
    //Undoing other than last point
    let current_quarter = await prisma.match_quarters.findFirst({ 
        where: { match_id, status: 2 }
    })


    //To undo score of previous quarter
    if(current_quarter.team_1_points == 0 && current_quarter.team_2_points == 0){ // quarter has just started   
        await prisma.match_quarters.delete({
            where:{
               is: current_quarter.id 
            }
        })

        current_quarter = await prisma.match_quarters.findMany({ 
            where: { match_id},
            orderBy:{
                created_at: 'desc'
            }
        })

        await prisma.match_quarters.update({
            where:{
                id: current_quarter.id
            },
            data:{
                won_by_team_id: null,
                status: 2
            }
        })
    }

    const match_score_details = await prisma.match_score.findFirst({
        where: { 
            quarter_id: current_quarter.id,
            id:{
                gte: current_quarter.timeline_start_score_id,
                lte: current_quarter.timeline_end_score_id
            }
        },
        orderBy:{
            created_at: 'desc'
        }
    })

    await prisma.match_score.delete({
        where:{
            id: match_score_details.id,
        }
    })

    //decreasing the team point in match_quarters table

        //getting match details
    const match_details = await prisma.matches.findUnique({ where: { id: match_id } });
    if(match_score_details.team_id == match_details.team_1_id){
        await prisma.match_quarters.update({
            where:{
                id: current_quarter.id
            },
            data:{
                team_1_points:{
                    increament: -match_score_details.points
                }
            }
        })
    }
    else{
        await prisma.match_quarters.update({
            where:{
                id: current_quarter.id
            },
            data:{
                team_2_points:{
                    increament: -match_score_details.points
                }
            }
        })
    }

    //decreasing the player point from match_players table

            //getting tournament details
    const tournament_details = await prisma.tournaments.findUnique({ where: { id: match_details.tournament_id } })
    
    //finding match_player id
    const match_player_details = await prisma.match_players.findFirst({ 
        where:{
            match_id,
            player_id: match_score_details.player_id
        }
    })

    await prisma.match_players.update({
        where:{
            id: match_player_details.id
        },
        data:{
            points:{
                increament: match_score_details.points
            }
        }
    })
    
    
    //decreasing the player point from player_statistics table
    const player_points = getPlayerRankingPoints(tournament_details.level)

    await prisma.player_statistics.update({
        where:{
            player_id: match_score_details.player_id
        },
        data:{
            points:{
                increament: -player_points
            }
        }
    })
        
})

const endMatch = catchAsyncErrors( async (req, res, next)=>{
})

//Helper function to find player points according to tournament level
function getPlayerRankingPoints(tournament_level){
    if(tournament_level == 'international'){
        return 10
    }
    else if(tournament_level == 'national'){
        return 5
    }
    else if(tournament_level == 'state'){
        return 3
    }
    else if(tournament_level == 'local'){
        return 1
    }
}


module.exports = {
    startMatch,
    addScore,
}