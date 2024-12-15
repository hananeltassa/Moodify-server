'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Challenges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: { 
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: { 
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Challenges');
  },
};
