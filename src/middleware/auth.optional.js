// middleware/auth.optional.js
const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
      };
    } catch (err) {
      console.warn("Invalid token provided, treating as guest.");
    }
  }

  next(); // always continue regardless of token
};

module.exports = optionalAuth;
