const Registration = require("../models/Registration");
const Event = require("../models/Event");

exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "This event has been cancelled" });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Sorry, this event is fully booked! No remaining seats.",
      });
    }

    const existingReg = await Registration.findOne({
      user: req.user.id,
      event: eventId,
      status: "confirmed",
    });

    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    const registration = await Registration.create({
      user: req.user.id,
      event: eventId,
      notes: notes || "",
    });

    event.registeredCount += 1;
    await event.save();

    await registration.populate("event", "title date location price image");

    res.status(201).json({
      success: true,
      message: "Successfully registered for event!",
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate({
        path: "event",
        select: "title description category date location image price status",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    if (
      registration.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this registration",
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Registration is already cancelled",
      });
    }

    registration.status = "cancelled";
    await registration.save();

    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Registration successfully cancelled. Seat released.",
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view attendees for this event",
      });
    }

    const attendees = await Registration.find({
      event: req.params.eventId,
      status: "confirmed",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};
