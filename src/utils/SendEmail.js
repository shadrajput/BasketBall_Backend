const nodemailer = require("nodemailer");

const SendEmail = async (options) => {
  let transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_GEN_PASSWORD, 
    },
  });
  const res = await transpoter.sendMail(options);
};

module.exports= SendEmail