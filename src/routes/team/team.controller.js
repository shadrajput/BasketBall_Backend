const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const formidable = require("formidable");

const httpTeamRegister = catchAsyncErrors(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  console.log("body", req.body);
  form.parse(req, async function (err, fields, files) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    console.log("as", fields);
  });
  res.json(req.body);
});

module.exports = {
  httpTeamRegister,
};
