const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const config = require("../config/config");
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
const addUserMail = async (name, email, password, user_id) => {
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
      subject: "Admin add you and verify your mail",
      html:
        "<p>Hii ," +
        name +
        ' ,Please click here to <a href = "http://127.0.0.1:3000/verify?id=' +
        user_id +
        '">Verify</a> Your mail</p><br><br><b>Email:-</b>' +
        email +
        "<br><b>Password:-</b>" +
        password +
        "",
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
      subject: "Reset Your Admin Password",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:30px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:#0d6efd; padding:15px; text-align:center; color:#ffffff;">
                      <h3 style="margin:0;">Reset Admin Password</h3>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:25px;">
                      <p style="font-size:15px; color:#333;">
                        Hi <strong>${name}</strong>,
                      </p>

                      <p style="font-size:14px; color:#555;">
                        We received a request to reset your admin password.
                        Click the button below to set a new password.
                      </p>

                      <div style="text-align:center; margin:25px 0;">
                        <a
                          href="http://127.0.0.1:3000/admin/forget-password?token=${token}"
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
                        Admin Team
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

const loadLogin = async (req, res) => {
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
        if (userData.is_admin === 0) {
          return res.render("login", { message: "Yor are not admin" });
        } else {
          req.session.user_id = userData._id;
          return res.redirect("/admin/home");
        }
      } else {
        return res.render("login", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      return res.render("login", {
        message: "Email and password is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashbord = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    return res.render("home", { admin: userData });
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_admin === 0) {
        res.render("forget", { message: "Email is not correct" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forget", {
          message: "Please check your mail to reset your password",
        });
      }
    } else {
      res.render("forget", { message: "Email is not correct" });
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
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Invalid Link" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const securePass = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: securePass, token: "" } }
    );
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const adminDashboard = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("dashboard", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};
const newUserLoad = async (req, res) => {
  try {
    res.render("new-user");
  } catch (error) {
    console.log(error.message);
  }
};
const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mno = req.body.mno;
    const image = req.file.filename;
    const password = randomstring.generate(8);
    const spassword = await securePassword(password);
    const user = new User({
      name: name,
      email: email,
      mobile: mno,
      image: image,
      password: spassword,
      is_admin: 0,
    });
    const userData = await user.save();
    if (userData) {
      addUserMail(name, email, password, userData._id);
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//edit user functionality
const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateUsers = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        is_verified: req.body.verify,
      }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadLogin,
  verifyLogin,
  loadDashbord,
  logout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUsers,
  deleteUser,
};
