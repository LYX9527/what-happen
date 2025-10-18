import {genRandomUserAgent, proxyPicture} from "../utils";
import axios from "axios";
import {WeiBoRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const WEIBO_API = process.env.WEIBO_API || "https://weibo.com/ajax/side/hotSearch"

export const weibo = async () => {
    if (!WEIBO_API) throw new Error("Weibo API is missing");
    const res: WeiBoRes = (await axios.get(WEIBO_API, {
        headers: {
            "User-Agent": genRandomUserAgent(),
            "referer": "https://weibo.com/newlogin?tabtype=search&gid=&openLoginLayer=0&url=https%3A%2F%2Fweibo.com%2Fhot%2Fsearch"
        }
    })).data
    return res.data.realtime
        .filter(k => !k.is_ad)
        .map((k) => {
            const keyword = k.word_scheme ? k.word_scheme : `#${k.word}#`
            return {
                id: k.word,
                title: k.word,
                extra: {
                    icon: k.icon && {
                        url: proxyPicture(k.icon),
                        scale: 1.5,
                    },
                    rank: k.rank,
                    info: k.word_scheme ? k.word_scheme : "",
                    num: k.num,
                },
                url: `https://s.weibo.com/weibo?q=${encodeURIComponent(keyword)}`,
                mobileUrl: `https://m.weibo.cn/search?containerid=231522type%3D1%26q%3D${encodeURIComponent(keyword)}&_T_WM=16922097837&v_p=42`,
            } as NewsItem
        })
}
