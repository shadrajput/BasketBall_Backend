const nodemailer = require("nodemailer");

const Email = (options) => {
  let transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,

    auth: {
      user: process.env.USER, // email
      pass: process.env.PASSWORD, //password
    },
  });
  transpoter.sendMail(options, (err, info) => {
    if (err) {
      return;
    }
  });
};

// send email
const ScoreboardLinkSender = ({ email, link }) => {

  const options = {
    from: `Corporate Basketball League <${process.env.USER}>`,
    to: `${email}`,
    subject: "Scoreboard Access",
    html: `
        <div style="width: 100%; background-color: #f3f9ff; padding: 5rem 0">
        <div style="max-width: 700px; background-color: white; margin: 0 auto">
           <div style="width: 100%; background-color: #ADD8E6; padding: 20px 0">
          <a href="" ><img
              src="https://ik.imagekit.io/44qikvq89/logo.png?ik-sdk-version=javascript-1.4.3&updatedAt=1672646698450"
              style="width: 100%; height: 70px; object-fit: contain"
            /></a> 
          
          </div>
          <div style="width: 100%; gap: 10px; padding: 30px 0; display: grid">
            <p style="font-weight: 800; font-size: 1.2rem; padding: 0 30px">
                    Here is your CBL scoreboard link
            </p>
            <div style="font-size: .8rem; margin: 0 30px">
            <h3> Link: ${link} </h3>
             <p style="font-weight:800">Thank You   </p>
              <p style="font-weight:800" >Team CBL</b></p>
            </div>
          </div>
        </div>
      </div>
        `,
  };
  Email(options);
};
module.exports = ScoreboardLinkSender;
