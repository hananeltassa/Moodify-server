'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
      },
      suggestion_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      suggestion_details: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      environment_factors: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'AIMusicSuggestion',
      tableName: 'AIMusicSuggestions',
      timestamps: false,
    }
  );

  return AIMusicSuggestion;
};
