const express = require('express');
const chatroom = require('./chatroom');

const router = express.Router();
router.use('/chatroom', chatroom);

module.exports = router;
