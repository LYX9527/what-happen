import type { NewsItem } from '../types'
import {load} from "cheerio"
const _36KR_API = process.env._36KR_API || 'https://36kr.com/newsflashes'
const _36KR_BASE_API = process.env._36KR_BASE_API || 'https://36kr.com'

export const _36kr = async (): Promise<NewsItem[]> => {
    if (!_36KR_API) {
        throw new Error("36kr API is not set")
    }
    const response = await $fetch(_36KR_API)
    const $ = load(response as string)
    const news: NewsItem[] = []
    const $items = $(".newsflash-item")
    $items.each((_, el) => {
        const $el = $(el)
        const $a = $el.find("a.item-title")
        const url = $a.attr("href")
        const title = $a.text()
        const relativeDate = $el.find(".time").text()
        if (url && title && relativeDate) {
            news.push({
                url: `${_36KR_BASE_API}${url}`,
                title,
                id: url,
                extra: {
                    date: parseRelativeDate(relativeDate, "Asia/Shanghai").valueOf(),
                },
            })
        }
    })
    return news
}

