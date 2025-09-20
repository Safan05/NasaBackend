import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString
});
pool.query('SELECT 1') // Simple query to test connection
  .then(() => console.log('Database connected successfully ✅'))
  .catch((err) => {console.error('Error connecting to the database ❌:', err.message); throw(err)});
export default pool; // Export the pool instance