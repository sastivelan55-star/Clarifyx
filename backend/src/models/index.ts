import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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

interface ScanAttributes {
  id: string;
  userId: string | null;
  scanType: string;
  status: string;
  riskScore: number | null;
  verdict: string | null;
  createdAt?: Date;
  completedAt: Date | null;
}
interface ScanCreationAttributes extends Optional<ScanAttributes, 'id' | 'status' | 'riskScore' | 'verdict' | 'completedAt'> {}

export class Scan extends Model<ScanAttributes, ScanCreationAttributes> implements ScanAttributes {
  declare id: string;
  declare userId: string | null;
  declare scanType: string;
  declare status: string;
  declare riskScore: number | null;
  declare verdict: string | null;
  declare readonly createdAt: Date;
  declare completedAt: Date | null;
  declare Result?: any;
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verdict: {
    type: DataTypes.STRING,
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

interface ResultAttributes {
  id: string;
  scanId: string;
  data: object;
  metadata: object | null;
  createdAt?: Date;
}
interface ResultCreationAttributes extends Optional<ResultAttributes, 'id' | 'metadata'> {}

export class Result extends Model<ResultAttributes, ResultCreationAttributes> implements ResultAttributes {
  declare id: string;
  declare scanId: string;
  declare data: object;
  declare metadata: object | null;
  declare readonly createdAt: Date;
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
    type: DataTypes.JSON,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Result',
});

// Relationships
User.hasMany(Scan, { foreignKey: 'userId', constraints: false });
Scan.belongsTo(User, { foreignKey: 'userId', constraints: false });

Scan.hasOne(Result, { foreignKey: 'scanId', onDelete: 'CASCADE' });
Result.belongsTo(Scan, { foreignKey: 'scanId' });
