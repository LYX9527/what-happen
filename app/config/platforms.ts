// 平台配置文件
import {
    WeiBo, Baidu, DouYin, ThePaper, TouTiao, _36kr, Blbl, CankaoXiaoxi,
    ItHome, Jin10, nowcoder, PcBeta, Solidot,
    TieBa, V2ex, WallStreetCN, Hotstock, Zaobao, Kaopu, Kuaishou, Zhihu,
    Coolapk, Hupu, Juejin, Douban, LoL, KuGou, QQMusic, CSDN, Sspai, Jqka, _51Cto, Dongchedi, Fishpi, AutoHome, FIFA,
    Valorant, Sports, Kog, CBA, NBA, Game
} from "@/components/icon";
import {DollarSign, Radio, Github} from 'lucide-vue-next'

export interface PlatformConfig {
    platform: string
    title: string
    category: string
    description?: string,
    component?: string // 可选的自定义组件名称
    icon?: typeof Game | typeof Github
}

// 路由配置
export interface RouteConfig {
    path: string
    title: string
    description: string
    platforms: string[]
    category?: string
}

// 所有可用平台配置
export const PLATFORMS: Record<string, PlatformConfig> = {
    // 热搜榜
    weibo: {platform: 'weibo', title: '微博热搜', category: 'hot', component: 'HotSearchItem', icon: WeiBo},
    baidu: {platform: 'baidu', title: '百度热搜', category: 'hot', component: 'HotSearchItem', icon: Baidu},
    kuaishou: {platform: 'kuaishou', title: '快手热搜', category: 'hot', component: 'HotSearchItem', icon: Kuaishou},
    douyin: {platform: 'douyin', title: '抖音热搜', category: 'hot', component: 'HotSearchItem', icon: DouYin},
    zhihu: {platform: 'zhihu', title: '知乎热榜', category: 'hot', component: 'HotSearchItem', icon: Zhihu},
    toutiao: {platform: 'toutiao', title: '今日头条', category: 'hot', component: 'HotSearchItem', icon: TouTiao},
    b_hot_search: {
        platform: 'b_hot_search',
        title: '哔哩哔哩热搜',
        category: 'entertainment',
        component: 'HotSearchItem',
        icon: Blbl
    },
    dcd_hot: {platform: 'dcd_hot', title: '懂车帝热搜', category: 'car', component: 'HotSearchItem', icon: Dongchedi},
    wallstreetcn_hot: {
        platform: 'wallstreetcn_hot',
        title: '华尔街见闻热榜',
        category: 'finance',
        component: 'HotSearchItem',
        icon: WallStreetCN
    },
    autohome_hot: {
        platform: 'autohome_hot',
        title: '汽车之家热搜',
        category: 'car',
        component: 'HotSearchItem',
        icon: AutoHome
    },
    autohome_article: {
        platform: 'autohome_article',
        title: '汽车之家热文',
        category: 'car',
        component: 'HotSearchItem',
        icon: AutoHome
    },
    autohome_video: {
        platform: 'autohome_video',
        title: '汽车之家视频',
        category: 'car',
        component: 'HotSearchItem',
        icon: AutoHome
    },
    // github相关
    github: {platform: 'github', title: 'GitHub趋势', category: 'tech', component: 'GitHubNewsItem', icon: Github},

    // 时间线
    _36kr: {platform: '_36kr', title: '36氪', category: 'tech', component: 'TimelineNewsItem', icon: _36kr},
    ithome: {platform: 'ithome', title: 'IT之家', category: 'tech', component: 'TimelineNewsItem', icon: ItHome},
    thepaper: {
        platform: 'thepaper',
        title: '澎湃新闻',
        category: 'social',
        component: 'TimelineNewsItem',
        icon: ThePaper
    },
    solidot: {
        platform: 'solidot',
        title: '奇客Solidot',
        category: 'tech',
        component: 'TimelineNewsItem',
        icon: Solidot
    },
    v2ex: {platform: 'v2ex', title: 'V2EX', category: 'tech', component: 'TimelineNewsItem', icon: V2ex},
    coolapk: {platform: 'coolapk', title: '酷安', category: 'tech', component: 'TimelineNewsItem', icon: Coolapk},
    cankaoxiaoxi: {
        platform: 'cankaoxiaoxi',
        title: '参考消息',
        category: 'social',
        component: 'TimelineNewsItem',
        icon: CankaoXiaoxi
    },
    zaobao: {platform: 'zaobao', title: '联合早报', category: 'social', component: 'TimelineNewsItem', icon: Zaobao},
    sputniknewscn: {
        platform: 'sputniknewscn',
        title: '俄罗斯卫星通讯社',
        category: 'social',
        component: 'TimelineNewsItem',
        icon: Radio
    },
    tieba: {platform: 'tieba', title: '百度贴吧', category: 'social', component: 'TimelineNewsItem', icon: TieBa},
    kaopu: {platform: 'kaopu', title: '靠谱', category: 'social', component: 'TimelineNewsItem', icon: Kaopu},
    jin10: {platform: 'jin10', title: '金十数据', category: 'tech', component: 'TimelineNewsItem', icon: Jin10},
    pcbeta_windows: {
        platform: 'pcbeta_windows',
        title: '远景论坛',
        category: 'tech',
        component: 'TimelineNewsItem',
        icon: PcBeta
    },
    jqka: {platform: 'jqka', title: '同花顺要闻', category: 'finance', component: 'TimelineNewsItem', icon: Jqka},
    dcd_news: {
        platform: 'dcd_news',
        title: '懂车帝资讯',
        category: 'car',
        component: 'TimelineNewsItem',
        icon: Dongchedi
    },
    autohome: {
        platform: 'autohome',
        title: '汽车之家资讯',
        category: 'car',
        component: 'TimelineNewsItem',
        icon: AutoHome
    },
    cls_telegraph: {
        platform: 'cls_telegraph',
        title: '财联社',
        category: 'finance',
        component: 'TimelineNewsItem',
        icon: DollarSign
    },
    gelonghui: {
        platform: 'gelonghui',
        title: '格隆汇',
        category: 'finance',
        component: 'TimelineNewsItem',
        icon: DollarSign
    },
    wallstreetcn_live: {
        platform: 'wallstreetcn_live',
        title: '华尔街见闻直播',
        category: 'finance',
        component: 'TimelineNewsItem',
        icon: WallStreetCN
    },
    wallstreetcn_news: {
        platform: 'wallstreetcn_news',
        title: '华尔街见闻新闻',
        category: 'finance',
        component: 'TimelineNewsItem',
        icon: WallStreetCN
    },


    // 文章阅读
    juejin: {platform: 'juejin', title: '稀土掘金', category: 'tech', component: 'ArticleReadItem', icon: Juejin},
    sspai: {platform: 'sspai', title: '少数派', category: 'tech', component: 'ArticleReadItem', icon: Sspai},
    csdn: {platform: 'csdn', title: 'CSDN', category: 'tech', component: 'ArticleReadItem', icon: CSDN},
    fishpi: {platform: 'fishpi', title: '摸鱼派', category: 'tech', component: 'ArticleReadItem', icon: Fishpi},

    // 电影榜单
    douban: {platform: 'douban', title: '豆瓣热影', category: 'entertainment', component: 'HotMovieItem', icon: Douban},
    bd_tv: {platform: 'bd_tv', title: '百度热剧', category: 'entertainment', component: 'HotTVShowItem', icon: Baidu},

    // 比赛相关
    hupu_lol: {platform: 'hupu_lol', title: '英雄联盟比赛', category: 'sports', component: 'MatchItem', icon: LoL},
    hupu_fifa: {platform: 'hupu_fifa', title: '国际足球比赛', category: 'sports', component: 'MatchItem', icon: FIFA},
    hupu_nba: {platform: 'hupu_nba', title: 'NBA比赛', category: 'sports', component: 'MatchItem', icon: NBA},
    hupu_cba: {platform: 'hupu_cba', title: 'CBA比赛', category: 'sports', component: 'MatchItem', icon: CBA},
    hupu_csl: {platform: 'hupu_csl', title: '中国足球比赛', category: 'sports', component: 'MatchItem', icon: Sports},
    hupu_kog: {platform: 'hupu_kog', title: '王者荣耀比赛', category: 'sports', component: 'MatchItem', icon: Kog},
    hupu_valorant: {
        platform: 'hupu_valorant',
        title: '无畏契约比赛',
        category: 'sports',
        component: 'MatchItem',
        icon: Valorant
    },
    hupu_ewcsports: {
        platform: 'hupu_ewcsports',
        title: 'CS2比赛',
        category: 'sports',
        component: 'MatchItem',
        icon: Game
    },
    hupu_sports: {
        platform: 'hupu_sports',
        title: '综合体育比赛',
        category: 'sports',
        component: 'MatchItem',
        icon: Sports
    },


    // 音乐榜单
    kugou: {platform: 'kugou', title: '酷狗音乐飙升榜', category: 'entertainment', component: 'MusicItem', icon: KuGou},
    qq_music: {
        platform: 'qq_music',
        title: 'QQ音乐流行榜',
        category: 'entertainment',
        component: 'MusicItem',
        icon: QQMusic
    },

    // 股票走势
    hotstock: {
        platform: 'hotstock',
        title: '雪球热股',
        category: 'finance',
        component: 'StockNewsItem',
        icon: Hotstock
    },//
    stock_sha: {
        platform: 'stock_sha',
        title: '沪A 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_shb: {
        platform: 'stock_shb',
        title: '沪B 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_sza: {
        platform: 'stock_sza',
        title: '深A 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_szb: {
        platform: 'stock_szb',
        title: '深B 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_cyb: {
        platform: 'stock_cyb',
        title: '创业板 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_zxb: {
        platform: 'stock_zxb',
        title: '中小板 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_hk: {
        platform: 'stock_hk',
        title: '港股 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },
    stock_us: {
        platform: 'stock_us',
        title: '美股 涨跌幅榜',
        category: 'finance',
        component: 'StockLeaderboardItem',
        icon: Hotstock
    },


    // 视频列表
    b_hot_video: {
        platform: 'b_hot_video',
        title: '哔哩哔哩视频',
        category: 'entertainment',
        component: 'VideoListItem',
        icon: Blbl
    },
    b_rank: {
        platform: 'b_rank',
        title: '哔哩哔哩排行榜',
        category: 'entertainment',
        component: 'VideoListItem',
        icon: Blbl
    },

    // 普通新闻项
    _51cto: {platform: '_51cto', title: '51CTO', category: 'tech', component: 'NormalNewsItem', icon: _51Cto},
    nowcoder: {platform: 'nowcoder', title: '牛客网', category: 'tech', component: 'NormalNewsItem', icon: nowcoder},
    hupu: {platform: 'hupu', title: '虎扑', category: 'social', component: 'NormalNewsItem', icon: Hupu},


}

// 路由配置
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
    // 热搜榜
    hot: {
        path: '/hot',
        title: '热搜榜',
        description: '各大平台热搜内容聚合',
        category: 'hot',
        platforms: getPlatformsByCategory("hot")
    },

    // 科技资讯
    tech: {
        path: '/tech',
        title: '科技资讯',
        description: '科技行业最新资讯和趋势',
        platforms: getPlatformsByCategory("tech"),
        category: 'tech'
    },

    // 财经新闻
    finance: {
        path: '/finance',
        title: '财经新闻',
        description: '金融市场和经济动态',
        platforms: getPlatformsByCategory("finance"),
        category: 'finance'
    },

    // 社会新闻
    social: {
        path: '/social',
        title: '社会新闻',
        description: '社会热点和时事新闻',
        platforms: getPlatformsByCategory("social"),
        category: 'social'
    },

    // 娱乐资讯
    entertainment: {
        path: '/entertainment',
        title: '娱乐资讯',
        description: '影视、音乐、游戏等娱乐内容',
        platforms: getPlatformsByCategory("entertainment"),
        category: 'entertainment'
    },

    // 体育赛事
    sports: {
        path: '/sports',
        title: '体育赛事',
        description: '体育比赛和相关资讯',
        platforms: getPlatformsByCategory("sports"),
        category: 'sports'
    },

    // 汽车资讯
    car: {
        path: '/car',
        title: '汽车资讯',
        description: '汽车行业新闻和资讯',
        platforms: getPlatformsByCategory("car"),
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
        platforms: getPlatformsByComponent("TimelineNewsItem"),
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
export function getPlatformsByCategory(category: string): string[] {
    return Object.values(PLATFORMS).filter(platform => platform.category === category).map(p => p.platform)
}

// 获取指定组件的所有平台
export function getPlatformsByComponent(component: string): string[] {
    return Object.values(PLATFORMS).filter(platform => platform.component === component).map(p => p.platform)
}

// 根据平台名称获取分类中文
export function getCategoryLabel(platform: string): string {
    const category = PLATFORMS[platform]?.category
    if (!category) return '其他'
    switch (category) {
        case 'tech':
            return '科技'
        case 'finance':
            return '财经'
        case 'social':
            return '社会'
        case 'car':
            return '汽车'
        default:
            return '其他'
    }
}

// 根据平台名称获取中文名称
export function getTitle(platform: string): string {
    const category = PLATFORMS[platform]?.title
    if (!category) return '未知平台'
    return category
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

// 根据平台类型映射对应的新闻项组件
export const NewsItemComponents: Record<string, string> = Object.fromEntries(
    Object.entries(PLATFORMS).map(([key, cfg]) => [key, cfg.component ?? 'NormalNewsItem'])
)
export const PlatformIcons = Object.fromEntries(
    Object.entries(PLATFORMS).map(([key, cfg]) => [key, cfg.icon ?? Game])
)
