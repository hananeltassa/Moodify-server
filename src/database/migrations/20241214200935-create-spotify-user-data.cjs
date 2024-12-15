'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SpotifyUserData', {
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
      liked_songs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      top_artists: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      playlists: {
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
    await queryInterface.dropTable('SpotifyUserData');
  },
};
