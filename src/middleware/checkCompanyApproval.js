const Company = require("../models/Company");

const checkCompanyApproval = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const company = await Company.findOne({ "user._id": userId });

    if (!company) {
      return res.status(403).json({ message: "Company not found" });
    }

    if (!company.isActive) {
      return res.status(403).json({ message: "Company not approved by admin" });
    }

    next();
  } catch (error) {
    console.error("Company approval check failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkCompanyApproval;
