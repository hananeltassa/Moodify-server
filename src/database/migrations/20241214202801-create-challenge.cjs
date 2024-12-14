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
        type: Sequelize.STRING,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), 
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), 
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Challenges');
  },
};
