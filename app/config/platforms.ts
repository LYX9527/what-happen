// 平台配置文件
export interface PlatformConfig {
    platform: string
    title: string
    category: string
    description?: string
}

export interface RouteConfig {
    path: string
    title: string
    description: string
    platforms: string[]
    category?: string
}

// 所有可用平台配置
export const PLATFORMS: Record<string, PlatformConfig> = {
    weibo: {platform: 'weibo', title: '微博热搜', category: 'hot'},
    baidu: {platform: 'baidu', title: '百度热搜', category: 'hot'},
    douyin: {platform: 'douyin', title: '抖音热搜', category: 'hot'},
    toutiao: {platform: 'toutiao', title: '今日头条', category: 'hot'},
    zhihu: {platform: 'zhihu', title: '知乎热榜', category: 'hot'},
    kuaishou: {platform: 'kuaishou', title: '快手热搜', category: 'hot'},

    github: {platform: 'github', title: 'GitHub趋势', category: 'tech'},
    '_36kr': {platform: '_36kr', title: '36氪', category: 'tech'},
    ithome: {platform: 'ithome', title: 'IT之家', category: 'tech'},
    solidot: {platform: 'solidot', title: '奇客Solidot', category: 'tech'},
    v2ex: {platform: 'v2ex', title: 'V2EX', category: 'tech'},
    coolapk: {platform: 'coolapk', title: '酷安', category: 'tech'},
    juejin: {platform: 'juejin', title: '稀土掘金', category: 'tech'},
    sspai: {platform: 'sspai', title: '少数派', category: 'tech'},
    csdn: {platform: 'csdn', title: 'CSDN', category: 'tech'},
    nowcoder: {platform: 'nowcoder', title: '牛客网', category: 'tech'},
    pcbeta_windows: {platform: 'pcbeta_windows', title: '远景论坛', category: 'tech'},
    '_51cto': {platform: '_51cto', title: '51CTO', category: 'tech'},
    kaopu: {platform: 'kaopu', title: '靠谱', category: 'tech'},

    gelonghui: {platform: 'gelonghui', title: '格隆汇', category: 'finance'},
    wallstreetcn_live: {platform: 'wallstreetcn_live', title: '华尔街见闻直播', category: 'finance'},
    wallstreetcn_news: {platform: 'wallstreetcn_news', title: '华尔街见闻新闻', category: 'finance'},
    wallstreetcn_hot: {platform: 'wallstreetcn_hot', title: '华尔街见闻热榜', category: 'finance'},
    hotstock: {platform: 'hotstock', title: '雪球热股', category: 'finance'},
    cls_telegraph: {platform: 'cls_telegraph', title: '财联社', category: 'finance'},
    jqka: {platform: 'jqka', title: '同花顺要闻', category: 'finance'},
    jin10: {platform: 'jin10', title: '金十数据', category: 'finance'},

    thepaper: {platform: 'thepaper', title: '澎湃新闻', category: 'social'},
    cankaoxiaoxi: {platform: 'cankaoxiaoxi', title: '参考消息', category: 'social'},
    zaobao: {platform: 'zaobao', title: '联合早报', category: 'social'},
    sputniknewscn: {platform: 'sputniknewscn', title: '俄罗斯卫星通讯社', category: 'social'},
    tieba: {platform: 'tieba', title: '百度贴吧', category: 'social'},

    douban: {platform: 'douban', title: '豆瓣热影', category: 'entertainment'},
    bd_tv: {platform: 'bd_tv', title: '百度热剧', category: 'entertainment'},
    kugou: {platform: 'kugou', title: '酷狗音乐飙升榜', category: 'entertainment'},
    qq_music: {platform: 'qq_music', title: 'QQ音乐流行榜', category: 'entertainment'},

    hupu_lol: {platform: 'hupu_lol', title: '英雄联盟比赛', category: 'sports'},
    hupu: {platform: 'hupu', title: '虎扑', category: 'sports'},

    dcd_hot: {platform: 'dcd_hot', title: '懂车帝热搜', category: 'car'},
    dcd_news: {platform: 'dcd_news', title: '懂车帝资讯', category: 'car'},

    b_hot_search: {platform: 'b_hot_search', title: '哔哩哔哩热搜', category: 'entertainment'},
    b_hot_video: {platform: 'b_hot_video', title: '哔哩哔哩视频', category: 'entertainment'},
    b_rank: {platform: 'b_rank', title: '哔哩哔哩排行榜', category: 'entertainment'},
}

// 路由配置
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
    // 热搜榜
    hot: {
        path: '/hot',
        title: '热搜榜',
        description: '各大平台热搜内容聚合',
        platforms: ['weibo', 'baidu', 'douyin', 'toutiao', 'zhihu', 'kuaishou'],
        category: 'hot'
    },

    // 科技资讯
    tech: {
        path: '/tech',
        title: '科技资讯',
        description: '科技行业最新资讯和趋势',
        platforms: ['github', '_36kr', 'ithome', 'solidot', 'v2ex', 'coolapk', 'juejin', 'sspai', 'csdn', "_51cto", "jin10", "nowcoder", "pcbeta_windows"],
        category: 'tech'
    },

    // 财经新闻
    finance: {
        path: '/finance',
        title: '财经新闻',
        description: '金融市场和经济动态',
        platforms: ['gelonghui', 'wallstreetcn_live', 'wallstreetcn_news', 'wallstreetcn_hot', 'hotstock', 'cls_telegraph', 'jqka'],
        category: 'finance'
    },

    // 社会新闻
    social: {
        path: '/social',
        title: '社会新闻',
        description: '社会热点和时事新闻',
        platforms: ['thepaper', 'cankaoxiaoxi', 'zaobao', 'sputniknewscn', 'hupu', "kaopu", "tieba"],
        category: 'social'
    },

    // 娱乐资讯
    entertainment: {
        path: '/entertainment',
        title: '娱乐资讯',
        description: '影视、音乐、游戏等娱乐内容',
        platforms: ['douban', 'bd_tv', 'kugou', 'qq_music', 'b_hot_search', 'b_hot_video', 'b_rank'],
        category: 'entertainment'
    },

    // 体育赛事
    sports: {
        path: '/sports',
        title: '体育赛事',
        description: '体育比赛和相关资讯',
        platforms: ['hupu_lol'],
        category: 'sports'
    },

    // 汽车资讯
    car: {
        path: '/car',
        title: '汽车资讯',
        description: '汽车行业新闻和资讯',
        platforms: ['dcd_hot', 'dcd_news'],
        category: 'car'
    },

    // 收藏相关
    'favorites-news': {
        path: '/favorites-news',
        title: '收藏的新闻',
        description: '您收藏的新闻内容',
        platforms: [],
        category: 'favorites'
    },

    'favorites-platforms': {
        path: '/favorites-platforms',
        title: '收藏的平台',
        description: '您收藏的平台内容',
        platforms: [],
        category: 'favorites'
    },

    // 时间线
    index: {
        path: '/',
        title: '新闻第一线',
        description: '多平台新闻资讯聚合展示',
        platforms: ['_36kr', 'ithome', 'thepaper', 'solidot', 'v2ex', 'coolapk',
            'cankaoxiaoxi', 'zaobao', 'sputniknewscn', 'tieba', 'kaopu',
            'jin10', 'pcbeta_windows', 'jqka', 'dcd_news', 'cls_telegraph',
            'gelonghui', 'wallstreetcn_live', 'wallstreetcn_news'],
        category: 'index'
    }
}

// 获取路由配置
export function getRouteConfig(path: string): RouteConfig | null {
    const routeKey = path === '/' ? 'index' : path.replace('/', '')
    return ROUTE_CONFIGS[routeKey] || null
}

// 获取平台配置列表
export function getPlatformConfigs(platformKeys: string[]): PlatformConfig[] {
    return platformKeys.map(key => PLATFORMS[key]).filter((config): config is PlatformConfig => Boolean(config))
}

// 获取分类下的所有平台
export function getPlatformsByCategory(category: string): PlatformConfig[] {
    return Object.values(PLATFORMS).filter(platform => platform.category === category)
}

// 导航菜单配置
export const NAVIGATION_ITEMS = [
    {path: '/', title: '首页', icon: 'Home'},
    {path: '/hot', title: '热搜榜', icon: 'TrendingUp'},
    {path: '/tech', title: '科技资讯', icon: 'Cpu'},
    {path: '/finance', title: '财经新闻', icon: 'DollarSign'},
    {path: '/social', title: '社会新闻', icon: 'Globe'},
    {path: '/entertainment', title: '娱乐资讯', icon: 'Music'},
    {path: '/sports', title: '体育赛事', icon: 'Trophy'},
    {path: '/car', title: '汽车资讯', icon: 'Car'},
    {path: '/favorites-news', title: '收藏新闻', icon: 'Heart'},
    {path: '/favorites-platforms', title: '收藏平台', icon: 'Bookmark'},
]
