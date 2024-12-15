'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AIMusicSuggestions', {
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
      mood: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      suggestion_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      suggestion_details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      environment_factors: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable('AIMusicSuggestions');
  },
};
