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
      subject: "Verify Your Email Address",
      html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:30px;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#0d6efd; padding:20px; text-align:center; color:#ffffff;">
                <h2 style="margin:0;">Email Verification</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hi <strong>${name}</strong>,</p>

                <p style="font-size:15px; color:#555;">
                  Thank you for registering with us. Please verify your email address to activate your account.
                </p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="http://127.0.0.1:3000/verify?id=${user_id}"
                     style="
                       background:#0d6efd;
                       color:#ffffff;
                       padding:14px 30px;
                       text-decoration:none;
                       font-size:16px;
                       border-radius:5px;
                       display:inline-block;
                     ">
                    Verify Email
                  </a>
                </div>

                <p style="font-size:14px; color:#777;">
                  If you didn’t create an account, you can safely ignore this email.
                </p>

                <p style="font-size:14px; color:#777;">
                  Regards,<br>
                  <strong>Your App Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#888;">
                © 2026 Your App. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `,
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
// for reset password send mail
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
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:30px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:#0d6efd; padding:15px; text-align:center; color:#ffffff;">
                      <h3 style="margin:0;">Reset Password</h3>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:25px;">
                      <p style="font-size:15px; color:#333;">
                        Hi <strong>${name}</strong>,
                      </p>

                      <p style="font-size:14px; color:#555;">
                        We received a request to reset your password.
                        Click the button below to set a new password.
                      </p>

                      <div style="text-align:center; margin:25px 0;">
                        <a
                          href="http://127.0.0.1:3000/forget-password?token=${token}"
                          style="
                            background:#0d6efd;
                            color:#ffffff;
                            padding:12px 25px;
                            text-decoration:none;
                            border-radius:4px;
                            display:inline-block;
                            font-size:15px;
                          "
                        >
                          Reset Password
                        </a>
                      </div>

                      <p style="font-size:13px; color:#777;">
                        If you didn’t request this, you can safely ignore this email.
                      </p>

                      <p style="font-size:13px; color:#777;">
                        Regards,<br />
                        Your App Team
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
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
