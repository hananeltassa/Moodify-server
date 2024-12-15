'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SpotifyUserData extends Model {
    static associate(models) {
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
      tableName: 'SpotifyUserData',
      timestamps: true,
      underscored: true, 
    }
  );

  return SpotifyUserData;
};
