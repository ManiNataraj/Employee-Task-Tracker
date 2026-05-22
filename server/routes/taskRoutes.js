const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

router.get("/", async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

router.put("/:id", async (req, res) => {
  await Task.update(req.body, {
    where: { id: req.params.id },
  });

  res.json({
    message: "Task updated",
  });
});

router.delete("/:id", async (req, res) => {
  await Task.destroy({
    where: { id: req.params.id },
  });

  res.json({
    message: "Task deleted",
  });
});

module.exports = router;