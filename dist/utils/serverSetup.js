var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Redis from 'redis';
import 'dotenv/config';
function getDb(mongoClient) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Option 1: Await the connection and then use the client:
            const connectedClient = yield mongoClient.connect();
            return connectedClient.db('shortie');
        }
        catch (error) {
            console.error('Error starting server:', error);
        }
    });
}
function closeConnection(mongoClient) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Shutting down gracefully...');
        try {
            yield mongoClient.close();
            console.log('MongoDB connection closed.');
            process.exit(0);
        }
        catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
}
;
const getCache = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return Redis.createClient({
        // username: process.env?.REDIS_USERNAME,
        // password: process.env?.REDIS_PASSWORD,
        // socket: {
        // 	host: process.env?.REDIS_HOST,
        // 	port: Number(process.env?.REDIS_PORT)
        // }
        url: (_a = process.env) === null || _a === void 0 ? void 0 : _a.REDIS_URL
    });
});
export default { getDb, getCache, closeConnection };
