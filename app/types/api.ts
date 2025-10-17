// API 类型定义

export interface Platform {
  platform: string
  label: string
  list: {
    platform: string
    label: string
  }[]
}

export interface NewsItem {
  id: string
  title: string
  url: string
  extra?: {
    info?: string
    hover?: string
    date?: string
    dateStr?: string
    rank?: number
    icon?: {
      url: string
      scale: number
      info: string
    }
    num: number
    view?: number
    like?: number
    comment?: number | {
      content: string
      avatar: string
    }
    collect?: number
    thumbnail?: {
      url: string
      hover?: string
    }
    video?: {
      info: string
      duration: string
    }
    score?: number
    desc?: string
    rating?: {
      count: number
      value: number
    }
    comments: {
      content: string
      avatar: string
    }
    current?: number
    percent?: string
    change?: string
    market_capital?: string
  }
}

export interface MatchItem {
  matchName: string
  matchStatus: string
  matchStartTimeStamp: number
  memberInfos: {
    memberName: string
    memberId: string
    memberBaseScore: string
    memberLogo: string
  }[]
  totalScore?: {
    teamId: string
    teamName?: string
    playerInfo: {
      playerId: number
      playerName: string
      playerScore: number
      playerScoreNum: number
      playerLocation: string
      isSubstitution: boolean
    }[]
  }[]
}

export interface AISection {
  title: string
  content: string
  platforms?: string[]
}

export interface AISummaryData {
  category: string
  generatedAt: string
  summary: string
  hotTopics: Array<{
    topic: string
    description: string
    relatedPlatforms: string[]
  }>
  trends: Array<{
    title: string
    description: string
  }>
  sections?: AISection[]
}

export type ApiResponse<T> = {
  code: number
  msg: string
  data: T
}

