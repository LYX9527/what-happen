import {proxyPicture} from "../utils";
import axios from "axios";
const KUAISHOU_API = process.env.KUAISHOU_API || "https://www.kuaishou.com/?isHome=1"
export const kuaishou = async () => {
    if (!KUAISHOU_API) {
        throw new Error("快手 API is not set")
    }
    // 获取快手首页HTML
    const html = (await axios.get(KUAISHOU_API, {
        headers: {
            "Cookie": "kpf=PC_WEB; clientid=3; did=web_cee7df9e29754bca0711df605a2477d1; kpn=KUAISHOU_VISION"
        }
    })).data
    // 提取window.__APOLLO_STATE__中的数据
    const matches = (html as string).match(/window\.__APOLLO_STATE__\s*=\s*(\{.+?\});/)
    if (!matches) {
        throw new Error("无法获取快手热榜数据")
    }

    // 解析JSON数据
    const data: shared.KuaishouRes = JSON.parse(matches[1])

    // 获取热榜数据ID
    const hotRankId = data.defaultClient.ROOT_QUERY["visionHotRank({\"page\":\"home\"})"].id

    // 获取热榜列表数据
    const hotRankData = data.defaultClient[hotRankId] as shared.KuaishouHotRankData
    // 转换数据格式
    return hotRankData.items.filter(k => data.defaultClient[k.id].tagType !== "置顶").map((item) => {
        // 从id中提取实际的热搜词
        const hotSearchWord = item.id.replace("VisionHotRankItem:", "")

        // 获取具体的热榜项数据
        const hotItem = data.defaultClient[item.id]
        return {
            id: hotSearchWord,
            title: hotItem.name,
            url: `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(hotItem.name)}`,
            extra: {
                icon: {
                    url: hotItem.iconUrl && proxyPicture(hotItem.iconUrl),
                }
            },
        }
    })
}
