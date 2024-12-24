"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the ENUM type for gender
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Users_gender" AS ENUM ('male', 'female', 'prefer not to say');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create the Users table
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
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      google_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      spotify_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      is_banned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "prefer not to say"),
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

  async down(queryInterface, Sequelize) {
    // Drop the Users table
    await queryInterface.dropTable("Users");

    // Drop the ENUM type for gender
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_gender";');
  },
};
