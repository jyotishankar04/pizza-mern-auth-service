import app from "./app";
import { _config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";
const startServer = async () => {
    const PORT = _config.PORT;
    try {
        await AppDataSource.initialize()
            .then(async () => {
                logger.info("Database connected");
            })
            .catch((error) => {
                logger.error(error);
            });
        app.listen(PORT, () => {
            logger.info(`Server running on port: ${PORT}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

startServer();
