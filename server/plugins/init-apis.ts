import { apiManager } from '../manager'
import * as apis from '../apis'

/**
 * 初始化并注册所有 API
 */
export default defineNitroPlugin((nitroApp) => {
  console.log('正在初始化 API 管理器...')

  // 注册热搜榜平台
  apiManager.registerApi('zhihu', apis.zhihu)
  apiManager.registerApi('weibo', apis.weibo)
  apiManager.registerApi('baidu', apis.baidu)
  apiManager.registerApi('douyin', apis.douyin)
  apiManager.registerApi('kuaishou', apis.kuaishou)
  apiManager.registerApi('toutiao', apis.toutiao)

  // 注册科技资讯平台
  apiManager.registerApi('github', apis.githubTrending)
  apiManager.registerApi('_36kr', apis._36kr)
  apiManager.registerApi('ithome', apis.ithome)
  apiManager.registerApi('solidot', apis.solidot)
  apiManager.registerApi('v2ex', apis.v2exShare)
  apiManager.registerApi('coolapk', apis.coolapk)
  apiManager.registerApi('juejin', apis.juejin)
  apiManager.registerApi('csdn', apis.csdn)
  apiManager.registerApi('sspai', apis.sspai)
  apiManager.registerApi('fishpi', apis.fishpi)
  apiManager.registerApi('_51cto', apis._51cto)
  apiManager.registerApi('nowcoder', apis.nowcoder)
  apiManager.registerApi('jin10', apis.jin10)
  apiManager.registerApi('linuxdo_hot', apis.linuxDoHot)
  apiManager.registerApi('linuxdo_latest', apis.linuxDoLatest)

  // 注册社会新闻平台
  apiManager.registerApi('thepaper', apis.thepaper)
  apiManager.registerApi('tieba', apis.tieba)
  apiManager.registerApi('kaopu', apis.kaopu)
  apiManager.registerApi('cankaoxiaoxi', apis.cankaoxiaoxi)
  apiManager.registerApi('zaobao', apis.zaobao)
  apiManager.registerApi('hupu', apis.hupu)

  // 注册娱乐资讯平台
  apiManager.registerApi('b_hot_search', apis.bHotSearch)
  apiManager.registerApi('b_hot_video', apis.bHotVideo)
  apiManager.registerApi('b_rank', apis.bRanking)
  apiManager.registerApi('douban', apis.douban)
  apiManager.registerApi('bd_tv', apis.baiduTeleplay)
  apiManager.registerApi('kugou', apis.kugou)
  apiManager.registerApi('qq_music', apis.qqMusic)

  // 注册其他需要特殊支持的平台
  apiManager.registerApi('sputniknewscn', apis.sputniknewscn)
  apiManager.registerApi('guoheboke', apis.guoheboke)
  apiManager.registerApi('smzdm', apis.smzdm)
  apiManager.registerApi('pcbeta_windows', apis.pcbetaWin)
  apiManager.registerApi('pcbeta_win11', apis.pcbetaWin11)

  // 注册体育赛事平台
  apiManager.registerApi('hupu_lol', apis.hupuLOL)
  apiManager.registerApi('hupu_fifa', apis.hupuFIFA)
  apiManager.registerApi('hupu_nba', apis.hupuNBA)
  apiManager.registerApi('hupu_cba', apis.hupuCBA)
  apiManager.registerApi('hupu_csl', apis.hupuCSL)
  apiManager.registerApi('hupu_kog', apis.hupuKOG)
  apiManager.registerApi('hupu_valorant', apis.hupuValorant)
  apiManager.registerApi('hupu_ewcsports', apis.hupuEWC)
  apiManager.registerApi('hupu_sports', apis.hupuSports)

  // 注册汽车资讯平台
  apiManager.registerApi('dcd_hot', apis.dongchediHot)
  apiManager.registerApi('dcd_news', apis.dongchediNews)
  apiManager.registerApi('autohome', apis.autohome)
  apiManager.registerApi('autohome_hot', apis.autohomeRankHot)
  apiManager.registerApi('autohome_article', apis.autohomeRankArticle)
  apiManager.registerApi('autohome_video', apis.autohomeRankVideo)

  // 注册财经新闻平台
  apiManager.registerApi('wallstreetcn_hot', apis.wallStreetCnHot)
  apiManager.registerApi('wallstreetcn_live', apis.wallStreetCnLive)
  apiManager.registerApi('wallstreetcn_news', apis.wallStreetCnNews)
  apiManager.registerApi('jqka', apis.jqka)
  apiManager.registerApi('cls_telegraph', apis.telegraph)
  apiManager.registerApi('gelonghui', apis.gelonghui)
  apiManager.registerApi('hotstock', apis.hotstock)
  apiManager.registerApi('stock_sha', apis.stockSha)
  apiManager.registerApi('stock_shb', apis.stockShb)
  apiManager.registerApi('stock_sza', apis.stockSza)
  apiManager.registerApi('stock_szb', apis.stockSzb)
  apiManager.registerApi('stock_cyb', apis.stockCyb)
  apiManager.registerApi('stock_zxb', apis.stockZxb)
  apiManager.registerApi('stock_hk', apis.stockHk)
  apiManager.registerApi('stock_us', apis.stockUs)

  console.log(`API 管理器初始化完成，已注册 ${apiManager.getRegisteredApis().length} 个平台`)
})

