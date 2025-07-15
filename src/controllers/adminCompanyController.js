const Company = require("../models/Company");

// Get all companies 
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ companies });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve a company by ID
const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.isActive) {
      return res.status(400).json({ message: "Company is already approved" });
    }

    company.isActive = true;
    await company.save();

    res.status(200).json({ message: "Company approved", company });
  } catch (err) {
    console.error("Error approving company:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllCompanies,
  approveCompany,
};
