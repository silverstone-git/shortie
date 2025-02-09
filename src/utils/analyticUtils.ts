const LOCATION_GROUPING_PRECISION = 4;
import ngeohash from 'ngeohash';

const analyze = async (analytics: IAnalytic[]) => {

  return {
      totalClicks: analytics?.length,
      uniqueUsers: new Set(analytics?.map((a: any) => a.ip)).size,
      clicksByDate: analytics?.reduce((acc: any, curr: any) => {
        const date = curr.timestamp.toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
      clicksByOS: analytics?.reduce((acc: any, curr: any) => {
        const os = curr.os;
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {}),
      clicksByLocation: analytics?.reduce((acc: any, { location }) => {
        // Encode the coordinates into a geohash
        const hash = ngeohash.encode(location.lat, location.lng, LOCATION_GROUPING_PRECISION);
        acc[hash] = (acc[hash] || 0) + 1;
        return acc;
      }, {})
  }
}

export default {LOCATION_GROUPING_PRECISION, analyze};
