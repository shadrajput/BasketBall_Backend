const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const ScoreboardLinkSender = require("./scoreboardLink");
const ErrorHandler = require('../../utils/ErrorHandler');

const httpScoreboardLinkMail = catchAsyncErrors(async (req, res, next) => {
  const data = req.body;
  if (!data.email) {
    return next(new ErrorHandler("Please provide your email", 400))
  }
  const { email } = req.body;
  const link = "https://www.wellbenix.com"
  await ScoreboardLinkSender({ email, link });
  return res.status(200).json({ msg: "Message sent successfully" });
})

module.exports = {
  httpScoreboardLinkMail,
};
