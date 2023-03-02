const ScoreboardLinkSender = require("./scoreboardLink");

async function httpScoreboardLinkMail(req, res) {
  const data = req.body;
  if (!data.email) {
    return res.status(400).json({ error: "please Provide email" });
  }
  try {
    const { email } = req.body;
    const link = "https://www.wellbenix.com"
    const data = await ScoreboardLinkSender({ email, link });
    return res.status(200).json({ msg: "Message sent successfully" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

module.exports = {
  httpScoreboardLinkMail,
};
