const express = require('express');
const app = express();
const studentsRoutes = require('./routes/students');
const usersRoutes = require('./routes/users');

app.use(express.json());

app.use('/students', studentsRoutes);
app.use('/users', usersRoutes);

app.use((error, req, res, next) => {
  let key = "error";
  if (Array.isArray(error)) {
    key = "errors";
  }
  return res.json({ message: "Unauthorized" });
});

module.exports = app;