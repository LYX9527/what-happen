import axios from "axios";
import {ThepaperRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const THEPAPER_API = process.env.THEPAPER_API || 'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar'
const THEPAPER_DETAIL_API = process.env.THEPAPER_DETAIL_API || 'https://www.thepaper.cn/newsDetail_forward_'
const THEPAPER_MOBILE_DETAIL_API = process.env.THEPAPER_MOBILE_DETAIL_API || 'https://m.thepaper.cn/newsDetail_forward_'

export const thepaper = async () => {
    if (!THEPAPER_API) throw new Error("THEPAPER_API is not defined");
    const res: ThepaperRes = (await axios.get(THEPAPER_API)).data
    return res.data.hotNews
        .map((k) => {
            return {
                id: k.contId,
                title: k.name,
                url: `${THEPAPER_DETAIL_API}${k.contId}`,
                mobileUrl: `${THEPAPER_MOBILE_DETAIL_API}${k.contId}`,
                extra: {
                    date: k.pubTimeLong
                }
            } as NewsItem
        }).sort(
            // @ts-ignore
            (a, b) => b.extra.date - a.extra.date
        );
}
