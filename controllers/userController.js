const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
//for send mail
const sendverifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "merntestingpurpose@gmail.com",
        pass: "frny dbvd mwsp vqbz",
      },
    });
    const mailOptions = {
      from: "merntestingpurpose@gmail.com",
      to: email,
      subject: "For verification mail",
      html:
        "<p>Hii ," +
        name +
        ' ,Please click here to <a href = "http://127.0.0.1:3000/verify?id=' +
        user_id +
        '">Verify</a> Your mail</p>',
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};
const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: spassword,
      isAdmin: 0,
    });
    const userData = await user.save();
    if (userData) {
      sendverifyMail(req.body.name, req.body.email, userData._id);
      return res.render("registration", {
        message:
          "Your registration has been successfully,please verify your email",
      });
    } else {
      return res.render("registration", {
        message: "Your registration has been failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const verifyEmail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    return res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};
//login user methods startd
const loginLoad = async (req, res) => {
  try {
    return res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_verified === 0) {
          return res.render("login", { message: "Please verify your email" });
        } else {
          req.session.user_id = userData._id;
          return res.redirect("/home");
        }
      } else {
        return res.render("login", {
          message: "Email and password in incorrect",
        });
      }
    } else {
      return res.render("login", { message: "Email and pasword is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    return res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadRegister,
  insertUser,
  verifyEmail,
  loginLoad,
  verifyLogin,
  loadHome,
};
