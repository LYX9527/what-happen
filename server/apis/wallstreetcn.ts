import axios from "axios";
import {WallStreetCnHotRes, WallStreetCnLiveRes, WallStreetCnNewsRes} from "~~/server/types/shared";
const WALLSTREETCN_HOT_API = process.env.WALLSTREETCN_HOT_API || "https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all";
const WALLSTREETCN_LIVE_API = process.env.WALLSTREETCN_LIVE_API || "https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30";
const WALLSTREETCN_NEWS_API = process.env.WALLSTREETCN_NEWS_API || "https://api-one.wallstcn.com/apiv1/content/information-flow?channel=global-channel&accept=article&limit=30";
export const wallStreetCnLive = async () => {
    if (!WALLSTREETCN_LIVE_API) throw new Error("WALLSTREETCN_LIVE_API is missing");
    const res: WallStreetCnLiveRes = (await axios.get(WALLSTREETCN_LIVE_API)).data
    return res.data.items
        .map((k) => {
            return {
                id: k.id,
                title: k.title || k.content_text,
                extra: {
                    date: k.display_time * 1000,
                },
                url: k.uri,
            }
        })
}

export const wallStreetCnNews = async () => {
    if (!WALLSTREETCN_NEWS_API) throw new Error("WALLSTREETCN_NEWS_API is missing");
    const res: WallStreetCnNewsRes = (await axios.get(WALLSTREETCN_NEWS_API)).data
    return res.data.items
        .filter(k => k.resource_type !== "ad" && k.resource.type !== "live" && k.resource.uri)
        .map(({resource: h}) => {
            return {
                id: h.id,
                title: h.title || h.content_short,
                extra: {
                    date: h.display_time * 1000,
                },
                url: h.uri,
            }
        })
}

export const wallStreetCnHot = async () => {
    if (!WALLSTREETCN_HOT_API) throw new Error("WALLSTREETCN_HOT_API is missing");
    const res: WallStreetCnHotRes = (await axios.get(WALLSTREETCN_HOT_API)).data
    return res.data.day_items
        .map((h) => {
            return {
                id: h.id,
                title: h.title!,
                url: h.uri,
            }
        })
}
