'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MoodDetectionInputs', {
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
      input_type: {
        type: Sequelize.ENUM('voice', 'face', 'text'), 
        allowNull: false,
      },    
      input_data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      detected_mood: {
        type: Sequelize.STRING(50), 
        allowNull: false,
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
    await queryInterface.dropTable('MoodDetectionInputs');
  },
};
