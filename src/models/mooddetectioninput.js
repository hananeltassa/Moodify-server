'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MoodDetectionInput extends Model {
    static associate(models) {
      MoodDetectionInput.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  MoodDetectionInput.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      input_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      input_data: {
        type: DataTypes.TEXT,
      },
      detected_mood: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'MoodDetectionInput',
      tableName: 'MoodDetectionInputs',
      timestamps: false,
    }
  );

  return MoodDetectionInput;
};
