var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import e from 'express';
import rateLimit from 'express-rate-limit';
import shortenRouter from './routes/shorten.js';
import analyticsRouter from './routes/analytics.js';
import { ExpressAuth } from "@auth/express";
import authMiddleware from './middlewares/auth.middleware.js';
import geoip from "geoip-lite";
import 'dotenv/config';
const app = e();
app.set("trust proxy", 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit : 100 requests per windowMs
});
app.use('/api/auth', limiter);
app.use('/api/shorten', limiter);
app.use('/api/analytics', limiter);
app.use("/api/auth/*", ExpressAuth(authUtils.authOptions));
//set session in res.locals to check if logged in
//auth check is done in the routers separately, if to be kept private
app.use(authMiddleware.authSession);
const showAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`<h2>${JSON.stringify(res.locals.session)}</h2>
      <p>${req.header('Cookie')}</p>
    `);
    return;
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield showAuth(req, res);
}));
app.get('/:alias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const alias = req.params.alias;
    if (!alias) {
        yield showAuth(req, res);
        return;
    }
    // we have an alias
    // console.log("getting cache")
    const plsdontlog = 'clean' in req.query ? true : false;
    console.log("req query was: ", plsdontlog);
    console.log("plsdontlog was: ", plsdontlog);
    const redisDb = yield serverSetup.getCache();
    const db = yield serverSetup.getDb(mongoClient);
    try {
        const alias = req.params.alias;
        // console.log("connecting to redis...")
        yield redisDb.connect();
        // alias response contains longUrl, urlBy, topic
        let longUrl, urlBy, topic;
        const redisGot = yield redisDb.get(alias);
        if (!redisGot) {
            // cache miss :(
            // try mongo
            console.log("cache miss");
            console.log("redis returned:", longUrl);
            const url = yield db.collection('urls').findOne({ alias });
            if (!url) {
                // nowhere to be found
                res.status(404).json({ error: 'URL for the given alias not found' });
                return;
            }
            console.log("url got: ", url);
            urlBy = url.createdBy;
            topic = url.topic;
            longUrl = url.longUrl;
            redisDb.set(alias, `${longUrl};${urlBy};${topic}`).then(() => {
                redisDb.disconnect();
            });
        }
        else {
            // cache hit!
            console.log("cache hit");
            console.log("redisGot", redisGot);
            [longUrl, urlBy, topic] = redisGot.split(';');
        }
        if (!plsdontlog) {
            const userAgentOg = req.header('user-agent').toLowerCase() || '';
            const userAgent = userAgentOg.toLowerCase();
            let os = 'Unknown';
            if (userAgent.includes('windows')) {
                os = 'Windows';
            }
            else if (userAgent.includes('iphone') || userAgent.includes('iphone os')) {
                os = 'iPhone';
            }
            else if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
                os = 'macOS';
            }
            else if (userAgent.includes('android')) {
                os = 'Android';
            }
            else if (userAgent.includes('linux')) {
                os = 'Linux';
            }
            else if (userAgent.includes('curl')) {
                os = 'Terminal';
            }
            const ip = req.ip || req.header('x-forwarded-for');
            var geo = geoip.lookup(ip);
            // log analytics
            const analytic = {
                _id: undefined,
                timestamp: new Date(),
                userAgent: userAgentOg,
                location: {
                    lat: (_a = geo === null || geo === void 0 ? void 0 : geo.ll[0]) !== null && _a !== void 0 ? _a : 0,
                    lng: (_b = geo === null || geo === void 0 ? void 0 : geo.ll[1]) !== null && _b !== void 0 ? _b : 0
                },
                alias,
                os,
                ip,
                urlBy,
                topic
            };
            const result = yield (db === null || db === void 0 ? void 0 : db.collection('analytics').insertOne(analytic));
        }
        res.redirect(301, longUrl);
    }
    catch (err) {
        res.status(500).json({ error: `Internal server error: ${err}` });
    }
}));
// Parse incoming requests data
app.use(e.urlencoded({ extended: true }));
app.use(e.json());
// auth checking middlewares are in respective routes
app.use('/api/shorten', shortenRouter);
app.use('/api/analytics', analyticsRouter);
// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import serverSetup from './utils/serverSetup.js';
import mongoClient from './utils/mongodb.js';
import authUtils from './utils/authUtils.js';
const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down gracefully...');
    try {
        yield serverSetup.closeConnection(mongoClient);
        console.log('MongoDB connection closed.');
        process.exit(0);
    }
    catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}));
