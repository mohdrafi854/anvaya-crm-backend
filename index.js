const express = require("express");
const app = express();
const cors = require("cors");

const { initializeDatabase } = require("./db/db.connect");
const Lead = require("./models/lead.model");
const Agent = require("./models/agent.model");
const Comments = require("./models/comment.model");

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.send("Hello Backend Start Now");
});

async function createLead(newLead) {
  try {
    const lead = new Lead(newLead);
    await lead.save();
    return lead;
  } catch (error) {
    throw error;
  }
}

app.post("/leads", async (req, res) => {
  console.log("Request Body: ", req.body);
  try {
    const { name, source, status, tags, timeToClose, priority } = req.body;

    const lead = new Lead({
      name,
      source,
      status,
      tags,
      timeToClose,
      priority,
      salesAgent: req.body.salesAgent,
    });
    await lead.save();
    res.status(201).json({ message: "Lead Added Successfully", lead });
  } catch (error) {
    res.status(500).json({ error: "Failed to add Lead" });
  }
});

async function readAllLead() {
  try {
    const allLead = await Lead.find();
    return allLead;
  } catch (error) {
    throw error;
  }
}

app.get("/leads", async (req, res) => {
  try {
    const lead = await readAllLead();
    if (lead.length != 0) {
      res.json(lead);
    } else {
      res.status(404).json({ error: "No Lead Found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Lead." });
  }
});

async function updateLeadById(leadId, updateData) {
  try {
    const updateLead = await Lead.findByIdAndUpdate(leadId, updateData, {
      new: true,
    });
    return updateLead;
  } catch (error) {
    console.log("Error in update lead", error);
  }
}

app.patch("/leads/:id", async (req, res) => {
  try {
    const updateLead = await updateLeadById(req.params.id, req.body);
    if (updateLead) {
      res.status(201).json({ message: "Lead updated successfully." });
    } else {
      res.status(404).json({ message: "Lead does not exist." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

async function leadDeleteById(leadId) {
  try {
    const lead = await Lead.findByIdAndDelete(leadId);
    return lead;
  } catch (error) {
    console.log("Error in a delete a lead");
  }
}

app.delete("/leads/:id", async (req, res) => {
  try {
    const lead = await leadDeleteById(req.params.id);
    if (lead) {
      res.status(201).json({ message: "Lead delete successfully." });
    }
  } catch (error) {
    res.status(400).json({ error: `Lead with ID ${lead} not found.` });
  }
});

// agents

async function createAgent(newAgent) {
  try {
    const agent = new Agent(newAgent);
    const save = await agent.save();
  } catch (error) {
    throw error;
  }
}

async function emailExist(emailId) {
  try {
    const isEmail = await Agent.findOne({ email: emailId });
    return isEmail;
  } catch (error) {
    throw error;
  }
}

app.post("/agents", async (req, res) => {
  const { name, email } = req.body;
  try {
    const exist = await emailExist(req.body.email);
    if (exist) {
      res
        .status(409)
        .json({ error: `Sales agent with email ${email} already exists.` });
    }
    const agentData = new Agent({ name, email });
    await agentData.save();
    res
      .status(201)
      .json({ message: "Agent added successfully.", agent: agentData });
  } catch (error) {
    res.status(500).json({ error: "Failed to add agent" });
  }
});

async function readAllAgent() {
  try {
    const agent = await Agent.find();
    return agent;
  } catch (error) {
    throw error;
  }
}

app.get("/agents", async (req, res) => {
  try {
    const agent = await readAllAgent();
    if (agent.length != 0) {
      res.json(agent);
    } else {
      res.status(404).json({ error: "No Agent found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent" });
  }
});

async function createComments(newComment) {
  try {
    const comments = new Comments(newComment);
    const saveComments = await comments.save();
  } catch (error) {
    throw error;
  }
}

app.post("/leads/:id/comment", async (req, res) => {
  const leadId = req.params
  const {author, commentText} = req.body
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      res
        .status(404)
        .json({ error: "Lead with ID '64c34512f7a60e36df44' not found." });
    }
    const newComment = new Comments({commentText, author})
    await newComment.save()
    res.status(201).json({message: "Reached out to lead, waiting for response.", comment : newComment})
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment" });
  }
});

async function readAllComment(leadId) {
  try {
    const lead = await Lead.findById(leadId);
    return lead;
  } catch (error) {
    throw error;
  }
}

app.get("/leads/:id/comments", async (req, res) => {
  try {
    const comment = await readAllComment(req.params.id);
    if (comment.length != 0) {
      res.json(comment);
    } else {
      res.status(404).json({ error: "no comment found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment" });
  }
});

async function fetchAllLeads() {
  try {
    const lead = await Lead.find({ status: "New" });
    return lead;
  } catch (error) {
    throw error;
  }
}

app.get("/report/last-week", async (req, res) => {
  try {
    const closedLeads = await fetchAllLeads();
    if (closedLeads) {
      res.json(closedLeads);
    } else {
      res.status(404).json({ error: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports of last week." });
  }
});

app.get("/report/pipeline", async (req, res) => {
  try {
    const notClosedLeads = await Lead.find({ status: "Closed" });
    if (notClosedLeads.length === 0) {
      res.json(notClosedLeads);
    } else {
      res.status(404).json({ error: "Lead not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to Fetch Lead." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
