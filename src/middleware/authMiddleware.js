// // File: src/middleware/authMiddleware.js
// const { verifyToken } = require("../utils/jwt");

// const protect = (roles = []) => {
//   return (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     try {
//       const token = authHeader.split(" ")[1];
//       const decoded = verifyToken(token);

//       if (roles.length && !roles.includes(decoded.role) && !decoded.isGuest) {
//         return res.status(403).json({ message: "Access denied" });
//       }

//       req.user = decoded;
//       next();
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };

// module.exports = { protect };


// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  verifyToken
};
