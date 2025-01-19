'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('MoodDetectionInputs', 'confidence', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('MoodDetectionInputs', 'confidence');
  }
};
