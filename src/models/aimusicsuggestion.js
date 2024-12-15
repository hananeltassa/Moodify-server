'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AIMusicSuggestion extends Model {
    static associate(models) {
      AIMusicSuggestion.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  AIMusicSuggestion.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      mood: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      suggestion_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      suggestion_details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      environment_factors: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AIMusicSuggestion',
      tableName: 'AIMusicSuggestions',
      timestamps: true, 
      underscored: true, 
    }
  );

  return AIMusicSuggestion;
};
