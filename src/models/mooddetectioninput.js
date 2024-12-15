'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MoodDetectionInput extends Model {
    /**
     * Define associations here
     * This method will be called automatically by Sequelize's lifecycle.
     */
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
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      input_type: {
        type: DataTypes.ENUM('voice', 'face', 'text'), 
        allowNull: false,
      },
      input_data: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      detected_mood: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'MoodDetectionInput',
      tableName: 'MoodDetectionInputs',
      timestamps: true, 
    }
  );

  return MoodDetectionInput;
};
