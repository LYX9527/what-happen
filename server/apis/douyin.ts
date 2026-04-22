import axios from "axios";
import {DouyinRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const DOUYIN_API = process.env.DOUYIN_API || "https://www.douyin.com/aweme/v1/web/hot/search/list/?channel=channel_pc_web&detail_list=1&source=6&support_h265=1&support_dash=1&webcast_sdk_version=170400&webcast_version_code=170400&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=2560&screen_height=1440&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=147.0.0.0&browser_online=true&engine_name=Blink&engine_version=147.0.0.0"
export const douyin = async () => {

    const res: DouyinRes = (await axios.get(DOUYIN_API, {
        headers: {
            'User-Agent': genRandomUserAgent(),
            "referer": "https://www.douyin.com/hot"
        }
    })).data;

    return res.data.word_list.map((k) => {
        return {
            id: k.sentence_id,
            title: k.word,
            url: `https://www.douyin.com/hot/${k.sentence_id}`,
            extra: {
                rank: k.position,
                num: k.hot_value,
            }
        } as NewsItem
    })
}
