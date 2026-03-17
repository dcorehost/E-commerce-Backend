const nodemailer = require("nodemailer");

const sendMail = async (data) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "dcoreerp@gmail.com",
        pass: "phqe cnim ejru rgzv",
      },
    });

    const info = await transporter.sendMail(data);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.log("Mail Error:", error);
    return false;
  }
};

module.exports = { sendMail };
