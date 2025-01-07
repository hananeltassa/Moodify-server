'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Challenges', 'time_of_day', {
      type: Sequelize.ENUM('morning', 'afternoon', 'night'),
      allowNull: false,
      defaultValue: 'morning',
    });

    await queryInterface.addColumn('Challenges', 'is_daily', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Challenges', 'time_of_day');
    await queryInterface.removeColumn('Challenges', 'is_daily');
  },
};
