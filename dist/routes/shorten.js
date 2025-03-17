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
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import authMiddleware from '../middlewares/auth.middleware.js';
import serverSetup from '../utils/serverSetup.js';
import mongoClient from '../utils/mongodb.js';
const TOPIC_LENGTH_LIMIT = 50;
const ALIAS_LENGTH_LIMIT = 50;
const LONG_URL_LENGTH_LIMIT = 1000;
const router = e.Router();
router.use(authMiddleware.authenticatedUser);
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield serverSetup.getDb(mongoClient);
    const redisDb = yield serverSetup.getCache();
    try {
        console.log(req.body);
        const { longUrl, customAlias, topic } = req.body;
        console.log(longUrl);
        console.log(customAlias);
        console.log(topic);
        if (topic.includes(';') || topic.trim().length > TOPIC_LENGTH_LIMIT || topic.trim().length < 5) {
            res.status(400).json({ error: 'Please enter a better topic name' });
            return;
        }
        if (customAlias.includes('overall') || customAlias.trim().length > ALIAS_LENGTH_LIMIT || customAlias.trim().length < 5) {
            res.status(400).json({ error: 'Please enter a better custom alias' });
            return;
        }
        if (longUrl.trim().length > LONG_URL_LENGTH_LIMIT || longUrl.trim().length < 4) {
            res.status(400).json({ error: 'Please enter a better long URL' });
            return;
        }
        const alias = customAlias || uuidv4().substring(0, 6);
        const url = {
            longUrl,
            alias,
            topic,
            // to be provided by auth middleware
            createdBy: res.locals.session.user.email,
            createdAt: Date.now()
        };
        const result = yield (db === null || db === void 0 ? void 0 : db.collection('urls').updateOne({ alias }, { $setOnInsert: Object.assign({}, url) }, { upsert: true }));
        console.log("result of url updateOne: ", result);
        if (result.upsertedCount == 1) {
            redisDb.connect().then(() => {
                redisDb.set(alias, `${longUrl};${url.createdBy};${url.topic}`).then(() => {
                    redisDb.disconnect().then(() => {
                        console.log("redis set!");
                    });
                });
            });
            res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${alias}`, createdAt: Date.now() });
            return;
        }
        res.status(409).json({ error: "The alias is already taken.please choose anothr one" });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/:alias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // GET /api/shorten/{alias}
    // Redirect to the original URL based on the short URL alias, enabling seamless access to the long URL
    res.redirect(307, `/${req.params.alias}`);
}));
export default router;
