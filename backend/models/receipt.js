const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receipt = sequelize.define('Receipt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    emailId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'email_id',
      comment: 'Gmail message ID'
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    merchant: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    sourceEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'source_email',
      validate: {
        isEmail: true
      }
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rawEmailContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'raw_email_content',
      comment: 'Original email content'
    },
    llmResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'llm_response',
      comment: 'JSON response from LLM'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processed', 'failed', 'manual_review'),
      defaultValue: 'processed'
    }
  }, {
    tableName: 'receipts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: false,
        fields: ['user_id', 'email_id']
      },
      {
        fields: ['user_id', 'datetime']
      },
      {
        fields: ['category']
      }
    ]
  });

  Receipt.associate = (models) => {
    Receipt.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Receipt;
};

