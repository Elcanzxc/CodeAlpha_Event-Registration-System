const express = require('express');
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventAttendees
} = require('../controllers/regController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', registerForEvent);
router.get('/my', getMyRegistrations);
router.put('/:id/cancel', cancelRegistration);
router.get('/event/:eventId', authorize('organizer', 'admin'), getEventAttendees);

module.exports = router;
