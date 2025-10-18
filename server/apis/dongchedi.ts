import axios from "axios";
import {load} from "cheerio"
import {DongCheDiRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const DONGCHEDI_API = process.env.DONGCHEDI_API || "https://www.dongchedi.com/news"
export const dongchediHot = async () => {
    if (!DONGCHEDI_API) {
        throw new Error("DongCheDi API is not set");
    }
    let response = await axios.get(DONGCHEDI_API);
    const $ = load(response?.data)
    let nextdata = $("#__NEXT_DATA__");
    let parse: DongCheDiRes = JSON.parse($(nextdata).text());
    return parse.props.pageProps.hotSearchList.map((item) => {
        return {
            id: item.gid,
            title: item.title,
            url: `https://www.dongchedi.com/search?keyword=${item.title}`,
            extra: {
                desc: item.description,
                num: item.score
            }
        } as NewsItem
    })
}
export const dongchediNews = async () => {
    if (!DONGCHEDI_API) {
        throw new Error("DongCheDi API is not set");
    }
    let response = await axios.get(DONGCHEDI_API);
    const $ = load(response?.data)
    let nextdata = $("#__NEXT_DATA__");
    let parse: DongCheDiRes = JSON.parse($(nextdata).text());
    return parse.props.pageProps.staticData.news.map((item) => {
        return {
            id: item.unique_id,
            title: item.title,
            url: item.has_video ? `https://www.dongchedi.com/video/${item.unique_id_str}` : `https://www.dongchedi.com/article/${item.unique_id_str}`,
            extra: {
                date: item.publish_time * 1000
            }
        } as NewsItem
    })
}
