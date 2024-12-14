'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpotifyUserData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define the relationship with the Users table
      SpotifyUserData.belongsTo(models.User, {
        foreignKey: 'user_id', 
        as: 'user',
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE', 
      });
    }
  }

  SpotifyUserData.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'id', 
        },
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE', 
      },
      liked_songs: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      top_artists: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      playlists: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SpotifyUserData',
      tableName: 'SpotifyUserData', // Explicitly set the table name
      timestamps: true, // Enable createdAt and updatedAt fields
    }
  );

  return SpotifyUserData;
};
