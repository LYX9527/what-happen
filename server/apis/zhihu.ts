import {proxyPicture} from "../utils";
import axios from "axios";
import {ZhiHuRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const ZHIHU_API = process.env.ZHIHU_API || "https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true";
export const zhihu = async () => {
    if (!ZHIHU_API) throw new Error("ZHIHU_API is missing");
    const res: ZhiHuRes = (await axios.get(ZHIHU_API)).data;
    return res.data
        .map((k) => {
            return {
                id: k.id,
                title: k.target.title_area.text,
                extra: {
                    icon: {
                        url: k.card_label?.night_icon && proxyPicture(k.card_label.night_icon),
                    }
                },
                url: k.target.link.url,
            }
        }) as NewsItem[];
}
