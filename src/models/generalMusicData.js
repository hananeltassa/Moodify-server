"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class GeneralMusicData extends Model {
    static associate(models) {
      GeneralMusicData.hasMany(models.UserGeneralMusicData, {
        foreignKey: "music_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      
    }
  }

  GeneralMusicData.init(
    {
      type: {
        type: DataTypes.ENUM("track", "album", "playlist"), 
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      genre: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      popularity: {
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
    },
    {
      sequelize,
      modelName: "GeneralMusicData",
      tableName: "GeneralMusicData",
      timestamps: true,
      underscored: true,
    }
  );
  

  return GeneralMusicData;
};
