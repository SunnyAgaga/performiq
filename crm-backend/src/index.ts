import "dotenv/config";
import { app } from "./app.js";
import { connectDatabase } from "./lib/database.js";
import { sequelize } from "./lib/database.js";
import { logger } from "./lib/logger.js";
import { seedDatabase } from "./seeds.js";

import "./models/index.js";

const PORT = parseInt(process.env.CRM_PORT ?? process.env.PORT ?? "3002", 10);

async function start() {
  await connectDatabase();

  await sequelize.sync({ alter: true });
  logger.info("CRM database tables synced");

  await seedDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`HiraCRM backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error(err, "Failed to start CRM backend");
  process.exit(1);
});
