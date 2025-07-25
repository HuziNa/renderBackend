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

// Generate slots for a specific date using a template
const generateSlotsForDate = async ({ template, ground, company, date }) => {
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
  if (!weekdays.includes(dayjs(date).day())) return;

  const startMin = timeToMinutes(template.startTime);
  const endMin = timeToMinutes(template.endTime);

  for (
    let time = startMin;
    time + template.slotDurationMinutes <= endMin;
    time += template.slotDurationMinutes
  ) {
    const startTime = minutesToTime(time);
    const endTime = minutesToTime(time + template.slotDurationMinutes);

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
      date: dayjs(date).toDate(),
      startTime,
      endTime,
      price: template.pricePerSlot,
      isActive: true,
    });
  }
};

// Generate slots for 14 days
const generateSlotsFromTemplate = async ({ template, ground, company }) => {
  const today = dayjs();
  const endDate = today.add(14, "day");

  for (let date = today; date.isBefore(endDate); date = date.add(1, "day")) {
    await generateSlotsForDate({ template, ground, company, date });
  }
};

// Main API: Create slot template
const createSlotTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      weekdays,// array
      startTime,
      endTime,
      slotDurationMinutes,
      pricePerSlot,
      groundId,
    } = req.body;

    const company = await Company.findOne({ "user._id": userId });
    if (!company) return res.status(404).json({ message: "Company not found" });

    const ground = await Ground.findById(groundId);
    if (!ground) return res.status(404).json({ message: "Ground not found" });

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

    await generateSlotsFromTemplate({ template, ground, company });

    res.status(201).json({
      message: "Slot template created and 2 weeks of slots generated",
      template,
    });
  } catch (error) {
    console.error("Error creating slot template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Daily job: remove yesterday’s slots, add next day
const updateSlotsDaily = async () => {
  try {
    const yesterday = dayjs().subtract(1, "day").endOf("day");

    // Remove slots older than yesterday
    await Slot.deleteMany({ date: { $lt: yesterday.toDate() } });

    const templates = await SlotTemplate.find();

    for (const template of templates) {
      const ground = await Ground.findById(template.ground._id);
      const company = await Company.findById(template.company._id);

      // New date to generate: 14 days ahead from today
      const nextDate = dayjs().add(14, "day");

      await generateSlotsForDate({ template, ground, company, date: nextDate });
    }

    console.log("✅ Daily slots updated");
  } catch (err) {
    console.error("❌ Daily slot update error:", err);
  }
};

// When a template is edited
const updateSlotTemplate = async (req, res) => {
  try {
    const templateId = req.params.templateId;
    const updatedData = req.body;

    const template = await SlotTemplate.findByIdAndUpdate(
      templateId,
      updatedData,
      { new: true }
    );
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    await Slot.deleteMany({ template: template._id });

    const ground = await Ground.findById(template.ground._id);
    const company = await Company.findById(template.company._id);
    await generateSlotsFromTemplate({ template, ground, company });

    res.status(200).json({ message: "Template updated and slots regenerated" });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  createSlotTemplate,
  updateSlotsDaily,
  updateSlotTemplate,
};
