const { deleteImage } = require("../helper/imageUpload");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const deleteTournamentFunc = async(tournament_id) =>{
  const tournament_teams = await prisma.tournament_teams.findMany({
    where:{
      tournament_id
    }
  })
  
  for(let i = 0; i< tournament_teams.length; i++){
    //Deleting the tournament teams from tournament_teams_reg_type
    await prisma.tournament_teams_reg_type.deleteMany({
      where:{
        tournament_teams_id: tournament_teams[i].id,
      }
    })
    
    //Deleting the tournament teams
    await prisma.tournament_teams.delete({
      where:{
        id: tournament_teams[i].id,
      }
    })
  }

  //Deleting tournament referees
  await prisma.tournament_referees.deleteMany({
    where:{
      tournament_id
    }
  })

  //Finding tournament sponsors
  const sponsors = await prisma.tournament_sponsors.findMany({
    where:{
      tournament_id
    }
  })

  //deleting sponsors logos from imagekit
  for(let i=0; i<sponsors.length; i++){
    await deleteImage(sponsors[i].logo)
  }

  //Deleting tournament sponsors
  await prisma.tournament_sponsors.deleteMany({
    where:{
      tournament_id
    }
  })

  //Deleting tournament gallery images
  const gallery = await prisma.gallery.findMany({
    where:{
      tournament_id
    }
  })

   //deleting gallery images from imagekit
  for(let i=0; i<gallery.length; i++){
    await deleteImage(gallery[i].photo)
  }

  //Deleting tournament gallery
  await prisma.gallery.deleteMany({
    where:{
      tournament_id
    }
  })

  
  //Getting user id from tournament detail
  const tournament_details = await prisma.tournaments.findUnique({
    where:{
      id: tournament_id
    },
    select:{
      user_id: true
    }
  })
  
  //Deleting tournament
  await prisma.tournaments.delete({
    where:{
      id: tournament_id
    }
  })

  //Finding tournaments of users
  const any_tournament = await prisma.tournaments.findFirst({
    user_id: tournament_details.user_id
  })

  if(!any_tournament) { //updating user table
    await prisma.user.update({
      where:{
        id: tournament_details.user_id
      },
      data:{
        is_organizer: false
      }
    })
  }

}

module.exports = deleteTournamentFunc