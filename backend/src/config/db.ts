import { Sequelize } from 'sequelize';
import { env } from './env';

const sequelize = new Sequelize(env.db.name!, env.db.user!, env.db.password!, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: false,
});

export default sequelize;