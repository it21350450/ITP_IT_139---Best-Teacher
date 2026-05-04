const express = require('express');
const { getTeachers } = require('../controllers/teacherController');

const router = express.Router();

router.route('/')
  .get(getTeachers);

module.exports = router;
