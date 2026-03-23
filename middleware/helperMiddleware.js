const express = require('express')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      phone: user.phone,
      emailId: user.emailId,
      typeOfUser: user.typeOfUser,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10h" }
  );
};

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.typeOfUser !== 'Admin') {
      return res.status(403).send({ message: 'Only Admin can impersonate users.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Invalid token.' });
  }
};


const checkAccess = (req, res, allowedRoles = []) => {
  const typeOfUser = req.payload?.typeOfUser;
  console.log("User Type:", typeOfUser);

  if (!Array.isArray(allowedRoles)) {
    res.status(500).send({ message: "allowedRoles must be an array" });
    return false;
  }

  if (!allowedRoles.includes(typeOfUser)) {
    res.status(403).send({ message: "You don't have access." });
    return false;
  }
  return true;
};

const generateOtpToken = async (emailId, otp) => {
  console.log("OTP DATA:", emailId, otp);
  const payload = {
    emailId: emailId,
    otp: otp,
  };
  return jwt.sign(payload, `${process.env.JWT_SECRET}`, {
    expiresIn: '5m',
  });
};


module.exports = { generateToken, verifyAdminToken, checkAccess, generateOtpToken }