import app from "./app";
import { _config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const PORT = _config.PORT;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Optionally exit the process here if needed
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error}`);
    process.exit(1);
});

async function initializeDatabase() {
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        return true;
    } catch (error) {
        logger.error("Database connection failed:", error);
        return false;
    }
}

async function startServer() {
    const dbConnected = await initializeDatabase();

    if (!dbConnected) {
        logger.error("Cannot start server without database connection");
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        logger.info(`Server running on port: ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully');
        server.close(() => {
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        logger.info('SIGINT received. Shutting down gracefully');
        server.close(() => {
            process.exit(0);
        });
    });
}

startServer().catch(error => {
    logger.error("Failed to start server:", error);
    process.exit(1);
});