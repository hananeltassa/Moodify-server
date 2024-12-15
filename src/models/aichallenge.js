'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AIChallenge extends Model {
    static associate(models) {
      AIChallenge.belongsTo(models.Challenge, {
        foreignKey: 'challenge_id',
        as: 'challenge',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  AIChallenge.init(
    {
      challenge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Challenges', key: 'id' },
      },
      environment: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AIChallenge',
      tableName: 'AIChallenges',
      timestamps: true, 
      underscored: true, 
    }
  );

  return AIChallenge;
};
