import axios from "axios";
import type { NewsItem } from '../types'
const _51CTO_API = process.env._51CTO_API || "https://www.51cto.com/"
import {load} from "cheerio"

export const _51cto = async () => {
    if (!_51CTO_API) {
        throw new Error("51CTO API is not set");
    }
    const response = await axios.get(_51CTO_API, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "referer": "https://www.google.com/"
        }
    })
    const $ = load(response?.data)
    let details = $(".list_details").children();
    const result: NewsItem[] = [];
    details.each((index, item) => {
        const $item = $(item);
        const $a = $item.find("a");
        const url = $a.attr("href");
        const title = $a.text().trim();
        if (url && title) {
            result.push({
                url: url,
                title,
                id: url,
            });
        }
    })
    return result;
};

