import axios from "axios";
import * as cheerio from "cheerio"
import {proxyPicture} from "../utils";
const HUPU_API = process.env.HUPU_API || "https://bbs.hupu.com/all-gambia";
const HUPU_LOL_API = process.env.HUPU_LOL_API || "https://games.mobileapi.hupu.com/3/8.2.17/bplbffapi/device/v1/nav/content?clientId=140818&deviceId=xxx&time_zone=Asia/Shanghai";
const HUPU_LOL_SCORE_API = process.env.HUPU_LOL_SCORE_API || "https://games.mobileapi.hupu.com/1/8.0.99/player/v1/lol/getAllPlayerScore?matchId=";
import * as shared from "~~/server/types/shared";
import * as tools from "tools";

export const hupu = async () => {
    if (!HUPU_API) {
        throw new Error("HUPU_API is not set");
    }
    const html: any = (await axios.get(HUPU_API, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0.0 Safari/537.36"
        }
    })).data;
    const $ = cheerio.load(html)
    const result: {
        id: string,
        title: string, url: string, extra: {
            [key: string]: string
        }
    }[] = [];
    let nextData = $("script").first();
    JSON.parse(nextData.text().split("window.$$data=")[1])
        .pageData
        .threads
        .forEach((item: any) => {
            const id = item.tid;
            const title = item.title;
            const url = `https://bbs.hupu.com${item.url}`;

            result.push({
                id,
                title,
                url,
                extra: {
                    desc: item.desc || "",
                    lights: item.lights || "",
                    replies: item.replies || "",
                    topic: item?.topic?.name || "",
                    cover: item?.cover ? proxyPicture(item.cover) : "",
                }
            });
        });
    return result;
}


export const hupuLOL = async () => {
    const res: shared.HuPuLOLRes = await baseFunction("20")
    let match = res.result.components.filter(item => item.code === "match")[0];
    if (!match) {
        throw new Error("No match data found");
    }

    const results: tools.MatchItem[] = [];

    // 串行处理，避免API频率限制
    for (const item of match.data.matchInfo) {
        let matchId = item.matchId;
        let needAddTotalScore = item.matchStatus === "COMPLETED";

        let newVar = {
            matchName: item.matchName || "",
            matchStatus: item.matchStatusDesc || "",
            matchStartTimeStamp: item.matchStartTimeStamp || 0,
            memberInfos: item.againstInfo.memberInfos.map((matchInfo) => {
                return {
                    memberName: matchInfo.memberName,
                    memberId: matchInfo.memberId,
                    memberBaseScore: matchInfo.memberBaseScore,
                    memberLogo: matchInfo.memberLogo ? proxyPicture(matchInfo.memberLogo) : "",
                }
            }),
        } as tools.MatchItem;

        if (needAddTotalScore) {
            try {
                const teamMap = new Map<string, string>();
                item.againstInfo.memberInfos.forEach((matchInfo) => {
                    teamMap.set(matchInfo.memberId, matchInfo.memberName);
                });
                newVar.totalScore = await hupuLoLScore(matchId, teamMap);
            } catch (error) {
                console.error(`Failed to fetch score for matchId: ${matchId}`, error);
            }
        }

        results.push(newVar);
    }

    return results;
}

export const hupuFIFA = async () => {
    return await baseMatch("18");
}
export const hupuNBA = async () => {
    return await baseMatch("16");
}
export const hupuCBA = async () => {
    return await baseMatch("17");
}
export const hupuCSL = async () => {
    return await baseMatch("19");
}
export const hupuKOG = async () => {
    return await baseMatch("21");
}
export const hupuValorant = async () => {
    return await baseMatch("22");
}
export const hupuEWC = async () => {
    return await baseMatch("23");
}
export const hupuSports = async () => {
    return await baseMatch("24");
}

const baseMatch = async (pageId: string) => {
    if (!HUPU_LOL_API) {
        throw new Error("HUPU_LOL_API is not set");
    }
    const res: shared.HuPuLOLRes = await baseFunction(pageId)
    let match = res.result.components.filter(item => item.code === "match")[0];

    if (!match) {
        throw new Error("No match data found");
    }
    const results: tools.MatchItem[] = [];
    match.data.matchInfo.forEach((item: any) => {
        results.push({
            matchName: item.matchName || "",
            matchStatus: item.matchStatusDesc || "",
            matchStartTimeStamp: item.matchStartTimeStamp || 0,
            memberInfos: item.againstInfo.memberInfos.map((matchInfo: {
                memberName: any;
                memberId: any;
                memberBaseScore: any;
                memberLogo: string;
            }) => {
                return {
                    memberName: matchInfo.memberName,
                    memberId: matchInfo.memberId,
                    memberBaseScore: matchInfo.memberBaseScore,
                    memberLogo: matchInfo.memberLogo ? proxyPicture(matchInfo.memberLogo) : "",
                }
            }),
        } as tools.MatchItem);
    });
    return results;
}

const baseFunction = async (pageId: string) => {
    if (!HUPU_LOL_SCORE_API) {
        throw new Error("HUPU_LOL_SCORE_API is not set");
    }
    const res: shared.HuPuLOLRes = (await axios.get(`${HUPU_LOL_API}&pageId=${pageId}`)).data;
    return res;
}

const hupuLoLScore = async (
    matchId: string,
    teamMap: Map<string, string> = new Map<string, string>()
) => {
    if (!HUPU_LOL_SCORE_API) {
        throw new Error("HUPU_LOL_SCORE_API is not set");
    }
    const res: shared.HuPuLoLScoreRes = (await axios.get(HUPU_LOL_SCORE_API + matchId)).data;
    return res.data.teamScoreInfo.map(item => {
        return {
            teamName: teamMap.get(item.teamId + ""),
            teamId: item.teamId,
            playerInfo: item.playerInfo,
        }
    })
}

