const express = require('express');
const userApi = express.Router();
const userController = require('../controllers/user.controller');
const passportAuth = require('../passport');

// api: get  user
userApi.get('/', passportAuth.jwtAuthentication, userController.getUser);

// api: update user
userApi.put('/update', userController.putUpdateUser);

// api: get total user
userApi.get('/total', userController.getTotalUser);

module.exports = userApi;
