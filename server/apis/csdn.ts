import axios from "axios";
import {CSDNRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const CSDN_API = process.env.CSDN_API || "https://cms-api.csdn.net/v1/web_home/select_content?componentIds=www-info-list-new&channel=0"
export const csdn = async () => {
    if (!CSDN_API) {
        throw new Error("CSDN API is not set");
    }
    const response: CSDNRes = (await axios.get(CSDN_API)).data;
    return response.data["www-info-list-new"].info.list.map(item => {
        return {
            id: item.id,
            title: item.title,
            url: item.url,
            extra: {
                icon: {
                    url: item.avatar && item.avatar.replace(/http:/, "https:"),
                    scale: 0.8,
                },
                desc: item.summary,
                view: item.viewCount,
                collect: item.commentCount,
                like: item.diggCount,
            }
        } as NewsItem
    })
}
