import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  logging: env.NODE_ENV === 'development' ? console.log : false,
});
