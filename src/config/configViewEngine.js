const express = require("express");
const path = require("path");

const configViewEngine = (app) => {
  app.set("views", path.join("./src", "views"));
  app.set("view engine", "ejs");
};

module.exports = configViewEngine;
