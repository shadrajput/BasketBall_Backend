const express = require("express");
const adminRouter = require("./routes/admin/admin.routes");
const imagekitAuthRouter = require("./routes/imagekit/imagekit.routes");
const mailRouter = require("./routes/mail/mail.route");
const userRouter = require("./routes/user/user.routes");
const tournamentRouter = require("./routes/tournament/tournament.routes");
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
app.use("/imagekit", imagekitAuthRouter);
app.use("/mail", mailRouter);
app.use("/team", teamRouter);

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;
