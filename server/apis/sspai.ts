import axios from "axios";
import {SSPAIRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const SSPAI_API = process.env.SSPAI_API || "https://sspai.com/api/v1/article/tag/page/get?limit=20&offset=0&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0&released=false";
export const sspai = async () => {
    if (!SSPAI_API) {
        throw new Error("SSPAI API is not set");
    }
    const response: SSPAIRes = (await axios.get(SSPAI_API)).data;
    return response.data.map(item => {
        return {
            id: item.id,
            title: item.title,
            url: `https://sspai.com/post/${item.id}`,
            extra: {
                icon: {
                    url: `https://cdnfile.sspai.com${item.banner}`,
                    scale: 0.8,
                },
                author: item.author.nickname,
                desc: item.summary,
                view: item.view_count,
                collect: item.comment_count,
                like: item.like_count,
            }
        } as NewsItem;
    });
}
