import axios, {AxiosResponse} from "axios";
import {load} from "cheerio";
import {md5} from "../utils";
import {CoolapkRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const COOLAPK_API = process.env.COOLAPK_API || "https://api.coolapk.com/v6/page/dataList?url=%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1"
export const coolapk = async () => {
    if (!COOLAPK_API) {
        throw new Error("COOLAPK_API is not defined");
    }
    let headers = await genHeaders();
    const res: AxiosResponse<CoolapkRes> = await axios.get(COOLAPK_API, {
        headers: headers
    });
    if (res.status !== 200) {
        throw new Error(`Coolapk API request failed with status ${res.status}`);
    }
    const data = res.data;
    return data.data.filter(k => k.id).map((i) => {
        return {
            id: i.id,
            title: i.editor_title || load(i.message).text().split("\n")[0],
            url: `https://www.coolapk.com${i.url}`,
            extra: {
                info: i.targetRow?.subTitle,
                date: new Date(i.dateline * 1000).getTime(),
            },
        } as NewsItem;
    }).sort(
        (a, b) => {
            // @ts-ignore
            return b.extra?.date!! - a.extra?.date!!;
        }
    );

}

function getRandomDEVICE_ID() {
    const r = [10, 6, 6, 6, 14]
    const id = r.map(i => Math.random().toString(36).substring(2, i))
    return id.join("-")
}


function encodeBase64(s: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(s);
    return btoa(String.fromCharCode(...data));
}

async function get_app_token() {
    const DEVICE_ID = getRandomDEVICE_ID()
    const now = Math.round(Date.now() / 1000)
    const hex_now = `0x${now.toString(16)}`
    const md5_now = await md5(now.toString())
    const s = `token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?${md5_now}$${DEVICE_ID}&com.coolapk.market`
    const md5_s = await md5(encodeBase64(s))
    return md5_s + DEVICE_ID + hex_now
}

export async function genHeaders() {
    return {
        "X-Requested-With": "XMLHttpRequest",
        "X-App-Id": "com.coolapk.market",
        "X-App-Token": await get_app_token(),
        "X-Sdk-Int": "29",
        "X-Sdk-Locale": "zh-CN",
        "X-App-Version": "11.0",
        "X-Api-Version": "11",
        "X-App-Code": "2101202",
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/11.0-2101202",
    }
}
