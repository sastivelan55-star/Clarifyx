import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
});

export class Scan extends Model {
  public id!: string;
  public userId!: string | null;
  public scanType!: string;
  public status!: string;
  public riskScore!: number | null;
  public verdict!: string | null;
  public readonly createdAt!: Date;
  public completedAt!: Date | null;
}

Scan.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  scanType: {
    type: DataTypes.ENUM('URL', 'MESSAGE', 'IMAGE', 'VIDEO', 'FAKE_NEWS', 'VOICE'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verdict: {
    type: DataTypes.ENUM('SAFE', 'SUSPICIOUS', 'DANGEROUS'),
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Scan',
});

export class Result extends Model {
  public id!: string;
  public scanId!: string;
  public data!: object;
  public metadata!: object | null;
  public readonly createdAt!: Date;
}

Result.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  scanId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Result',
});

// Relationships
User.hasMany(Scan, { foreignKey: 'userId' });
Scan.belongsTo(User, { foreignKey: 'userId' });

Scan.hasOne(Result, { foreignKey: 'scanId', onDelete: 'CASCADE' });
Result.belongsTo(Scan, { foreignKey: 'scanId' });
