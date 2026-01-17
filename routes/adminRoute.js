const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const path = require("path");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/adminAuth");
admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");
admin_route.get("/", auth.isLogout, adminController.loadLogin);
// admin_route.get("*", function (req, res) {
//   res.redirect("/admin");
// });
admin_route.post("/", adminController.verifyLogin);
admin_route.get("/home", auth.isLogin, adminController.loadDashbord);
admin_route.get("/logout", auth.isLogin, adminController.logout);
admin_route.get("/forget", auth.isLogout, adminController.forgetLoad);
admin_route.post("/forget", adminController.forgetVerify);
admin_route.get(
  "/forget-password",
  auth.isLogout,
  adminController.forgetPasswordLoad
);
admin_route.post("/forget-password", adminController.resetPassword);
admin_route.get("/dashboard", auth.isLogin, adminController.adminDashboard);
module.exports = admin_route;
