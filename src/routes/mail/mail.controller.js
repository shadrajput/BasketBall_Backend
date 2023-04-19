const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ScoreboardLinkSender = require("./scoreboardLink");
const ErrorHandler = require('../../utils/ErrorHandler');

const httpScoreboardLinkMail = catchAsyncErrors(async (req, res, next) => {

  const { 
    match_id, 
    scorer_email,
    scorer_token,
    team_1, 
    team_2, 
    match_start_date, 
    match_start_time, 
    address } = req.body;

  const link = `http://127.0.0.1:5173/scoreboard/${match_id}/${scorer_token}`

  await ScoreboardLinkSender({ 
    scorer_email, 
    link, 
    team_1, 
    team_2, 
    match_start_date, 
    match_start_time, 
    address
  });

  return res.status(200).json({success: true, message: "Link sent successfully" });
})

module.exports = {
  httpScoreboardLinkMail,
};
