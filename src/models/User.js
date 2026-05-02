'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    // Store the bcrypt hash — never the raw password
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

// Never expose the password hash in serialized output
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
