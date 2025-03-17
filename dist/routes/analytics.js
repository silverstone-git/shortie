var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import serverSetup from '../utils/serverSetup.js';
import mongoClient from '../utils/mongodb.js';
import analyticUtils from '../utils/analyticUtils.js';
// lower precision -> bigger area -> more handwavy grouping
const router = express.Router();
router.use(authMiddleware.authenticatedUser);
router.get('/:alias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield serverSetup.getDb(mongoClient);
    try {
        const alias = req.params.alias;
        if (!alias) {
            res.status(400).json({ error: 'Empty alias, please provide a link alias that you saved in path' });
            return;
        }
        if (alias == "overall") {
            yield overallHandler(req, res, db);
            return;
        }
        const analytics = yield (db === null || db === void 0 ? void 0 : db.collection('analytics').find({ alias, urlBy: res.locals.session.user.email.trim() }).toArray());
        if (!analytics || analytics.length == 0) {
            //res.status(404).json({ error: 'URL not found' });
            res.status(404).json({ 'error': 'Please give an alias that you made using this API' });
            return;
        }
        console.log("analyzing your alias...");
        const analysis = yield analyticUtils.analyze(analytics);
        res.status(200).json(analysis);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
const overallHandler = (req, res, db) => __awaiter(void 0, void 0, void 0, function* () {
    // give analytics of the user
    console.log("overallllll");
    try {
        let analytics = yield (db === null || db === void 0 ? void 0 : db.collection('analytics').find({ urlBy: res.locals.session.user.email }).toArray());
        if (!analytics || analytics.length == 0) {
            res.status(404).json({ error: 'Analytics not found' });
            return;
        }
        const analysis = yield analyticUtils.analyze(analytics);
        res.status(200).json(Object.assign({ totalUrls: new Set(analytics === null || analytics === void 0 ? void 0 : analytics.map((a) => a.alias)).size }, analysis));
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/topic/:topic', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get all urls with the given topic, and for the ones having createBy == res.locals.sesion.user.email, show analytics
    //
    const db = yield serverSetup.getDb(mongoClient);
    try {
        const topic = req.params.topic.trim();
        if (!topic) {
            res.status(400).json({ error: 'Empty topic, please provide a link topic that you saved in path' });
            return;
        }
        console.log("topic is: ", topic);
        let analytics = yield (db === null || db === void 0 ? void 0 : db.collection('analytics').find({ urlBy: res.locals.session.user.email, topic: topic }).toArray());
        if (!analytics || analytics.length == 0) {
            res.status(404).json({ error: 'Analytics not found' });
            return;
        }
        const analysis = yield analyticUtils.analyze(analytics);
        res.status(200).json(analysis);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
export default router;
