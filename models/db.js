import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Load environment variables from .env in project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// In db.js, update the Sequelize config:
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('1. Verify MySQL server is running');
        console.error('2. Check credentials in .env file');
        console.error('3. Ensure user has proper permissions');
        console.error('4. Try connecting with MySQL Workbench or CLI first');
        console.error('Error details:', error.original);
        process.exit(1);
    }
})();

export default sequelize;