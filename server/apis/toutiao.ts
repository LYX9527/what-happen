import axios from "axios";
import {proxyPicture} from "../utils";
import {TouTiaoRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const TOUTIAO_API = process.env.TOUTIAO_API || "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";
const TOUTIAO_PREFIX = process.env.TOUTIAO_PREFIX || "https://www.toutiao.com/trending/";

export const toutiao = async () => {
    if (!TOUTIAO_API) throw new Error("TOUTIAO API is missing");
    const res: TouTiaoRes = (await axios.get(TOUTIAO_API)).data
    return res.data
        .map((k) => {
            return {
                id: k.ClusterIdStr,
                title: k.Title,
                url: `${TOUTIAO_PREFIX}${k.ClusterIdStr}/`,
                extra: {
                    icon: {
                        url: k.LabelUri?.url && proxyPicture(k.LabelUri.url)
                    },
                },
            }
        }) as NewsItem[];
}
