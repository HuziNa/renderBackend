
// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = {
//   verifyToken
// };


// new cookie system 
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  verifyToken
};
