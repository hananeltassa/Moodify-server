'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PlaylistSongs extends Model {
    static associate(models) {
      // A PlaylistSongs entry belongs to a playlist
      PlaylistSongs.belongsTo(models.Playlist, {
        foreignKey: 'playlist_id',
        as: 'playlist',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  PlaylistSongs.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      source: {
        type: DataTypes.ENUM("local", "spotify", "jamendo"),
        allowNull: false,
        validate: {
          isIn: [["local", "spotify", "jamendo"]],
        },
      },
      external_id: {
        type: DataTypes.STRING, // Unique ID from Spotify/Jamendo
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PlaylistSongs',
      tableName: 'PlaylistSongs',
      timestamps: true,
      underscored: true,
    }
  );

  return PlaylistSongs;
};
