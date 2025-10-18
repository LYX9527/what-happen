import axios, {AxiosResponse} from "axios";
import {tranformToUTC} from "../utils";
import * as tools from "tools";
import {ReferenceMessageRes} from "~~/server/types/shared";

const CANKAOXIAOXI_API = process.env.CANKAOXIAOXI_API || "https://china.cankaoxiaoxi.com/json/channel/"
export const cankaoxiaoxi = async () => {
    const res = await Promise.all(["zhongguo", "guandian", "gj"].map(k => ((axios.get(`${CANKAOXIAOXI_API}${k}/list.json`))) as Promise<AxiosResponse<ReferenceMessageRes>>))
    return res.map(k => k.data.list).flat().map(k => ({
        id: k.data.id,
        title: k.data.title,
        extra: {
            date: tranformToUTC(k.data.publishTime),
        },
        url: k.data.url,
    } as tools.NewsItem)).sort((m, n) => m.extra?.date!! < n.extra?.date!! ? 1 : -1)
}
