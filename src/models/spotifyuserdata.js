'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotifyUserData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SpotifyUserData.init({
    user_id: DataTypes.INTEGER,
    liked_songs: DataTypes.JSONB,
    top_artists: DataTypes.JSONB,
    playlists: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'SpotifyUserData',
  });
  return SpotifyUserData;
};