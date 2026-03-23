const bcrypt = require('bcrypt');
const userModel = require("../models/user")
const { generateToken } = require('../middleware/helperMiddleware')
const { checkAccess } = require('../middleware/helperMiddleware')
const { sendMail } = require("../middleware/mail");
const { generateOtpToken } = require('../middleware/helperMiddleware')
const jwt = require('jsonwebtoken')

const generateOTP = () =>                     
  Math.floor(100000 + Math.random() * 900000).toString();

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

const createUser = async (req, res) => {
  try {

    const {
      username,
      emailId,
      password,
      confirmPassword,
      phone,
      dateOfBirth
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send({ message: "Passwords do not match." });
    }

    const existingUser = await userModel.findOne({ $or: [{ emailId }, { phone }] });
    if (existingUser) {
      return res.status(400).send({ message: "An account already exists with this email or phone." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      username,
      emailId,
      phone,
      dateOfBirth,
      password: hashedPassword,
      typeOfUser: "User",
      active: true,
    });

    await user.save();

    res.status(201).send({ message: "User account created successfully." });

  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
// password 
const sendOtpForPasswordReset = async (req, res) => {
  const { emailId } = req.body;

  if (!emailId) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {

    const user = await userModel.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }
    const otp = generateOTP();
    const token = await generateOtpToken(emailId, otp);

    await sendMail({
      from: process.env.EMAIL_USER,
      to: emailId,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent to email",
      token,
    });

  } catch (err) {
    console.error("Error in sendOtpForPasswordReset:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtpAndUpdatePassword = async (req, res) => {

  const { otp, newPassword, confirmPassword } = req.body;
  const token = req.query.token;

  if (!token || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await userModel.findOne({ emailId: decoded.emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
      user: {
        _id: user._id,
        emailId: user.emailId,
      },
    });

  } catch (err) {
    console.error("Error in verifyOtpAndUpdatePassword:", err.message);
    return res.status(401).json({ message: "OTP expired or token invalid" });
  }
}; 

const changePassword = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin", "User"])) return;

    const userId = req.payload._id;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match"
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Error in changePassword:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};


module.exports = {createAdmin, login ,createUser ,sendOtpForPasswordReset, verifyOtpAndUpdatePassword, changePassword}