const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Task = sequelize.define("Task", {
  taskName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  dueDate: {
    type: DataTypes.STRING,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
  },
});

module.exports = Task;