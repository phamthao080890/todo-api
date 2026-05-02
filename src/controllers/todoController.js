'use strict';

const { Todo } = require('../models');
const { HTTP, MSG } = require('../constants/messages');

/**
 * GET /api/todos
 * Returns all todos belonging to the authenticated user.
 */
async function getAll(req, res) {
  try {
    const todos = await Todo.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.status(HTTP.OK).json({ todos });
  } catch (err) {
    console.error('[getAll]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

/**
 * GET /api/todos/:id
 */
async function getOne(req, res) {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(HTTP.NOT_FOUND).json({ message: MSG.TODO_NOT_FOUND });
    return res.status(HTTP.OK).json({ todo });
  } catch (err) {
    console.error('[getOne]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

/**
 * POST /api/todos
 */
async function create(req, res) {
  try {
    const { title, description } = req.body;
    const todo = await Todo.create({ title: title.trim(), description, userId: req.user.id });
    return res.status(HTTP.CREATED).json({ todo });
  } catch (err) {
    console.error('[create]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

/**
 * PUT /api/todos/:id
 */
async function update(req, res) {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(HTTP.NOT_FOUND).json({ message: MSG.TODO_NOT_FOUND });

    const { title, description, completed } = req.body;
    await todo.update({
      title: title !== undefined ? title.trim() : todo.title,
      description: description !== undefined ? description : todo.description,
      completed: completed !== undefined ? completed : todo.completed,
    });
    return res.status(HTTP.OK).json({ todo });
  } catch (err) {
    console.error('[update]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

/**
 * DELETE /api/todos/:id
 */
async function remove(req, res) {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(HTTP.NOT_FOUND).json({ message: MSG.TODO_NOT_FOUND });
    await todo.destroy();
    return res.status(HTTP.NO_CONTENT).send();
  } catch (err) {
    console.error('[remove]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

module.exports = { getAll, getOne, create, update, remove };
