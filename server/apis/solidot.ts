import * as cheerio from "cheerio"
import {parseRelativeDate} from "../utils";
import axios from "axios";
import dayjs from "dayjs/esm";
import {NewsItem} from "tools";
const SOLIDOW_API  = process.env.SOLIDOW_API || "https://www.solidot.org"
export const solidot = async () => {
    if (!SOLIDOW_API) throw new Error("Missing SOLIDOW_API");
    const html: any = (await axios.get(SOLIDOW_API)).data
    const $ = cheerio.load(html)
    const $main = $(".block_m")
    const news: NewsItem[] = []
    $main.each((_, el) => {
        const a = $(el).find(".bg_htit a").last()
        const url = a.attr("href")
        const title = a.text()
        const date_raw = $(el).find(".talk_time").text().match(/发表于(.*?分)/)?.[1]
        const date = date_raw?.replace(/[年月]/g, "-").replace("时", ":").replace(/[分日]/g, "")
        if (url && title && date) {
            news.push({
                url: SOLIDOW_API + url,
                title,
                id: url,
                pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf(),
                extra: {
                    date: dayjs.tz(date, "Asia/Shanghai").valueOf()
                },
            })
        }
    })
    return news
}
