'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Challenge extends Model {
    static associate(models) {
      Challenge.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Challenge.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      text: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      time_of_day: {
        type: DataTypes.ENUM('morning', 'afternoon', 'night'),
        allowNull: false,
        defaultValue: 'morning',
      },
      is_daily: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Challenge',
      tableName: 'Challenges',
      timestamps: true, 
      underscored: true, 
    }
  );

  return Challenge;
};
