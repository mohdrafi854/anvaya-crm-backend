const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sales Agent name is required'],
  },
  email: {
    type: String,
    required: [true, 'Sales Agent email is required'],
    unique : true,
  },
  createdAt:{
    type : Date,
    default : Date.now,
  },
});

const Agent = mongoose.model("Agent", agentSchema)
module.exports = Agent
