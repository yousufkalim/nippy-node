const JWT = require("jsonwebtoken");
const STRINGS = require("../utils/texts");
const User = require("../models/user");

/**
 * If no role is passed the default role is user
 *
 * @param  {String} role role allowed to access the route
 */

function auth() {
  // roles = roles.length > 0 && roles : role.USER;

  return async (req, res, next) => {
    const header = req.get("Authorization");

    if (!header || !header.startsWith("Bearer")) {
      return res.send({ message: "Unauthorized access: Token not found" });
    }
    const token = header.split(" ")[1];
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    let user = await User.findOne({ _id: decoded.id });
    if (!user)
      return res.send({ message: "Unauthorized access: User does not exist" });

    req.user = user;
    req.userId = user._id;

    next();
  };
}

module.exports = auth;
