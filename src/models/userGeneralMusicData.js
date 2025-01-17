"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserGeneralMusicData extends Model {
    static associate(models) {
      UserGeneralMusicData.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

    }
  }

  UserGeneralMusicData.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      music_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("track", "album", "playlist"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserGeneralMusicData",
      tableName: "UserGeneralMusicData",
      timestamps: true,
      underscored: true,
    }
  );

  return UserGeneralMusicData;
};
