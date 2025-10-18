import axios from "axios";
import {JueJinRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const JUEJIN_API = process.env.JUEJIN_API || "https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot&aid=2608&uuid=7264776733247899147&spider=0"
export const juejin = async () => {
    if (!JUEJIN_API) {
        throw new Error("JueJin API is not set");
    }
    const res: JueJinRes = (await axios.get(JUEJIN_API, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
    })).data;
    return res.data.map((item: any) => {
        return {
            id: item.content.content_id,
            title: item.content.title,
            url: `https://juejin.cn/post/${item.content.content_id}`,
            extra: {
                view: item.content_counter.view,
                collect: item.content_counter.collect,
                like: item.content_counter.like,
            }
        } as NewsItem;
    });
}
