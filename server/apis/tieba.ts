import axios from "axios";
import {TieBaRes} from "~~/server/types/shared";
import {NewsItem} from "tools";

const TIEBA_API = process.env.TIEBA_API || "https://tieba.baidu.com/hottopic/browse/topicList"

export const tieba = async () => {
    if (!TIEBA_API) throw new Error("TIEBA_API is not defined");
    const res: TieBaRes = (await axios.get(TIEBA_API)).data
    return res.data.bang_topic.topic_list
        .map((k) => {
            return {
                id: k.topic_id,
                title: k.topic_name,
                url: k.topic_url,
                extra: {
                    date: k.create_time * 1000
                }
            } as NewsItem
        }).sort(
            // @ts-ignore
            (a, b) => b.extra.date - a.extra.date
        )
}
