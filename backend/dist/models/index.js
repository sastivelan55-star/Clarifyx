"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.Scan = exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
});
class Scan extends sequelize_1.Model {
}
exports.Scan = Scan;
Scan.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    scanType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'PENDING',
    },
    riskScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    verdict: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Scan',
});
class Result extends sequelize_1.Model {
}
exports.Result = Result;
Result.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    scanId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    data: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Result',
});
// Relationships
User.hasMany(Scan, { foreignKey: 'userId', constraints: false });
Scan.belongsTo(User, { foreignKey: 'userId', constraints: false });
Scan.hasOne(Result, { foreignKey: 'scanId', onDelete: 'CASCADE' });
Result.belongsTo(Scan, { foreignKey: 'scanId' });
