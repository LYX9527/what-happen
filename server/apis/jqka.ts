import axios from "axios";
import {JQKA_API} from "../constant";
const JQKA_API = process.env.JQKA_API || "https://news.10jqka.com.cn/tapp/news/push/stock/?page=1&tag=&track=website&pagesize=50"
export const jqka = async () => {
    const res: shared.JQKARes = (await axios.get(JQKA_API)).data;
    return res.data.list.map((item) => {
        return {
            id: item.id,
            title: item.title,
            url: item.url,
            extra: {
                date: item.rtime * 1000,
                desc: item.digest
            }
        } as tools.NewsItem;
    })
}

