const express = require("express");
const User = require("../model/User.model");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, socketId } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { name: name },
      { socketId: socketId, isOn: true },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

router.get("/users", async (req, res) => {
  const loggedInUser = req.query.username;

  console.log("LoggedInUser", loggedInUser);
  try {
    // if (loggedInUser != "" && loggedInUser != null && loggedInUser!= " ") {
    const users = await User.find({ name: { $ne: loggedInUser } }); // Fetch all users
    // console.log(users);
    res.status(200).json(users); // Send users as JSON
    // }
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

router.post("/users", async (req, res) => {
  try {
    const newUser = new User({ name: "Test User", email: "test@example.com" });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

module.exports = router;
