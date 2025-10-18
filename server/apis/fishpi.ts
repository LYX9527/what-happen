import axios from "axios";
import * as cheerio from "cheerio"
import {NewsItem} from "tools";
const FISHP_API = process.env.FISHP_API || "https://fishpi.cn/hot";
const FISHP_API_COOKIE = process.env.FISHP_API_COOKIE || 'sym-ce=33694c2058c1fecd3c894e102123706ef3aafdd0ed66fa5d898e26b6c1208ba20d09d8897f1e4463ef5b25f14dce95f23610b40b59b49961a48f1ef3c15ca7926a2dd7d76f0d36fde5e30ad6e4fe577fcc0a5273e069a99471fd22c50e62baee5b3ae3942df985240c0a16350ce92a47; LATKE_SESSION_ID=xmO2e8GXBLhVaU8f; Hm_lvt_bab35868f6940b3c4bfc020eac6fe61f=1755476825; Hm_lpvt_bab35868f6940b3c4bfc020eac6fe61f=1755476825; HMACCOUNT=85357D032F8DB2EA; Hm_lvt_bab35868f6940b3c4bfc020eac6fe61f=1755476825; HMACCOUNT=85357D032F8DB2EA; Hm_lpvt_bab35868f6940b3c4bfc020eac6fe61f=1755476825';
export const fishpi = async () => {
    if (!FISHP_API) throw new Error("FISHP_API is not defined");

    const res: any = (await axios.get(FISHP_API, {
        headers: {
            "Cookie": FISHP_API_COOKIE || "",
        }
    })).data;
    let $ = cheerio.load(res);
    const result: NewsItem[] = [];
    $(".article-list > ul > li").each((index, item) => {
        const $item = $(item);
        const title = $item.find(".ft-a-title").text();
        const id = $item.find(".ft-a-title").attr("href")?.split("/").pop() || "";
        let elements = $item.find(".abstract");
        const description = elements.text();
        // a 标签带有class  ft-fade
        const like = $item.find("a.ft-fade > b").text()
        const view = $item.find("a.ft-fade > span").text();
        result.push({
            id,
            title,
            url: `https://fishpi.cn/article/${id}`,
            extra: {
                desc: description,
                like,
                view,
            }
        })
    })
    return result;
}
