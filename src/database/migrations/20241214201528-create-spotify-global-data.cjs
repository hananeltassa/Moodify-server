'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpotifyGlobalData', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('artist', 'track', 'album'),
        allowNull: false,
      },
      spotify_id: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      popularity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      genre: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      external_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      images: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      followers: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('SpotifyGlobalData');
  },
};
