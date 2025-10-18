import * as cheerio from "cheerio"
import axios from "axios";
import {parseRelativeDate} from "../utils";
import {NewsItem} from "tools";

const GELONGHUI_API = process.env.GELONGHUI_API || "https://www.gelonghui.com/news/";
const GELONGHUI_BASE_API = process.env.GELONGHUI_BASE_API || "https://www.gelonghui.com";

export const gelonghui = async () => {
    if (!GELONGHUI_BASE_API || !GELONGHUI_API) {
        throw new Error("Gelonghui API is not set")
    }
    const html: any = (await axios.get(GELONGHUI_API)).data
    const $ = cheerio.load(html)
    const $main = $(".article-content")
    const news: NewsItem[] = []
    $main.each((_, el) => {
        const a = $(el).find(".detail-right>a")
        const url = a.attr("href")
        const title = a.find("h2").text()
        const info = $(el).find(".time > span:nth-child(1)").text()
        const relatieveTime = $(el).find(".time > span:nth-child(3)").text()
        if (url && title && relatieveTime) {
            news.push({
                url: GELONGHUI_BASE_API + url,
                title,
                id: url,
                extra: {
                    date: parseRelativeDate(relatieveTime, "Asia/Shanghai").valueOf(),
                    info,
                },
            })
        }
    })
    return news
}
