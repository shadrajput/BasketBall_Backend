const SendEmail = require('../../utils/SendEmail')

// send email
const scoreboardLinkMail = async ({ scorer_email, link, team_1, team_2, match_start_date, match_start_time, address,}) => {

  const options = {
    from: `Corporate Basketball League <${process.env.EMAIL}>`,
    to: `${scorer_email}`,
    subject: "Scoreboard Access",
    html: `
      <div style="font-family: sans-serif; width: 100%; background-color: #f3f9ff; padding: 5rem 0">
        <div style="max-width: 700px; background-color: white; margin: 0 auto">
          <div style="width: 100%; background-color:black; padding: 20px 0">
            <a href="https://thecbl.in" >
              <img
                src="https://ik.imagekit.io/uz4hsgydu/Default/logo.png?updatedAt=1681908076921"
                style="width: 100%; height: 70px; object-fit: contain"
              />
            </a> 
            <h3 style="color: rgb(162, 162, 162); text-align: center;">Corporate Basketball League</h3>
          </div>
          <div style="width: 100%; padding: 0px 30px; margin-top: 30px; display: flex; align-items: center">
            <h4 style="font-weight: 600; color: #ee6730; margin-top: auto; margin-bottom: auto; font-size: 1rem;">${team_1}</h4>
            <span style="font-size: 0.9rem; font-weight: 600; color: gray; margin-left: 10px; margin-right: 10px; margin-top: auto; margin-bottom: auto;">VS</span>
            <h4 style="font-weight: 600; color: #ee6730; margin-top: auto; margin-bottom: auto; font-size: 1rem;">${team_2}</h4>
          </div>
          <div style="width: 100%; padding: 0 30px;">
            <div>
              <h4 style="font-weight: 400; font-size:0.9rem;"> <span style="font-weight: bold">Date:</span> ${!match_start_date ? '--' : match_start_date}</h4>
            </div>
            <div>
              <h4 style="font-weight: 400; font-size:0.9rem;"> <span style="font-weight: bold">Time:</span> ${!match_start_time ? '--' : match_start_time}</h4>
            </div>
            <div>
              <h4 style="font-weight: 400; font-size:0.9rem;"> <span style="font-weight: bold">Address:</span> ${!address ? '--' : address}</h4>
            </div>
          </div>
          <div style="width: 100%; gap: 10px; padding: 20px 0; display: grid">
            <p style="font-weight: 700; font-size: 1rem; padding: 0 30px">
                    Here is your match scoreboard link
            </p>
            <h3 style="font-size: .8rem; margin: 0px 30px"> Link: <a href=${link} style="text-decoration: none;">${link}</a></h3>
            <div style="font-size: 0.9rem; margin: 20px 30px">
              <p style="font-weight:700">Thank You   </p>
              <p style="font-weight:700" >Team CBL</b></p>
            </div>
          </div>
        </div>
      </div>
        `,
  };
  await SendEmail(options);
};
module.exports = scoreboardLinkMail;
