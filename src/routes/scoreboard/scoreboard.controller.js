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
        timeline_start_score_id: last_score_detail.id
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
        where:{ match_id },
        orderBy: {
            created_at: 'desc',
        },
 
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

    let player_points = 0
    if(tournament_details.level == 'international'){
        player_points = 10
    }
    else if(tournament_details.level == 'national'){
        player_points = 5
    }
    else if(tournament_details.level == 'state'){
        player_points = 3
    }
    else if(tournament_details.level == 'local'){
        player_points = 1
    }

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
    await prisma.match_score.create({
        team_id,
        points,
        point_status: point_type,
        quarter_id: quarter_details.id
    })

    res.status(200).json({success: true, message: `${points} points added to ${pointScoreByTeam}`});
})

const undoScore = catchAsyncErrors( async (req, res, next)=>{
    
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
        where: { match_id },
        orderBy: {
            created_at: 'desc'
        }
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
    
})

const endMatch = catchAsyncErrors( async (req, res, next)=>{

})


module.exports = {
    startMatch,
    addScore,
}