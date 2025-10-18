import axios, {AxiosResponse} from "axios";
import dayjs from "dayjs/esm";
import {KaoPuRes} from "~~/server/types/shared";

const KAOPU_API = process.env.KAOPU_API || "https://kaopustorage.blob.core.windows.net/jsondata/"
export const kaopu = async () => {
    const res = await Promise.all([`${KAOPU_API}news_list_beta_hans_0.json`,
        `${KAOPU_API}news_list_beta_hans_1.json`].map(url => axios.get(url) as Promise<AxiosResponse<Array<KaoPuRes>>>))
    return res.map(item => item.data).flat().filter(k => ["财新", "公视"].every(h => k.publisher !== h)).map((k) => {
        return {
            id: k.link,
            title: k.title,
            extra: {
                hover: k.description,
                info: k.publisher,
                date: dayjs.tz(k.pubDate, "Asia/Shanghai").valueOf()
            },
            url: k.link,
        }
    })
}
