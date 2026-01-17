const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");
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
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
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
//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For Reset password",
      html:
        "<p>Hii ," +
        name +
        ' ,Please click here to <a href = "http://127.0.0.1:3000/forget-password?token=' +
        token +
        '">Reset</a> Your password</p>',
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
          res.render("login", { message: "Please verify your email" });
        } else {
          req.session.user_id = userData._id;
          return res.redirect("/home");
        }
      } else {
        res.render("login", {
          message: "Email and password in incorrect",
        });
      }
    } else {
      res.render("login", { message: "Email and pasword is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    console.log(req.session.user_id);
    const userData = await User.findById({ _id: req.session.user_id });
    return res.render("home", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};
const forgetLoad = async (req, res) => {
  try {
    return res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 0) {
        return res.render("forget", { message: "Please verify your email" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        return res.render("forget", {
          message: "Please check your email to reset password",
        });
      }
    } else {
      return res.render("forget", { message: "User Email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      return res.render("forget-password", { user_id: tokenData._id });
    } else {
      return res.render("404", { message: "Token is invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password } }
    );
    return res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
const userLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.redirect("/home");
      }

      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  } catch (error) {
    console.log(error.message);
  }
};
//for verification send mail link
const verificationLoad = async (req, res) => {
  try {
    res.render("verification");
  } catch (error) {
    console.log(error.message);
  }
};
const sentVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      sendverifyMail(userData.name, userData.email, userData._id);
      res.render("verification", {
        message: "Resend verification link in your mail,please check your mail",
      });
    } else {
      res.render("verification", { message: "This email is not exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
          },
        }
      );
    }
    res.redirect("/home");
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
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  userLogout,
  verificationLoad,
  sentVerificationLink,
  editLoad,
  updateProfile,
};
