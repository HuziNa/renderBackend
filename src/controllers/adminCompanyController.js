const Company = require("../models/Company");
const User = require('../models/User');
const { sendTemplatedEmail } = require('../services/notificationService');

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

    // Approve company
    company.isActive = true;
    await company.save();

    // Find the user who owns this company
    const owner = await User.findById(company.user._id);
    if (owner && owner.email) {
      console.log(`📧 Sending company approval email to ${owner.email}`);

      await sendTemplatedEmail({
        templateName: "companyApproved.html",
        to: owner.email,
        subject: "Your Company Has Been Approved!",
        data: {
          userName: owner.name,
          companyName: company.companyName,
        },
        type: "company_approved",
        title: "Company Approved",
        message: `Congratulations ${owner.name}, your company ${company.companyName} has been approved and is now active on our platform.`,
        userId: owner._id,
        relatedCompany: company._id
      });

      console.log("✅ Approval email sent.");
    } else {
      console.log("⚠️ Company owner has no email. Skipping email.");
    }

    res.status(200).json({ message: "Company approved and notified", company });
  } catch (err) {
    console.error("❌ Error approving company:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllCompanies,
  approveCompany,
};
