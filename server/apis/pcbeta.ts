import {rss2json} from "../utils";
import dayjs from "dayjs/esm";
import utc from "dayjs/esm/plugin/utc";
import timezone from "dayjs/esm/plugin/timezone";
import {NewsItem} from "tools";

const PCBETA_WIN_11_RSS = process.env.PCBETA_WIN_11_RSS || "https://bbs.pcbeta.com/forum.php?mod=rss&fid=521&auth=0";
const PCBETA_WIN_RSS = process.env.PCBETA_WIN_RSS || "https://bbs.pcbeta.com/forum.php?mod=rss&fid=563&auth=0";
dayjs.extend(utc);
dayjs.extend(timezone);

export const pcbetaWin = async () => {
    if (!PCBETA_WIN_RSS) throw new Error("PCBETA_WIN_RSS is not defined")
    const rssJson = await rss2json(PCBETA_WIN_RSS)
    if (!rssJson?.items.length) throw new Error("Cannot fetch rss data")
    return rssJson.items.map(item => ({
        title: item.title,
        url: item.link,
        id: item.link,
        pubDate: dayjs(item.created).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss"),
        extra: {
            date: dayjs.tz(item.created, "Asia/Shanghai").valueOf()
        },
    } as NewsItem))
}

export const pcbetaWin11 = async () => {
    if (!PCBETA_WIN_11_RSS) throw new Error("PCBETA_WIN_11_RSS is not defined")
    const rssJson = await rss2json(PCBETA_WIN_11_RSS)
    if (!rssJson?.items.length) throw new Error("Cannot fetch rss data")
    return rssJson.items.map(item => ({
        title: item.title,
        url: item.link,
        id: item.link,
        pubDate: dayjs(item.created).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss"),
        extra: {
            date: dayjs.tz(item.created, "Asia/Shanghai").valueOf()
        },
    } as NewsItem))
}
