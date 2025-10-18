import dayjs from "dayjs/esm"
import utcPlugin from "dayjs/esm/plugin/utc"
import timezonePlugin from "dayjs/esm/plugin/timezone"
import customParseFormat from "dayjs/esm/plugin/customParseFormat"
import duration from "dayjs/esm/plugin/duration"
import isSameOrBefore from "dayjs/esm/plugin/isSameOrBefore"
import weekday from "dayjs/esm/plugin/weekday"
import {XMLParser} from "fast-xml-parser";
import axios from "axios";
import {createHash} from "crypto";
import _md5 from "md5";
import {subtle} from "crypto";
import type {RSSInfo} from "~~/server/types";

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekday)

// 缓存存储
const cacheStore = new Map<string, CacheItem<any>>();
/**
 * 传入任意时区的时间（不携带时区），转换为 UTC 时间
 */
export const tranformToUTC = (date: string, format?: string, timezone: string = "Asia/Shanghai"): number => {
    if (!format) return dayjs.tz(date, timezone).valueOf()
    return dayjs.tz(date, format, timezone).valueOf()
}

// cloudflare 里 dayjs() 结果为 0，不能放在 top
const words = () => {
    return [
        {
            startAt: dayjs(),
            regExp: /^(?:今[天日]|to?day?)(.*)/,
        },
        {
            startAt: dayjs().subtract(1, "days"),
            regExp: /^(?:昨[天日]|y(?:ester)?day?)(.*)/,
        },
        {
            startAt: dayjs
            ().subtract(2, "days"),
            regExp:
                /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)(.*)/,
        },
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, "week") : dayjs().weekday(1),
            regExp:
                /^(?:周|星期)一(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(2)) ? dayjs().weekday(2).subtract(1, "week") : dayjs().weekday(2),
            regExp:
                /^(?:周|星期)二(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(3)) ? dayjs().weekday(3).subtract(1, "week") : dayjs().weekday(3),
            regExp:
                /^(?:周|星期)三(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(4)) ? dayjs().weekday(4).subtract(1, "week") : dayjs().weekday(4),
            regExp:
                /^(?:周|星期)四(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(5)) ? dayjs().weekday(5).subtract(1, "week") : dayjs().weekday(5),
            regExp:
                /^(?:周|星期)五(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(6)) ? dayjs().weekday(6).subtract(1, "week") : dayjs().weekday(6),
            regExp:
                /^(?:周|星期)六(.*)/,
        }
        ,
        {
            startAt: dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, "week") : dayjs().weekday(7),
            regExp:
                /^(?:周|星期)[天日](.*)/,
        }
        ,
        {
            startAt: dayjs().add(1, "days"),
            regExp:
                /^(?:明[天日]|y(?:ester)?day?)(.*)/,
        }
        ,
        {
            startAt: dayjs().add(2, "days"),
            regExp:
                /^(?:[后後][天日]|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)(.*)/,
        }
        ,
    ]
}

const patterns = [
    {
        unit: "years",
        regExp: /(\d+)(?:年|y(?:ea)?rs?)/,
    },
    {
        unit: "months",
        regExp: /(\d+)(?:[个個]?月|months?)/,
    },
    {
        unit: "weeks",
        regExp: /(\d+)(?:周|[个個]?星期|weeks?)/,
    },
    {
        unit: "days",
        regExp: /(\d+)(?:天|日|d(?:ay)?s?)/,
    },
    {
        unit: "hours",
        regExp: /(\d+)(?:[个個]?(?:小?时|[時点點])|h(?:(?:ou)?r)?s?)/,
    },
    {
        unit: "minutes",
        regExp: /(\d+)(?:分[鐘钟]?|m(?:in(?:ute)?)?s?)/,
    },
    {
        unit: "seconds",
        regExp: /(\d+)(?:秒[鐘钟]?|s(?:ec(?:ond)?)?s?)/,
    },
]

const patternSize = Object.keys(patterns).length

/**
 * 预处理日期字符串
 * @param {string} date 原始日期字符串
 */
export const toDate = (date: string) => {
    return date
        .toLowerCase()
        .replace(/(^an?\s)|(\san?\s)/g, "1") // 替换 `a` 和 `an` 为 `1`
        .replace(/几|幾/g, "3") // 如 `几秒钟前` 视作 `3秒钟前`
        .replace(/[\s,]/g, "")
} // 移除所有空格

/**
 * 将 `['\d+时', ..., '\d+秒']` 转换为 `{ hours: \d+, ..., seconds: \d+ }`
 * 用于描述时间长度
 * @param {Array.<string>} matches 所有匹配结果
 */
export const toDurations = (matches: string[]) => {
    const durations: Record<string, string> = {}

    let p = 0
    for (const m of matches) {
        for (; p <= patternSize; p++) {
            const match = patterns[p].regExp.exec(m)
            if (match) {
                durations[patterns[p].unit] = match[1]
                break
            }
        }
    }
    return durations
}

export const parseDate = (date: string | number, ...options: any) => dayjs(date, ...options).toDate()

export const parseRelativeDate = (date: string, timezone: string = "UTC") => {
    if (date === "刚刚") return new Date()
    // 预处理日期字符串 date

    const theDate = toDate(date)

    // 将 `\d+年\d+月...\d+秒前` 分割成 `['\d+年', ..., '\d+秒前']`

    const matches = theDate.match(/\D*\d+(?![:\-/]|(a|p)m)\D+/g)
    const offset = dayjs.duration({hours: (dayjs().tz(timezone).utcOffset() - dayjs().utcOffset()) / 60})

    if (matches) {
        // 获得最后的时间单元，如 `\d+秒前`

        const lastMatch = matches.pop()

        if (lastMatch) {
            // 若最后的时间单元含有 `前`、`以前`、`之前` 等标识字段，减去相应的时间长度
            // 如 `1分10秒前`

            const beforeMatches = /(.*)(?:前|ago)$/.exec(lastMatch)
            if (beforeMatches) {
                matches.push(beforeMatches[1])
                // duration 这个插件有 bug，他会重新实现 subtract 这个方法，并且不会处理 weeks。用 ms 就可以调用默认的方法
                return dayjs().subtract(dayjs.duration(toDurations(matches))).toDate()
            }

            // 若最后的时间单元含有 `后`、`以后`、`之后` 等标识字段，加上相应的时间长度
            // 如 `1分10秒后`

            const afterMatches = /(?:^in(.*)|(.*)[后後])$/.exec(lastMatch)
            if (afterMatches) {
                matches.push(afterMatches[1] ?? afterMatches[2])
                return dayjs()
                    .add(dayjs.duration(toDurations(matches)))
                    .toDate()
            }

            // 以下处理日期字符串 date 含有特殊词的情形
            // 如 `今天1点10分`

            matches.push(lastMatch)
        }
        const firstMatch = matches.shift()

        if (firstMatch) {
            for (const w of words()) {
                const wordMatches = w.regExp.exec(firstMatch)
                if (wordMatches) {
                    matches.unshift(wordMatches[1])

                    // 取特殊词对应日零时为起点，加上相应的时间长度

                    return dayjs.tz(w.startAt
                        .set("hour", 0)
                        .set("minute", 0)
                        .set("second", 0)
                        .set("millisecond", 0)
                        .add(dayjs.duration(toDurations(matches)))
                        .add(offset), timezone)
                        .toDate()
                }
            }
        }
    } else {
        // 若日期字符串 date 不匹配 patterns 中所有模式，则默认为 `特殊词 + 标准时间格式` 的情形，此时直接将特殊词替换为对应日期
        // 如今天为 `2022-03-22`，则 `今天 20:00` => `2022-03-22 20:00`

        for (const w of words()) {
            const wordMatches = w.regExp.exec(theDate)
            if (wordMatches) {
                // The default parser of dayjs() can parse '8:00 pm' but not '8:00pm'
                // so we need to insert a space in between
                return dayjs.tz(`${w.startAt.add(offset).format("YYYY-MM-DD")} ${/a|pm$/.test(wordMatches[1]) ? wordMatches[1].replace(/a|pm/, " $&") : wordMatches[1]}`, timezone).toDate()
            }
        }
    }

    return date
}

export const rss2json = async (url: string) => {
    if (!/^https?:\/\/[^\s$.?#].\S*/i.test(url)) return

    const data = (await axios.get(url)).data

    const xml = new XMLParser({
        attributeNamePrefix: "",
        textNodeName: "$text",
        ignoreAttributes: false,
    })

    const result = xml.parse(data as string)

    let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed
    if (Array.isArray(channel)) channel = channel[0]

    const rss = {
        title: channel.title ?? "",
        description: channel.description ?? "",
        link: channel.link && channel.link.href ? channel.link.href : channel.link,
        image: channel.image ? channel.image.url : channel["itunes:image"] ? channel["itunes:image"].href : "",
        category: channel.category || [],
        updatedTime: channel.lastBuildDate ?? channel.updated,
        items: [],
    } as RSSInfo

    let items = channel.item || channel.entry || []
    if (items && !Array.isArray(items)) items = [items]

    for (let i = 0; i < items.length; i++) {
        const val = items[i]
        const media = {}

        const obj = {
            id: val.guid && val.guid.$text ? val.guid.$text : val.id,
            title: val.title && val.title.$text ? val.title.$text : val.title,
            description: val.summary && val.summary.$text ? val.summary.$text : val.description,
            link: val.link && val.link.href ? val.link.href : val.link,
            author: val.author && val.author.name ? val.author.name : val["dc:creator"],
            created: val.updated ?? val.pubDate ?? val.created,
            category: val.category || [],
            content: val.content && val.content.$text ? val.content.$text : val["content:encoded"],
            enclosures: val.enclosure ? (Array.isArray(val.enclosure) ? val.enclosure : [val.enclosure]) : [],
        };

        ["content:encoded", "podcast:transcript", "itunes:summary", "itunes:author", "itunes:explicit", "itunes:duration", "itunes:season", "itunes:episode", "itunes:episodeType", "itunes:image"].forEach((s) => {
            // @ts-expect-error TODO
            if (val[s]) obj[s.replace(":", "_")] = val[s]
        })

        if (val["media:thumbnail"]) {
            Object.assign(media, {thumbnail: val["media:thumbnail"]})
            obj.enclosures.push(val["media:thumbnail"])
        }

        if (val["media:content"]) {
            Object.assign(media, {thumbnail: val["media:content"]})
            obj.enclosures.push(val["media:content"])
        }

        if (val["media:group"]) {
            if (val["media:group"]["media:title"]) obj.title = val["media:group"]["media:title"]

            if (val["media:group"]["media:description"]) obj.description = val["media:group"]["media:description"]

            if (val["media:group"]["media:thumbnail"]) obj.enclosures.push(val["media:group"]["media:thumbnail"].url)

            if (val["media:group"]["media:content"]) obj.enclosures.push(val["media:group"]["media:content"])
        }

        Object.assign(obj, {media})

        rss.items.push(obj)
    }

    return rss
}

export const genRandomUserAgent = () => {
    // 生成随机版本号
    const getRandomVersion = (base: number, range: number) => {
        return (base + Math.floor(Math.random() * range)).toFixed(1);
    };

    const getRandomBuild = () => {
        return Math.floor(Math.random() * 1000);
    };

    const chromeVersion = getRandomVersion(120, 3);
    const firefoxVersion = getRandomVersion(120, 4);
    const safariVersion = getRandomVersion(16, 2);
    const edgeVersion = getRandomVersion(120, 3);
    const operaVersion = getRandomVersion(105, 4);
    const iosVersion = getRandomVersion(16, 2);
    const androidVersion = getRandomVersion(13, 2);

    const userAgents = [
        // Chrome
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
        `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
        `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,

        // Firefox
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${firefoxVersion}.0) Gecko/20100101 Firefox/${firefoxVersion}.0`,
        `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${firefoxVersion}.0) Gecko/20100101 Firefox/${firefoxVersion}.0`,
        `Mozilla/5.0 (X11; Linux i686; rv:${firefoxVersion}.0) Gecko/20100101 Firefox/${firefoxVersion}.0`,

        // Safari
        `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion}.${getRandomBuild()} Safari/605.1.15`,

        // Edge
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${edgeVersion}.0.0.0 Safari/537.36 Edg/${edgeVersion}.0.${getRandomBuild()}`,
        `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${edgeVersion}.0.0.0 Safari/537.36 Edg/${edgeVersion}.0.${getRandomBuild()}`,

        // Opera
        `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${operaVersion}.0.0.0 Safari/537.36 OPR/${operaVersion}.0.${getRandomBuild()}`,
        `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${operaVersion}.0.0.0 Safari/537.36 OPR/${operaVersion}.0.${getRandomBuild()}`,

        // Mobile
        `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion}_${getRandomBuild()} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${iosVersion}.${getRandomBuild()} Mobile/15E148 Safari/604.1`,
        `Mozilla/5.0 (iPad; CPU OS ${iosVersion}_${getRandomBuild()} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${iosVersion}.${getRandomBuild()} Mobile/15E148 Safari/604.1`,
        `Mozilla/5.0 (Linux; Android ${androidVersion}; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Mobile Safari/537.36`,
        `Mozilla/5.0 (Linux; Android ${androidVersion}; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Mobile Safari/537.36`
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// 代理图片
export const proxyPicture = (url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    cache?: boolean;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
} = {}): string => {
    if (!url) return '';

    try {
        const urlObj = new URL(url);

        // 如果已经是代理的URL，直接返回
        if (urlObj.pathname.startsWith('/proxy/image')) {
            return url;
        }

        // 构建代理URL的基础部分
        const baseProxyUrl = `${process.env.PROXY_URL || 'http://localhost:3000'}/proxy/image`;
        const proxyUrl = new URL(baseProxyUrl);

        // 添加原始图片URL
        proxyUrl.searchParams.set('url', encodeURIComponent(url));

        // 添加图片处理参数
        if (options.width) proxyUrl.searchParams.set('w', options.width.toString());
        if (options.height) proxyUrl.searchParams.set('h', options.height.toString());
        if (options.quality) proxyUrl.searchParams.set('q', options.quality.toString());
        if (options.format) proxyUrl.searchParams.set('fmt', options.format);
        if (options.cache !== undefined) proxyUrl.searchParams.set('cache', options.cache.toString());
        if (options.fit) proxyUrl.searchParams.set('fit', options.fit);

        // 添加时间戳和签名
        const timestamp = Date.now();
        proxyUrl.searchParams.set('t', timestamp.toString());

        // 如果配置了签名密钥，生成签名
        const proxySecret = process.env.PROXY_SECRET;
        if (proxySecret) {
            const signStr = `${url}${timestamp}${proxySecret}`;
            const sign = createHash('md5').update(signStr).digest('hex');
            proxyUrl.searchParams.set('sign', sign);
        }

        return proxyUrl.toString();
    } catch (error) {
        console.error('Error creating proxy URL:', error);
        return url; // 如果出错则返回原始URL
    }
}

/**
 * 生成缩略图URL
 * @param url 原始图片URL
 * @param size 缩略图尺寸
 */
export const getThumbnail = (url: string, size: number = 100): string => {
    return proxyPicture(url, {
        width: size,
        height: size,
        quality: 80,
        format: 'webp',
        fit: 'cover'
    });
}

/**
 * 生成预览图URL
 * @param url 原始图片URL
 * @param maxWidth 最大宽度
 */
export const getPreview = (url: string, maxWidth: number = 800): string => {
    return proxyPicture(url, {
        width: maxWidth,
        format: 'webp',
        quality: 85,
        fit: 'inside'
    });
}

// 缓存接口
interface CacheItem<T> {
    data: T;
    timestamp: number;
}


/**
 * 获取缓存数据
 * @param key 缓存键
 * @param ttl 缓存时间（毫秒）
 */
export const getCache = <T>(key: string, ttl: number = 120000): T | null => {
    const item = cacheStore.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > ttl) {
        cacheStore.delete(key);
        return null;
    }

    return item.data;
}

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 缓存数据
 */
export const setCache = <T>(key: string, data: T): void => {
    cacheStore.set(key, {
        data,
        timestamp: Date.now()
    });
}

/**
 * 清除缓存
 * @param key 缓存键，不传则清除所有缓存
 */
export const clearCache = (key?: string): void => {
    if (key) {
        cacheStore.delete(key);
    } else {
        cacheStore.clear();
    }
}

/**
 * 计算字符串的 MD5 哈希值
 * @param s
 */
export async function md5(s: string) {
    try {
        return await myCrypto(s, "MD5")
    } catch {
        return _md5(s)
    }
}

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"

/**
 * 根据指定的算法计算字符串的哈希值
 * @param s
 * @param algorithm
 */
export async function myCrypto(s: string, algorithm: Algorithm) {
    const sUint8 = new TextEncoder().encode(s)
    const hashBuffer = await subtle.digest(algorithm, sUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

export const sanitizeJsonString = (jsonString: string) => {
    // 正则表达式查找一个反斜杠 `\`，条件是它后面不能跟着任何一个
    // 合法的JSON转义字符 (" \ / b f n r t u)。
    // 使用 'g' 标志来替换所有匹配项。
    const regex = /\\(?!["\\/bfnrtu])/g;

    // 将所有匹配到的非法反斜杠替换为双反斜杠 `\\`
    return jsonString.replace(regex, '\\\\');
}
