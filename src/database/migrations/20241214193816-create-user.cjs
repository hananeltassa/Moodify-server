"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      google_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      spotify_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      access_token: Sequelize.TEXT,
      refresh_token: Sequelize.TEXT,
      profile_picture: Sequelize.STRING,
      role: {
        type: Sequelize.ENUM("normal", "admin"),
        allowNull: false,
        defaultValue: "normal",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
