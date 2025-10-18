declare module 'tools' {
    export interface NewsItem {
        id: string | number // unique
        title: string
        url: string
        mobileUrl?: string
        pubDate?: number | string
        source?: string
        extra?: {
            hover?: string
            date?: number | string
            info?: false | string
            diff?: number
            icon?: false | string | {
                url: string
                scale?: number
            }
            rank?: number // 排名
            [key: string]: any // 其他属性,用于扩展
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
        }[],
        totalScore: {
            teamId: string
            teamName: string | undefined
            playerInfo: {
                "playerId": number,
                "playerName": string,
                "playerScore": number,
                "playerScoreNum": number,
                "playerLocation": string,
                "isSubstitution": boolean
            }[]
        }[]
    }

    export interface RSSInfo {
        title: string
        description: string
        link: string
        image: string
        updatedTime: string
        items: RSSItem[]
    }

    export interface RSSItem {
        title: string
        description: string
        link: string
        created?: string
    }

}

