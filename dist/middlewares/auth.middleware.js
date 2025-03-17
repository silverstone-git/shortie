var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config';
import { getSession } from "@auth/express";
import authUtils from "../utils/authUtils.js";
const authSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.locals.session = yield getSession(req, authUtils.authOptions);
    next();
});
const authenticatedUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //console.log("session checking..");
    //console.log(req.headers);
    //console.log(req.body);
    const session = (_a = res.locals.session) !== null && _a !== void 0 ? _a : (yield getSession(req, authUtils.authOptions));
    //console.log("session got..");
    //console.log(session);
    if (!(session === null || session === void 0 ? void 0 : session.user)) {
        console.log("User not logged in");
        res.redirect("/api/auth/signin");
    }
    else {
        console.log("going ahead");
        next();
    }
});
export default { authSession, authenticatedUser };
