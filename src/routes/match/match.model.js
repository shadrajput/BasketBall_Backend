const Joi = require("joi");

const MatchListGetschema = Joi.object({
  pageNo: Joi.number().integer().min(0).required(),
  status: Joi.number().integer().min(-1).max(3).required(),
});

module.exports = {
  MatchListGetschema,
};
