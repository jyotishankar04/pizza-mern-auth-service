import app from "./app";
import { _config } from "./config";
const startServer = () => {
    try {
        const PORT = _config.PORT;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();