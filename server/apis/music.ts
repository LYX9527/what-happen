import axios from "axios";
import * as cheerio from "cheerio";
import {zzcSign, decodeAG1Response, encodeAG1Request} from '@jixun/qmweb-sign';
import dayjs from "dayjs/esm";
import {NewsItem} from "tools";
import {QQMusicRes} from "~~/server/types/shared";
const KUGOU_API = process.env.KUGOU_API || "https://www.kugou.com/yy/rank/home";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
dayjs.extend(weekOfYear)
export const kugou = async () => {
    if (!KUGOU_API) {
        throw new Error("KuGou API is not set");
    }
    const response: any = (await axios.get(KUGOU_API)).data
    const $ = cheerio.load(response)
    const $main = $(".pc_temp_songlist > ul > li")
    const res = [] as NewsItem[]
    $main.each(e => {
        const $el = $($main[e])
        const $a = $el.find("a")
        let time = $el.find(".pc_temp_time");
        let s = time.text()
            .replaceAll("\t", "")
            .replaceAll("\n", "");
        const url = $a.attr("href")
        const title = $a.attr("title")
        let info = title?.split("-");
        if (info == undefined) {
            return
        }
        res.push({
            id: url!,
            url: url!,
            title: info[1].trim(),
            extra: {
                time: s,
                author: info[0].trim(),
            }
        })
    })
    // 更严格的类型安全版本
    const coverPromises = Object.entries(res).map(async ([key, value]) => {
        try {
            const info = (await axios.get(value.url)).data;
            const $ = cheerio.load(info);
            const $img = $(".albumImg img");
            const cover = $img.attr("src");

            if (cover) {
                // 确保 extra 对象存在
                if (!value.extra) {
                    value.extra = {};
                }
                value.extra.cover = cover;
            }

            return {key, success: true};
        } catch (error) {
            console.error(`Failed to fetch cover for ${key}:`, error);
            return {key, success: false};
        }
    });

    await Promise.all(coverPromises);
    return res.map(item => {
        return {
            ...item,
            extra: {
                ...item.extra,
                cover: item.extra?.cover || "",
            }
        } as NewsItem;
    });

}

export const qqMusic = async () => {
    const size = '300x300', maxAge = 2592000
    let data: QQMusicRes = await proxyQQMusic();
    return data.req_1.data.data.song.map(item => {
        return {
            id: item.songId,
            title: item.title,
            url: ``,
            extra: {
                cover: item.cover ? item.cover : `https://y.gtimg.cn/music/photo_new/T002R${size}M000${item.albumMid}.jpg?max_age=${maxAge}`,
                author: item.singerName
            }
        }
    })
}

export const proxyQQMusic = async () => {
    // @ts-ignore
    const week = dayjs().week()
    const year = dayjs().year()
    const period = `${year}_${week}`;
    console.log(period);
    const payload = JSON.stringify({
        "comm": {
            "g_tk": 1124214810,
            "loginUin": "0",
            "hostUin": 0,
            "inCharset": "utf-8",
            "outCharset": "utf-8",
            "notice": 0,
            "platform": "yqq.json",
            "needNewCode": 1,
            "cv": 4747474,
            "ct": 24,
            "format": "json",
            "uin": 0
        },
        "req_1": {
            "module": "musicToplist.ToplistInfoServer",
            "method": "GetDetail",
            "param": {"topId": 4, "offset": 0, "num": 20, "period": period}
        }
    });
    const body = await encodeAG1Request(payload);
    const sign = zzcSign(payload);

    const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?_=${Date.now()}&encoding=ag-1&sign=${sign}`;

    const res = await fetch(url, {
        body,
        method: 'POST',
        headers: {},
    });
    const buffer = await res.arrayBuffer();
    const respText = decodeAG1Response(buffer);
    return JSON.parse(respText);
}
