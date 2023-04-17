const catchAsyncErrors = require("../../middlewares/catchAsyncErrors")
const { PrismaClient } = require('@prisma/client');
const ErrorHandler = require("../../utils/ErrorHandler");

const prisma = new PrismaClient();

//********Helper function to find player points according to tournament level*********
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
    else{
        return 0
    }
}
//***************************************************************

const isAuthScorekeeper = catchAsyncErrors((req, res, next) => {
    return res.status(200).json({success: true})
})

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
        data:{
            match_id,
            quarter_number: 1,
            timeline_start_score_id: !last_score_detail ? null : last_score_detail.id,
            timeline_end_score_id: !last_score_detail ? null : last_score_detail.id
        }
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
            team_1: true,
            team_2: true
        }
    })

    //Updating score in match_quarter table
    if(match_details.team_1_id == team_id){

        pointScoreByTeam = match_details.team_1.team_name
        
        //Updating point in team 1
        await prisma.match_quarters.update({
            where:{
                id: quarter_details.id
            },
            data:{
                team_1_points: {
                    increment: points
                },
                is_undo_score: true
            }
        })
    }
    else{

        pointScoreByTeam = match_details.team_2.team_name
        
        //Updating point in team 2
        await prisma.match_quarters.update({
            where:{
                id: quarter_details.id
            },
            data:{
                team_2_points: {
                    increment: points
                },
                is_undo_score: true
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
                increment: points
            }
        }
    })

    //Adding player points in player table according to the tournament level (international, national, state, local, friendly)
    const tournament_details = await prisma.tournaments.findUnique({ where: { id: match_details.tournament_id } });

    const player_points =  getPlayerRankingPoints(tournament_details.level);

    const player_stats = await prisma.player_statistics.findFirst({ where:{ player_id } })

    await prisma.player_statistics.update({
        where: {
            id: player_stats.id
        },
        data:{
            points:{
                increment: player_points
            }
        }
    })

    //Adding new entry in match_score table
    const match_score_details = await prisma.match_score.create({
        data:{
            team_id,
            player_id,
            points,
            point_status: point_type,
            quarter_id: quarter_details.id
        }
    })

    //updating timeline_start_id if this is a first score of a quarter
    if(quarter_details.team_1_points == 0 && quarter_details.team_2_points == 0 && quarter_details.timeline_start_score_id == null){

        await prisma.match_quarters.update({
            where:{
                id: quarter_details.id
            },
            data:{
                timeline_start_score_id: match_score_details.id
            }
        })
    }

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
    const team_id = Number(req.body.team_id)
    let foulScoreByTeam = '';

    const match_details = await prisma.matches.findUnique({ 
        where: { id: match_id },
        include: {
            team_1: true,
            team_2: true
        } 
    });

    const match_quarter_details = await prisma.match_quarters.findFirst({ 
        where: { match_id, status: 2 },
    })

    if(match_details.team_1_id == team_id){ //If team 1 foul
        foulScoreByTeam = match_details.team_1.team_name
        await prisma.match_quarters.update({
            where: {
                id: match_quarter_details.id
            },
            data:{
                team_1_fouls:{
                    increment: 1
                }
            }
        })
    }
    else{ //If team 2 foul
        foulScoreByTeam = match_details.team_2.team_name
        await prisma.match_quarters.update({
            where: {
                id: match_quarter_details.id
            },
            data:{
                team_2_fouls:{
                    increment: 1
                }
            }
        })
    }

    res.status(200).json({success: true, message: `Foul added to ${foulScoreByTeam}`});
})

const playerFoul = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id)
    const player_id = Number(req.body.player_id)

    const match_player_details = await prisma.match_players.findFirst({
        where:{
            match_id,
            player_id
        },
        include:{
            players: true
        }
    })

    await prisma.match_players.update({
        where:{
            id: match_player_details.id
        },
        data:{
            fouls:{
                increment: 1
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

    //updating held quarters in match_details 
    const match_details = await prisma.matches.update({ 
        where: { id: match_id },
        data:{
            quarters_held:{
                increment: 1
            }
        } 
    });

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
    const prev_quarter = await prisma.match_quarters.update({
        where: {
            id: current_quarter.id
        },
        data:{
            won_by_team_id: quarter_won_by,
            status: 1,
        }
    })


    //Creating new quarter
    await prisma.match_quarters.create({
        data:{
            match_id,
            is_undo_score: prev_quarter.is_undo_score,
            quarter_number: all_quarters.length,
            timeline_start_score_id: last_score_detail.id,
            timeline_end_score_id: last_score_detail.id
        }
    })

    res.status(200).json({success: true, message: 'New quarter started'});

})

const undoScore = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id);
    
    let current_quarter = await prisma.match_quarters.findFirst({ 
        where: { match_id, status: 2 }
    })

    //checking if continuous two undo
    if(current_quarter.is_undo_score == false){
        return next(new ErrorHandler("Can't undo score continuously two times"))
    }

    //To undo score of previous quarter
    if(current_quarter.team_1_points == 0 && current_quarter.team_2_points == 0){ // quarter has just started   
        await prisma.match_quarters.delete({
            where:{
               id: current_quarter.id 
            }
        })

        current_quarter = await prisma.match_quarters.findFirst({ 
            where: { match_id },
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

        await prisma.matches.update({
            where:{
                id: match_id
            },
            data:{
                quarters_held:{
                    increment: -1
                },
            }
        })
    }

    const match_score_details = await prisma.match_score.findFirst({
        where: { 
            quarter_id: current_quarter.id,
            AND:[
                {
                    id:{
                        gte: current_quarter.timeline_start_score_id
                    }
                },
                {
                    id:{
                        lte: current_quarter.timeline_end_score_id
                    }
                }
            ],
        },
        orderBy:{
            created_at: 'desc'
        }
    })


    //update timeline start and end score id in match_quarter table
    if(match_score_details.timeline_start_score_id != match_score_details.timeline_end_score_id){
        await prisma.match_quarters.update({
            where: {
                id: current_quarter.id
            },
            data:{
                timeline_end_score_id: match_score_details.id - 1,
            }
        })
    }
    

    //Deleting score 
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
                    increment: -match_score_details.points
                },
                is_undo_score: false
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
                    increment: -match_score_details.points
                },
                is_undo_score: false
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
                increment: -match_score_details.points
            }
        }
    })
    
    
    //decreasing the player point from player_statistics table
    const player_points = getPlayerRankingPoints(tournament_details.level)

    const player_stats = await prisma.player_statistics.findFirst({
        where:{
            player_id: match_score_details.player_id
        }
    })
    await prisma.player_statistics.update({
        where:{
            id: player_stats.id
        },
        data:{
            points:{
                increment: -player_points
            }
        }
    })

    res.status(200).json({success: true, message: 'Score reverted'});
        
})

const endMatch = catchAsyncErrors( async (req, res, next)=>{
    const match_id = Number(req.params.match_id);

    //-------Setting winner of the quarter and updating status of the quarter-------

    let current_quarter = await prisma.match_quarters.findFirst({ 
        where: { match_id, status: 2 }
    })
        //Deciding who won the quarter
    const match_details = await prisma.matches.findUnique({ where: { id: match_id } });

    let quarter_won_by = null

    if(current_quarter.team_1_points > current_quarter.team_2_points){
        quarter_won_by = match_details.team_1_id
    }
    else if(current_quarter.team_2_points > current_quarter.team_1_points){
        quarter_won_by = match_details.team_2_id
    }

        //Updating current quarter
    await prisma.match_quarters.update({
        where: {
            id: current_quarter.id
        },
        data:{
            won_by_team_id: quarter_won_by,
            status: 1,  
            is_undo_score: false,
        }
    })

    //-------Setting the winner of the match & update status of the match-------

        //Deciding the winner of the match
            //getting no. of quarters won by team 1  
    const team_1_quarters_won = await prisma.match_quarters.findMany({
        where: {
            match_id,
            won_by_team_id: match_details.team_1_id
        }
    })
            //getting no. of quarters won by team 2    
    const team_2_quarters_won = await prisma.match_quarters.findMany({
        where: {
            match_id,
            won_by_team_id: match_details.team_2_id
        }
    })

    let match_won_team = null;
    let match_lost_team = null;

    if(team_1_quarters_won?.length > team_2_quarters_won?.length){
        match_won_team = match_details.team_1_id
        match_lost_team = match_details.team_2_id    
    }
    else if(team_2_quarters_won?.length > team_1_quarters_won?.length){
        match_won_team = match_details.team_2_id;
        match_lost_team = match_details.team_1_id;
    }
    
            //updating won team in match table & tournament status to completed and is_details_editable to true
    await prisma.matches.update({
        where:{
            id: match_id
        },
        data:{
            won_by_team_id: match_won_team,
            status: 3,
            quarters_held:{
                increment: 1
            },
        }
    })

    //updating token of the scorekeeper
    await prisma.scorekeeper.update({
        where:{
            id: match_details.scorekeeper_id
        },
        data:{
            token: null
        }
    })

    //-------Update matches played, won and lost in teams table and player statistics table-------
    if(match_won_team != null && match_lost_team != null){

        //For won team
            //won team
        await prisma.teams.update({
            where:{
                id: match_won_team
            },
            data:{
                matches_played:{
                    increment: 1
                },
                matches_won:{
                    increment: 1
                }
            }
        })

            //updating won players matches played and won
        await prisma.player_statistics.updateMany({
            where: {
                player_id: {
                    in: await prisma.match_players.findMany({
                        where: {
                            match_id,
                            team_id: match_won_team
                        },
                        select: {
                            player_id: true
                        }
                    }).then(matchPlayers => matchPlayers.map(mp => mp.player_id))
                }
            },
            data: {
                matches_played:{
                    increment: 1
                },
                matches_won:{
                    increment: 1
                }
            }
        });

        //For lost team
            //lost team
        await prisma.teams.update({
            where:{
                id: match_lost_team
            },
            data:{
                matches_played:{
                    increment: 1
                },
                matches_lost:{
                    increment: 1
                }
            }
        }) 

            //updating lost players matches played and lost
        await prisma.player_statistics.updateMany({
            where: {
                player_id: {
                in: await prisma.match_players.findMany({
                    where: {
                        match_id,
                        team_id: match_lost_team
                    },
                    select: {
                        player_id: true
                    }
                }).then(matchPlayers => matchPlayers.map(mp => mp.player_id))
                }
            },
            data: {
                matches_played:{
                    increment: 1
                },
                matches_lost:{
                    increment: 1
                }
            }
        });
    }
    else{ //match draw
        //Only increase match played of both the teams
        await prisma.teams.update({
            where:{
                id: match_details.team_1_id
            },
            data:{
                matches_played:{
                    increment: 1
                }
            }
        })

        await prisma.teams.update({
            where:{
                id: match_details.team_2_id
            },
            data:{
                matches_played:{
                    increment: 1
                }
            }
        })

        //Only increase matches played of all players of both the teams
        await prisma.player_statistics.updateMany({
            where: {
                player_id: {
                in: await prisma.match_players.findMany({
                    where: {
                        match_id,
                    },
                    select: {
                        player_id: true
                    }
                }).then(matchPlayers => matchPlayers.map(mp => mp.player_id))
                }
            },
            data: {
                matches_played: { increment: 1 }
            }
        });
    }


    //-------Update is_details editable in team table-------
        //team 1
    await prisma.teams.update({
        where:{
            id: match_details.team_1_id
        },
        data:{
            is_details_editable: true
        }
    })

        //team 2
    await prisma.teams.update({
        where:{
            id: match_details.team_2_id
        },
        data:{
            is_details_editable: true
        }
    })

    res.status(200).json({success: true, message: 'Match ended successfully'});
})

module.exports = {
    startMatch,
    addScore,
    teamFoul,
    playerFoul,
    changeQuarter,
    undoScore,
    endMatch,
    isAuthScorekeeper
}