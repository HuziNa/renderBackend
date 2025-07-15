const { Ground, Company } = require("../models");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Slot = require("../models/Slot");
const SlotTemplate = require("../models/SlotTemplate");

// Convert "HH:mm" to total minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.trim().split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to "HH:mm"
const minutesToTime = (minutes) => {
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hrs}:${mins}`;
};

// Generate slots from a template
const generateSlotsFromTemplate = async ({ template, ground, company }) => {
  const today = dayjs();
  const endDate = today.add(30, "day");

  const weekdayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const weekdays = template.weekdays.map((day) => weekdayMap[day]);

  console.log(`Generating slots for Template ID: ${template._id}, Ground: ${ground._id}, Company: ${company._id}`);

  for (let date = today; date.isBefore(endDate); date = date.add(1, "day")) {
    if (!weekdays.includes(date.day())) continue;

    const startMin = timeToMinutes(template.startTime);
    const endMin = timeToMinutes(template.endTime);

    for (
      let time = startMin;
      time + template.slotDurationMinutes <= endMin;
      time += template.slotDurationMinutes
    ) {
      const startTime = minutesToTime(time);
      const endTime = minutesToTime(time + template.slotDurationMinutes);

      console.log(`Creating slot on ${date.format("YYYY-MM-DD")} from ${startTime} to ${endTime}`);

      await Slot.create({
        template: template._id,
        ground: {
          _id: ground._id,
          name: ground.name,
        },
        company: {
          _id: company._id,
          name: company.name,
        },
        date: date.toDate(),
        startTime,
        endTime,
        price: template.pricePerSlot,
        isActive: true,
      });
    }
  }
};

// Main API: Create slot template
const createSlotTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { weekdays, startTime, endTime, slotDurationMinutes, pricePerSlot, groundId } = req.body;

    // 1. Find the company from the authenticated user
    const company = await Company.findOne({ "user._id": userId });
    if (!company) return res.status(404).json({ message: "Company not found" });

    // 2. Get ground (using provided ID or fallback to hardcoded)
    const groundToUseId = groundId || "68702bc07b243c075d2502c9";
    const ground = await Ground.findById(groundToUseId);
    if (!ground) return res.status(404).json({ message: "Ground not found" });

    // 3. Create the slot template
    const template = await SlotTemplate.create({
      company: {
        _id: company._id,
        name: company.companyName,
      },
      ground: {
        _id: ground._id,
        name: ground.name,
      },
      weekdays,
      startTime,
      endTime,
      slotDurationMinutes,
      pricePerSlot,
    });

    // 4. Generate slots using explicit data
    await generateSlotsFromTemplate({
      template,
      ground: {
        _id: ground._id,
        name: ground.name,
      },
      company: {
        _id: company._id,
        name: company.companyName,
      },
    });

    res.status(201).json({
      message: "Slot template created and slots generated",
      template,
    });
  } catch (error) {
    console.error("Error creating slot template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSlotTemplate,
};
