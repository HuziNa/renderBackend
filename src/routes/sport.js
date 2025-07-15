const express = require("express");
const router = express.Router();
const { Sport } = require("../models");



router.post("/populate", async (req, res) => {
  try {

     const sports = [
      {
        name: "Football",
        description: "Outdoor 11-a-side sport",
        equipment: [
          { name: "Football", required: true, providedByFacility: true },
          { name: "Goalpost", required: true, providedByFacility: true }
        ]
      },
      {
        name: "Tennis",
        description: "Racquet-based court game",
        equipment: [
          { name: "Tennis Ball", required: true, providedByFacility: true },
          { name: "Racquet", required: true, providedByFacility: false }
        ]
      },
      {
        name: "Badminton",
        description: "Shuttlecock sport played in singles or doubles",
        equipment: [
          { name: "Shuttlecock", required: true, providedByFacility: true },
          { name: "Racquet", required: true, providedByFacility: false }
        ]
      },
      {
        name: "Cricket",
        description: "Bat and ball team sport",
        equipment: [
          { name: "Bat", required: true, providedByFacility: false },
          { name: "Ball", required: true, providedByFacility: true },
          { name: "Wickets", required: true, providedByFacility: true }
        ]
      }
    ];

    const insertResults = [];

    for (const sportData of sports) {
      const existing = await Sport.findOne({ name: sportData.name });
      if (!existing) {
        const sport = new Sport(sportData);
        await sport.save();
        insertResults.push(sport.name);
      }
    }

    res.status(201).json({ message: "Sports added", added: insertResults });
  } catch (err) {
    console.error("Populate error:", err);
    res.status(500).json({ message: "Failed to insert sports" });
  }
});

module.exports = router;