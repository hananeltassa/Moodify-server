'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SpotifyGlobalData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here if needed in the future
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
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
    }
  );

  return SpotifyGlobalData;
};
