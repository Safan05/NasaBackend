import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import injectRoutes from './routes/v1/routes.js';
dotenv.config();
process.on("uncaughtException",(exception)=>{console.log("Exception !")});  // used to handle any sync exception that may happen
process.on("unhandledRejection",(exception)=>{console.log("Rejection !")});  // used to handle any asyn rejection that may happen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // your frontend
console.log("Frontend URL:", frontendUrl);
app.use(cors({
   origin: frontendUrl,
  credentials: true               // allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
}));

// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Our Nasa Project Backend API');
});

injectRoutes(app);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
