import axios from 'axios';
import {load} from 'cheerio';
import type { NewsItem } from '../types'
import iconv from 'iconv-lite';
import {parseRelativeDate} from "../utils";
import {AutoHomeRankRes} from "~~/server/types/shared";

const AUTOHOME_API = process.env.AUTOHOME_API || "https://www.autohome.com.cn/all/";
const AUTOHOME_RANK_API = process.env.AUTOHOME_RANK_API || "https://content.api.autohome.com.cn/pc/rank/list";
export const autohome = async () => {
    if (!AUTOHOME_API) {
        throw new Error("AutoHome API is not set");
    }
    // 2. 修改 axios 请求配置
    let response = await axios.get(AUTOHOME_API, {
        responseType: 'arraybuffer'
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = load(data);

    let $article = $("#auto-channel-lazyload-article .article");
    let elements = $article.first();
    const res = [] as NewsItem[];
    $(elements).find("li[data-artidanchor]").each((index, item) => {
        let title = $(item).find("h3").text().trim();
        // 现在的 title 就不会是乱码了
        let url = "https:" + $(item).find("a").attr("href");
        let description = $(item).find("p").text().trim();
        let dataStr = $(item).find(".fn-left").text() || "";
        let em = $(item).find(".fn-right em");
        let img = $(item).find("img").attr("src") || "";
        // 第一个是浏览量，第二个是评论数
        let view = $(em[0]).text().trim() || "0";
        let time = parseRelativeDate(dataStr) as Date | null;
        res.push({
            id: url.split("/").pop()!,
            title: title,
            url: url,
            extra: {
                dateStr: dataStr,
                date: time ? time.getTime() : Date.now(),
                description: description,
                view,
                cover: img
            }
        })
    })
    return res;
}

export const autohomeRankArticle = async () => {
    return await baseFunction(3);
}
export const autohomeRankVideo = async () => {
    return await baseFunction(2);
}
export const autohomeRankHot = async () => {
    return await baseFunction(1);
}

const baseFunction = async (rankType: number) => {
    let response = await axios.get(AUTOHOME_RANK_API + `?size=50&ranktype=${rankType}`);
    const data: AutoHomeRankRes = response.data;
    return data.result.map((item) => {
        return {
            id: item.bizId,
            title: item.title,
            url: item.url,
            extra: {
                num: item.subtitle
            }
        } as NewsItem
    })
}
