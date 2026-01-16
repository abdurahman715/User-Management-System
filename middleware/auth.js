const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
    } else {
      return res.redirect("users/login");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect("users/home");
    }
    next();
  } catch (error) {
    console.log(error.messsage);
  }
};
module.exports = { isLogin, isLogout };
