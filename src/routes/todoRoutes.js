'use strict';

const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createTodoRules, updateTodoRules } = require('../middlewares/validationMiddleware');
const { getAll, getOne, create, update, remove } = require('../controllers/todoController');

const router = Router();

// All todo routes are protected
router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', createTodoRules, create);
router.put('/:id', updateTodoRules, update);
router.delete('/:id', remove);

module.exports = router;
