'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SpotifyGlobalData extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  SpotifyGlobalData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM('artist', 'track', 'album'),
        allowNull: false,
      },
      spotify_id: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      genre: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      external_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      images: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      followers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SpotifyGlobalData',
      tableName: 'SpotifyGlobalData',
      timestamps: true, // Automatically adds createdAt and updatedAt fields
      underscored: true, // Use snake_case column names
    }
  );

  return SpotifyGlobalData;
};
