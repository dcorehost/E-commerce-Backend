const bcrypt = require('bcrypt');
const userModel = require("../models/user")
const { generateToken } = require('../middleware/helperMiddleware')

const createAdmin = async (req, res) => {
  try {
    const {
      username,
      emailId,
      phone,
      password,
      confirmPassword,
      dateOfBirth
    } = req.body;

    if (!username || !emailId || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ emailId }, { phone }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email or phone"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await userModel.create({
      username,
      emailId,
      phone,
      password: hashedPassword,
      dateOfBirth,
      typeOfUser: 'Admin',
      active: true
    });

    return res.status(201).json({
      message: "Admin account created successfully",
      adminId: admin._id
    });

  } catch (error) {
    console.error("Create Admin Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, phone, username, password } = req.body;
    console.log("Body data:", req.body);

    if (!emailId && !phone && !username) {
      return res.status(400).send({ message: "Either emailId, phone, or username is required." });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required." });
    }

    let userData;

    if (emailId) {
      userData = await userModel.findOne({ emailId });
    } else if (phone) {
      userData = await userModel.findOne({ phone });
    } else if (username) {
      userData = await userModel.findOne({ username });
    }

    if (!userData) {
      return res.status(404).send({ message: "User not found." });
    }

    if (userData.active === false) {
      return res.status(403).send({ message: "Access denied. User is inactive." });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    console.log("Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }

    const token = generateToken(userData);


    return res.status(200).send({
      message: "Login successful",
      token,
      username: userData.username,
      emailId: userData.emailId,
      phone: userData.phone,
      typeOfUser: userData.typeOfUser
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {createAdmin, login}