import {Buffer} from "node:buffer"
import * as cheerio from "cheerio"
import iconv from "iconv-lite"
import {parseRelativeDate} from "../utils";
import axios from "axios";
import dayjs from "dayjs/esm";
import {NewsItem} from "tools";

const ZAOBAO_API = process.env.ZAOBAO_API || "https://www.zaochenbao.com"

export const zaobao = async () => {
    const response: ArrayBuffer = (await axios.get(`${ZAOBAO_API}/realtime/`, {
        responseType: "arraybuffer",
    })).data
    const utf8String = iconv.decode(Buffer.from(response), "gb2312")
    const $ = cheerio.load(utf8String)
    const $main = $("div.list-block>a.item")
    const news: NewsItem[] = []
    $main.each((_, el) => {
        const a = $(el)
        const url = a.attr("href")
        const title = a.find(".eps")?.text()
        const date = a.find(".pdt10")?.text().replace(/-\s/g, " ")
        if (url && title && date) {
            news.push({
                url: ZAOBAO_API + url,
                title,
                id: url,
                pubDate: parseRelativeDate(date, "Asia/Shanghai").valueOf(),
                extra: {
                    date: dayjs.tz(date, "Asia/Shanghai").valueOf()
                }
            })
        }
    })
    return news.sort((m, n) => n.pubDate! > m.pubDate! ? 1 : -1)
}
