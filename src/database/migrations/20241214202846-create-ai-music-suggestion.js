'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AIMusicSuggestions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      mood: {
        type: Sequelize.STRING
      },
      suggestion_type: {
        type: Sequelize.STRING
      },
      suggestion_details: {
        type: Sequelize.JSONB
      },
      environment_factors: {
        type: Sequelize.JSONB
      },
      created_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AIMusicSuggestions');
  }
};