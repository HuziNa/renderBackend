// controllers/slotController.js
// this controller is for getting the slots for the ground and a specific date
// controllers/slotController.js
const mongoose = require('mongoose');
const Slot = require("../models/Slot");
const getSlots = async (req, res) => {
  try {
    const { groundId, date } = req.query;
    console.log('Received query:', { groundId, date });

    // Validate groundId
    if (!mongoose.Types.ObjectId.isValid(groundId)) {
      return res.status(400).json({ message: 'Invalid ground ID' });
    }

    // Build base query
    const query = { 
      'ground._id': new mongoose.Types.ObjectId(groundId),
      isActive: true 
    };

    // Handle date filtering
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
      }

      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      console.log('Date range:', { startDate, endDate });

      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    const slots = await Slot.find(query)
      .populate('template')
      .sort({ date: 1, startTime: 1 });

    console.log('Found slots:', slots.length);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSlots };
