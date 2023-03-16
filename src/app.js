const express = require("express");
const adminRouter = require("./routes/admin/admin.routes");
const imagekitAuthRouter = require("./routes/imagekit/imagekit.routes");
const mailRouter = require("./routes/mail/mail.route");
const userRouter = require('./routes/user/user.routes');
const tournamentRouter = require('./routes/tournament/tournament.routes');
const playerRouter = require('./routes/player/player.routes');
const newsRouter = require("./routes/news/news.routes")
const galleryRouter = require("./routes/gallery/gallery.routes")
const scoreboardRouter = require('./routes/scoreboard/scoreboard.routes')
const errorMiddleware = require("./middlewares/errors");
const cors = require("cors");
const path = require("path");
const app = express();
  
app.use(express.json());
app.use(cors());
app.use(express.static("public/images"));
app.use(express.urlencoded({ extended: false }));

app.use("/admin", adminRouter);
app.use('/user', userRouter);
app.use('/tournament', tournamentRouter);
app.use('/players', playerRouter);
app.use('/news', newsRouter);
app.use('/gallery', galleryRouter);
app.use('/scoreboard', scoreboardRouter);
app.use("/imagekit", imagekitAuthRouter);
app.use("/mail", mailRouter);

//Middleware for errors
app.use(errorMiddleware)

module.exports = app;
