import * as cheerio from "cheerio"
import axios from "axios";
import dayjs from "dayjs/esm";
import {NewsItem} from "tools";

const IT_HOME_API = process.env.IT_HOME_API || "https://www.ithome.com/list/"
export const ithome = async () => {
    if (!IT_HOME_API) {
        throw new Error("IT Home API is not set")
    }
    const response: any = (await axios.get(IT_HOME_API)).data
    const $ = cheerio.load(response)
    const $main = $("#list > div.fl > ul > li")
    const news: NewsItem[] = []
    const timeZone = 'Asia/Shanghai';
    $main.each((_, el) => {
        const $el = $(el)
        const $a = $el.find("a.t")
        const url = $a.attr("href")
        const title = $a.text()
        const date = $(el).find("i").text()
        if (url && title && date) {
            const isAd = url?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].find(k => title.includes(k))
            if (!isAd) {
                news.push({
                    url,
                    title,
                    id: url,
                    extra: {
                        date: dayjs.tz(date, timeZone).valueOf(),
                    }
                })
            }
        }
    })
    return news.sort((m, n) => {
        // @ts-ignore
        return n.extra.date! > m.extra.date! ? 1 : -1
    })
}
