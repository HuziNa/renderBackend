const cron = require("node-cron");
const { updateSlotsDaily } = require("./controllers/slotTemplateController");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running daily slot update job...");
  await updateSlotsDaily();
});
