'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      // A playlist belongs to a user
      Playlist.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'owner',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // A playlist can have many songs
      Playlist.hasMany(models.PlaylistSongs, {
        foreignKey: 'playlist_id',
        as: 'songs', // Associate with PlaylistSongs
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Playlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'My Moodify Favorites',
        validate: {
          notEmpty: true,
        },
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Playlist',
      tableName: 'Playlists',
      timestamps: true,
      underscored: true,
    }
  );

  return Playlist;
};
