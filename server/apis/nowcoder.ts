import axios from "axios";
import {NowCoderRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const NOWCODER_API = process.env.NOWCODER_API || "https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc"
const NOWCODER_DEATIL_API = process.env.NOWCODER_DEATIL_API || "https://www.nowcoder.com/feed/main/detail/"
const NOWCODER_DISCUSS_API = process.env.NOWCODER_DISCUSS_API || "https://www.nowcoder.com/discuss"

export const nowcoder = async () => {
    const timestamp = Date.now()
    const url = `${NOWCODER_API}?size=20&_=${timestamp}&t=`
    const res: NowCoderRes = (await axios.get(url)).data
    return res.data.result
        .map((k) => {
            let url, id
            if (k.type === 74) {
                url = `${NOWCODER_DEATIL_API}/${k.uuid}`
                id = k.uuid
            } else if (k.type === 0) {
                url = `${NOWCODER_DISCUSS_API}/${k.id}`
                id = k.id
            }
            return {
                id,
                title: k.title,
                url,
            } as NewsItem
        })
}
