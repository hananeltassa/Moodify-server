'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define the relationships
      User.hasMany(models.SpotifyUserData, {
        foreignKey: 'user_id', // Foreign key in SpotifyUserData
        as: 'spotifyData', // Alias for the association
        onDelete: 'CASCADE', // Automatically delete related SpotifyUserData on User deletion
        onUpdate: 'CASCADE', // Update related SpotifyUserData on User update
      });

      User.hasMany(models.MoodDetectionInput, {
        foreignKey: 'user_id',
        as: 'moodInputs',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      User.hasMany(models.Challenge, {
        foreignKey: 'user_id',
        as: 'challenges',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      User.hasMany(models.AIMusicSuggestion, {
        foreignKey: 'user_id',
        as: 'musicSuggestions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Ensure the name is not empty
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Ensure the email format is valid
          notEmpty: true, // Ensure the email is not empty
        },
      },
      google_id: {
        type: DataTypes.STRING,
        unique: true, // Each Google ID must be unique
        allowNull: true, // Optional field
      },
      spotify_id: {
        type: DataTypes.STRING,
        unique: true, // Each Spotify ID must be unique
        allowNull: true, // Optional field
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional field
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional field
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true, // Profile picture is optional
        validate: {
          isUrl: true, // Ensure it's a valid URL
        },
      },
      role: {
        type: DataTypes.ENUM('normal', 'admin'),
        allowNull: false,
        defaultValue: 'normal', // Default role is "normal"
      },
    },
    {
      sequelize,
      modelName: 'User', // Model name for Sequelize
      tableName: 'Users', // Explicit table name in the database
      timestamps: true, // Automatically include createdAt and updatedAt fields
      underscored: true, // Use snake_case for column names
    }
  );

  return User;
};
