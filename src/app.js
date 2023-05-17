const express = require("express");
const adminRouter = require("./routes/admin/admin.routes");
const imagekitAuthRouter = require("./routes/imagekit/imagekit.routes");
const mailRouter = require("./routes/mail/mail.route");
const userRouter = require("./routes/user/user.routes");
const tournamentRouter = require("./routes/tournament/tournament.routes");
const playerRouter = require("./routes/player/player.routes");
const newsRouter = require("./routes/news/news.routes");
const galleryRouter = require("./routes/gallery/gallery.routes");
const scoreboardRouter = require("./routes/scoreboard/scoreboard.routes");
const matchRouter = require("./routes/match/match.routes");
const errorMiddleware = require("./middlewares/errors");
const cors = require("cors");
const path = require("path");
const teamRouter = require("./routes/team/team.routes");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public/images"));
app.use(express.urlencoded({ extended: false }));

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/tournament", tournamentRouter);
app.use("/player", playerRouter);
app.use("/news", newsRouter);
app.use("/gallery", galleryRouter);
app.use("/scoreboard", scoreboardRouter);
app.use("/match", matchRouter);
app.use("/imagekit", imagekitAuthRouter);
app.use("/mail", mailRouter);
app.use("/team", teamRouter);


// if(process.env.NODE_ENV == 'development'){
  app.use(express.static('client/dist'))
  app.get("/*", (req, res) => 
    res.sendFile(path.resolve(__dirname,'..','client','dist','index.html'))
  )
// }
//Middleware for errors
app.use(errorMiddleware);


module.exports = app;
