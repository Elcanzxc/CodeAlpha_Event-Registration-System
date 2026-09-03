const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyOrganizedEvents,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get(
  "/my/created",
  protect,
  authorize("organizer", "admin"),
  getMyOrganizedEvents,
);
router.get("/:id", getEventById);

router.post("/", protect, authorize("organizer", "admin"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

module.exports = router;
