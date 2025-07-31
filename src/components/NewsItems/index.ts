export {default as GitHubNewsItem} from './GitHubNewsItem.vue'
export {default as StockNewsItem} from './StockNewsItem.vue'
export {default as NormalNewsItem} from './NormalNewsItem.vue'
// 根据平台类型映射对应的新闻项组件
export const NewsItemComponents = {
    github: 'GitHubNewsItem',
    hotstock: 'StockNewsItem',
    gelonghui: 'StockNewsItem',
    wallstreetcn_live: 'StockNewsItem',
    wallstreetcn_news: 'StockNewsItem',
    wallstreetcn_hot: 'StockNewsItem',
    cls_telegraph: 'StockNewsItem',
    // 其他平台默认使用普通新闻项
    weibo: 'NormalNewsItem',
    baidu: 'NormalNewsItem',
    zhihu: 'NormalNewsItem',
    douyin: 'NormalNewsItem',
    toutiao: 'NormalNewsItem',
    kuaishou: 'NormalNewsItem',
    _36kr: 'NormalNewsItem',
    ithome: 'NormalNewsItem',
    solidot: 'NormalNewsItem',
    v2ex: 'NormalNewsItem',
    coolapk: 'NormalNewsItem',
    thepaper: 'NormalNewsItem',
    cankaoxiaoxi: 'NormalNewsItem',
    zaobao: 'NormalNewsItem',
    sputniknewscn: 'NormalNewsItem',
    hupu: 'NormalNewsItem',
}

// 获取平台对应的新闻项组件名称
export function getNewsItemComponent(platform: string): string {
    return NewsItemComponents[platform as keyof typeof NewsItemComponents] || 'NormalNewsItem'
}
