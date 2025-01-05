'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.SpotifyUserData, {
        foreignKey: 'user_id',
        as: 'spotifyData',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      User.hasMany(models.UserGeneralMusicData, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      spotify_id: {
        type: DataTypes.STRING,
        unique: true,
      },
      access_token: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
      },
      profile_picture: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      is_banned: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      birthday: { 
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'prefer not to say'),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      underscored: true,
    }
  );

  return User;
};
