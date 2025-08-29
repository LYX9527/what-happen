// 新闻项组件
import {NewsItemComponents} from "~/config/platforms";

export {default as GitHubNewsItem} from './GitHubNewsItem.vue'
export {default as StockNewsItem} from './StockNewsItem.vue'
export {default as StockLeaderboardItem} from './StockLeaderboardItem.vue'
export {default as NormalNewsItem} from './NormalNewsItem.vue'
export {default as TimelineNewsItem} from './TimelineNewsItem.vue'
export {default as HotSearchItem} from './HotSearchItem.vue'
export {default as ArticleReadItem} from './ArticleReadItem.vue'
export {default as VideoListItem} from './VideoListItem.vue'
export {default as HotMovieItem} from './HotMovieItem.vue'
export {default as HotTVShowItem} from './HotTVShowItem.vue'
export {default as MatchItem} from './MatchItem.vue'
export {default as MusicItem} from './MusicItem.vue'



// 获取平台对应的新闻项组件名称
export function getNewsItemComponent(platform: string): string {
    return NewsItemComponents[platform as keyof typeof NewsItemComponents] || 'NormalNewsItem'
}
