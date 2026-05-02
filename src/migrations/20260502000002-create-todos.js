'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('todos', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }, { ifNotExists: true });

    // addIndex is not idempotent — skip if it already exists
    const indexes = await queryInterface.showIndex('todos');
    const exists = indexes.some((i) => i.name === 'todos_user_id_idx');
    if (!exists) {
      await queryInterface.addIndex('todos', ['userId'], {
        name: 'todos_user_id_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', 'todos_user_id_idx');
    await queryInterface.dropTable('todos');
  },
};
