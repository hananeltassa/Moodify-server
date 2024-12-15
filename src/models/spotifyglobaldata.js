'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SpotifyGlobalData extends Model {
    static associate(models) {
      // Future associations can be defined here
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
    },
    {
      sequelize,
      modelName: 'SpotifyGlobalData',
      tableName: 'SpotifyGlobalData',
      timestamps: true, 
      underscored: true, 
    }
  );

  return SpotifyGlobalData;
};
