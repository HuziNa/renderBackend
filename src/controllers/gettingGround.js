const Ground = require("../models/Ground");
// getting the grounds of a sport and in a specific city
const getGroundsByCityAndSport = async (req, res) => {
  try {
    const { city, sportName } = req.query; // or use req.body / req.params

    if (!city || !sportName) {
      return res.status(400).json({ message: "City and sport name are required" });
    }

    // Query
    const grounds = await Ground.find({
      "location.city": city,
      "sport.name": sportName,
      isActive: true
    }).select("_id name company location capacity amenities");

    res.status(200).json({ grounds });
  } catch (error) {
    console.error("Error fetching grounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getGroundsByCityAndSport,
};
