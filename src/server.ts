import app from "./app";
import { _config } from "./config";
import logger from "./config/logger";
const startServer = () => {
    try {
        const PORT = _config.PORT;
        app.listen(PORT, () => {
            logger.info(`Server running on port: ${PORT}`);

        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

startServer();
