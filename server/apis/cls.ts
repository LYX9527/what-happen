import axios from "axios";
import dayjs from "dayjs/esm";
import utcPlugin from "dayjs/esm/plugin/utc";
import timezonePlugin from "dayjs/esm/plugin/timezone";

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
import jsSHA from "jssha";
import * as cheerio from "cheerio";
import {Md5} from "ts-md5";
import {Params, Telegram} from "~~/server/types/shared";
import {NewsItem} from "tools";

const CLS_API = process.env.CLS_API || "https://www.cls.cn";

/**
 * 获取请求参数的加密字段
 * @param {Object} params 请求参数
 * @returns {String} 加密字段sign
 */

const sign = (params: any) => {
    let str = "";
    const sha1 = new jsSHA("SHA-1", "TEXT");
    for (const key in params) {
        str += `${key}=${params[key]}&`;
    }
    sha1.update(str);
    const sign = Md5.hashStr(sha1.getHash("HEX"));
    return sign;
};

/**
 * 最新电报列表
 * @returns {Promise<TelegramRes>} 新闻列表
 */
const refreshTelegraphList = async () => {
    const params: {
        app: string;
        lastTime: number;
        os: string;
        sv: string;
        sign?: string;
    } = {
        app: "CailianpressWeb",
        os: "web",
        sv: "8.4.6",
        lastTime: dayjs().unix(), // 前5分钟的时间戳
    };
    try {
        params.sign = sign(params);
        const url = `${CLS_API}/nodeapi/refreshTelegraphList`;
        const {
            a: lastTime,
            i: firstTime,
            l: list,
        } = (await axios.get(url, {params})).data;
        return {};
    } catch (error) {
        console.log(error);
        return [];
    }
};

/**
 * 电报列表（当日最新20条）
 * @returns {Promise<Array<tools.NewsItem>>} 新闻列表
 */
export const telegraph = async (): Promise<Array<NewsItem>> => {
    try {
        const url = `${CLS_API}/telegraph`;

        const html = (await axios.get(url)).data;
        const $ = cheerio.load(html);
        const respStr = $("#__NEXT_DATA__").text();
        const resp = JSON.parse(respStr);
        const telegraphList: Telegram[] =
            resp?.props?.initialState?.telegraph?.telegraphList || [];
        const list: Array<NewsItem> = telegraphList.map(
            ({
                 brief,
                 content,
                 ctime,
                 share_img,
                 shareurl,
                 subjects,
                 title,
                 level,
                 id,
             }) => {
                const item: NewsItem = {
                    id,
                    title: (title || brief),
                    url: shareurl,
                    pubDate: ctime * 1000,
                    extra: {
                        brief,
                        content,
                        ctime,
                        share_img,
                        date: ctime * 1000,
                        subjects: subjects || [],
                        level: level as unknown as string,
                    },
                };
                return item;
            }
        );

        return list;
    } catch (error) {
        console.log(error);
        return [];
    }
};

/**
 * 电报历史列表（按日期查询）
 * !不包含level
 * @returns {Promise<TelegramRes>} 新闻列表
 */
const telegraphHis = async () => {
    try {
        const params: Params = {
            app: "CailianpressWeb",
            os: "web",
            sv: "8.4.6",
            lastTime: dayjs().unix(), // 前5分钟的时间戳
        };
        params.sign = sign(params);
        const body = {
            app: "CailianpressWeb",
            date: dayjs().format("YYYY-MM-DD"),
            keyword: "",
            os: "web",
            page: 0,
            rn: 30,
            sv: "8.4.6",
            type: "telegram",
        };
        const url = `${CLS_API}/api/sw`;

        const {data: respData} = (
            await axios({
                method: "post",
                url: url,
                params: params,
                data: body,
            })
        ).data;
        const telegramList: Telegram[] = respData?.telegram?.data || [];
        // TODO 暂时没用
        return telegramList;
    } catch (error) {
        console.log(error);
    }
};

// telegraph();
