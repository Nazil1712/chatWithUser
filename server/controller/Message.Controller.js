const express = require("express");
const Message = require('../model/Message.model');
const router = express.Router();


router.get("/messages", async (req, res) => {
  const { fromUserName, toUserName } = req.query;

  console.log(req.query)
  try {
    const messages = await Message.find({
      $or: [
        { from: fromUserName, to: toUserName },
        { from: toUserName, to: fromUserName }
      ]
    }).sort({ time: 1 }); // Sort by time ascending

    console.log("MESSAGES",messages)
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
})

module.exports = router;
