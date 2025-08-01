// 新闻项组件
export {default as GitHubNewsItem} from './GitHubNewsItem.vue'
export {default as StockNewsItem} from './StockNewsItem.vue'
export {default as NormalNewsItem} from './NormalNewsItem.vue'
export {default as TimelineNewsItem} from './TimelineNewsItem.vue'
export {default as HotSearchItem} from './HotSearchItem.vue'
export {default as ArticleReadItem} from './ArticleReadItem.vue'
export {default as VideoListItem} from './VideoListItem.vue'

// 时间线新闻相关组件

// 根据平台类型映射对应的新闻项组件
export const NewsItemComponents = {
    // GitHub 相关
    github: 'GitHubNewsItem',
    // 股票走势
    hotstock: 'StockNewsItem',


    gelonghui: 'StockNewsItem',
    wallstreetcn_live: 'StockNewsItem',
    wallstreetcn_news: 'StockNewsItem',
    wallstreetcn_hot: 'StockNewsItem',
    cls_telegraph: 'StockNewsItem',


    // 热搜
    weibo: 'HotSearchItem',
    baidu: 'HotSearchItem',
    kuaishou: 'HotSearchItem',
    douyin: 'HotSearchItem',
    zhihu: 'HotSearchItem',
    toutiao: 'HotSearchItem',
    b_hot_search: 'HotSearchItem',

    // 时间线新闻
    _36kr: 'TimelineNewsItem',
    ithome: 'TimelineNewsItem',
    thepaper: 'TimelineNewsItem',
    solidot: 'TimelineNewsItem',
    v2ex: 'TimelineNewsItem',
    coolapk: 'TimelineNewsItem',
    cankaoxiaoxi: 'TimelineNewsItem',
    zaobao: 'TimelineNewsItem',
    sputniknewscn: 'TimelineNewsItem',
    tieba: 'TimelineNewsItem',
    kaopu: 'TimelineNewsItem',
    jin10: 'TimelineNewsItem',
    pcbeta_windows: 'TimelineNewsItem',
    nowcoder: 'TimelineNewsItem',


    // 文章阅读
    juejin: "ArticleReadItem",

    // 视频列表
    b_hot_video: 'VideoListItem',
    b_rank: 'VideoListItem',

    // 普通新闻项
    hupu: 'NormalNewsItem',

}

// 获取平台对应的新闻项组件名称
export function getNewsItemComponent(platform: string): string {
    return NewsItemComponents[platform as keyof typeof NewsItemComponents] || 'NormalNewsItem'
}
