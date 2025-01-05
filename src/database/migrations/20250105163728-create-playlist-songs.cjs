"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("PlaylistSongs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      playlist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Playlists",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      source: {
        type: Sequelize.ENUM("local", "spotify", "jamendo"),
        allowNull: false,
      },
      external_id: {
        type: Sequelize.STRING, // Unique song ID from the external source (Spotify/Jamendo)
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB, // Store all song metadata (e.g., title, artist, album, duration)
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
    await queryInterface.dropTable("PlaylistSongs");
  },
};
