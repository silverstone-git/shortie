var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const LOCATION_GROUPING_PRECISION = 4;
import ngeohash from 'ngeohash';
const analyze = (analytics) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        totalClicks: analytics === null || analytics === void 0 ? void 0 : analytics.length,
        uniqueUsers: new Set(analytics === null || analytics === void 0 ? void 0 : analytics.map((a) => a.ip)).size,
        clicksByDate: analytics === null || analytics === void 0 ? void 0 : analytics.reduce((acc, curr) => {
            const date = curr.timestamp.toDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {}),
        clicksByOS: analytics === null || analytics === void 0 ? void 0 : analytics.reduce((acc, curr) => {
            const os = curr.os;
            acc[os] = (acc[os] || 0) + 1;
            return acc;
        }, {}),
        clicksByLocation: analytics === null || analytics === void 0 ? void 0 : analytics.reduce((acc, { location }) => {
            // Encode the coordinates into a geohash
            const hash = ngeohash.encode(location.lat, location.lng, LOCATION_GROUPING_PRECISION);
            acc[hash] = (acc[hash] || 0) + 1;
            return acc;
        }, {})
    };
});
export default { LOCATION_GROUPING_PRECISION, analyze };
