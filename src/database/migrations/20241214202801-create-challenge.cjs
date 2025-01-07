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
        type: Sequelize.JSONB,
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
      time_of_day: {
        type: Sequelize.ENUM('morning', 'afternoon', 'night'),
        allowNull: false,
        defaultValue: 'morning',
      },
      is_daily: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Challenges_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Challenges_time_of_day";');
  },
};
