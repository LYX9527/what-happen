import {DouBanRes} from "~~/server/types/shared";

const DOUBAN_API = process.env.DOUBAN_API || 'https://m.douban.com/rexxar/api/v2/subject_collection/movie_real_time_hotest/items?os=mac+os+x&for_mobile=1&start=0&loc_id=0&_=0'

import axios from "axios";
import {proxyPicture} from "../utils";
import {NewsItem} from "tools";

export const douban = async () => {
    if (!DOUBAN_API) {
        throw new Error("DouBan API is not set");
    }
    const res: DouBanRes = await axios.get(DOUBAN_API, {
        headers: {
            "Referer": "https://m.douban.com/movie/"
        }
    });
    return res.data.subject_collection_items.map((item) => {
        return {
            id: item.id,
            title: item.title,
            url: item.url,
            extra: {
                rank: item.rank_value,
                icon: {
                    info: item.card_subtitle,
                    url: proxyPicture(item.pic.normal),
                },
                rating: {
                    count: item.rating.count,
                    value: item.rating.value,
                },
                comments: {
                    content: item.comments ? item.comments[0].comment : "",
                    avatar: item.comments ? item.comments[0].user.avatar : "",
                }
            }
        } as NewsItem;
    });
}
