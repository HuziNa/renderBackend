const { Ground, Company, Sport } = require("../models");
// for creating the ground 

const addGround = async (req, res) => {
  try {
    const companyUserId = req.user.id;

    // Find company associated with this user
    const company = await Company.findOne({ "user._id": companyUserId });
    if (!company) return res.status(404).json({ message: "Company not found" });

    const {
      name,
      description,
      sportName, // choosen from a drop down menu from sports pre defined 
      capacity,
      amenities,
      address,
      city,
    } = req.body;

    // Find sport by name
    const sport = await Sport.findOne({ name: sportName });
    if (!sport) return res.status(404).json({ message: "Sport not found" });

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    // Create the ground with GeoJSON location
    const newGround = await Ground.create({
      company: {
        _id: company._id,
        name: company.companyName
      },
      name,
      description,
      sport: {
        _id: sport._id,
        name: sport.name
      },
      capacity,
      amenities,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
        city,
        area
      }
    });

    res.status(201).json({ message: "Ground added successfully", ground: newGround });
  } catch (error) {
    console.error("Add ground error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addGround };
