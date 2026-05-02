'use strict';

const sequelize = require('../config/database');
const User = require('./User');
const Todo = require('./Todo');

// Associations
User.hasMany(Todo, { foreignKey: 'userId', as: 'todos', onDelete: 'CASCADE' });
Todo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Todo };
