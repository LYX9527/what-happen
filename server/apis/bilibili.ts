import type {NewsItem} from '../types'

import axios from "axios";

const BLBL_HOT_SEARCH_API = process.env.BLBL_HOT_SEARCH_API || 'https://s.search.bilibili.com/main/hotword?limit=30'
const BLBL_HOT_VIDEO_API = process.env.BLBL_HOT_VIDEO_API || 'https://api.bilibili.com/x/web-interface/popular'
const BLBL_RANK_API = process.env.BLBL_RANK_API || 'https://api.bilibili.com/x/web-interface/ranking/v2'
const BLBL_SEARCH_PREFIX = 'https://search.bilibili.com/all?keyword='
const BLBL_VIDEO_PREFIX = 'https://www.bilibili.com/video/'
import {genRandomUserAgent, proxyPicture, getCache, setCache} from "../utils";
import {BHotVideoRes, BWapRes} from "~~/server/types/shared";

const getResponseByUrl = async <T>(callBack: (res: T) => NewsItem[], url?: string, cacheKey?: string) => {
    if (!url) {
        throw new Error("URL is not set")
    }

    // 尝试从缓存获取数据
    if (cacheKey) {
        const cachedData = getCache<NewsItem[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
    }

    const response = await axios.get(url, {
        headers: {
            "User-Agent": genRandomUserAgent()
        }
    });

    const result = callBack(response.data);

    // 设置缓存
    if (cacheKey) {
        setCache(cacheKey, result);
    }

    return result;
}

export const bHotSearch = async () => {
    return await getResponseByUrl<BWapRes>(
        (res) => {
            return res.list.map(k => ({
                id: k.keyword,
                title: k.show_name,
                url: `${BLBL_SEARCH_PREFIX}${encodeURIComponent(k.keyword)}`,
                extra: {
                    icon: {
                        url: k.icon && proxyPicture(k.icon),
                        scale: 0.8,
                    },
                },
            } as NewsItem))
        },
        BLBL_HOT_SEARCH_API,
        'bilibili_hot_search'
    );
}

export const bHotVideo = async () => {
    return await getResponseByUrl<BHotVideoRes>(
        (res) => {
            return res.data.list.map(video => ({
                id: video.bvid,
                title: video.title,
                url: `${BLBL_VIDEO_PREFIX}${video.bvid}`,
                pubDate: video.pubdate * 1000,
                extra: {
                    video: {
                        info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
                        duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : undefined,
                    },
                    thumbnail: {
                        hover: video.desc,
                        url: proxyPicture(video.pic),
                    }
                },
            } as NewsItem))
        },
        BLBL_HOT_VIDEO_API,
        'bilibili_hot_video'
    );
}

export const bRanking = async () => {
    return await getResponseByUrl<BHotVideoRes>(
        (res) => {
            return res.data.list.map(video => ({
                id: video.bvid,
                title: video.title,
                url: `${BLBL_VIDEO_PREFIX}${video.bvid}`,
                pubDate: video.pubdate * 1000,
                extra: {
                    video: {
                        info: `${video.owner.name} · ${formatNumber(video.stat.view)}观看 · ${formatNumber(video.stat.like)}点赞`,
                        duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : undefined,
                    },
                    thumbnail: {
                        hover: video.desc,
                        url: proxyPicture(video.pic),
                    }
                },
            } as NewsItem))
        },
        BLBL_RANK_API,
        'bilibili_ranking'
    );
}

function formatNumber(num: number): string {
    if (num >= 10000) {
        return `${Math.floor(num / 10000)}w+`
    }
    return num.toString()
}

