import { ApiResponse } from '../../utils/response'
import axios from 'axios';
import sharp from 'sharp';
import {createHash} from 'crypto';
import {genRandomUserAgent} from '../../utils';
// --- 缓存机制 ---
// 只要服务器实例正在运行，这个缓存就会一直存在。
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24小时
const imageCache = new Map<string, { data: Buffer; timestamp: number; contentType: string }>();

// 定时清理过期的缓存条目。
// 注意：在Serverless（无服务器）环境中，这个定时器可能不会按预期工作。
// 对于无服务器环境，更健壮的方案是使用像Redis这样的外部缓存。
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of imageCache) {
        if (now - value.timestamp > CACHE_TIME) {
            imageCache.delete(key);
        }
    }
}, CACHE_TIME);
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const {
        url,
        w: width,
        h: height,
        q: quality,
        fmt: format,
        cache = 'true'
    } = query;

    if (!url || typeof url !== 'string') {
        return ApiResponse.error('缺少 url 参数', 400);
    }

    // 1. 验证请求 (可选，取决于你的安全需求)
    if (!verifyRequest(query)) {
        return ApiResponse.error('无效或已过期的请求', 403);
    }
    // 2. 从查询参数中解析图片处理选项
    const options = {
        width: width ? parseInt(width as string) : undefined,
        height: height ? parseInt(height as string) : undefined,
        quality: quality ? parseInt(quality as string) : 80,
        format: format as 'jpeg' | 'png' | 'webp' | 'gif' | undefined,
    };
    try {
        // 3. 检查是否存在有效的缓存响应
        const cacheKey = generateCacheKey(url, options);
        if (cache === 'true' && imageCache.has(cacheKey)) {
            const cached = imageCache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < CACHE_TIME) {
                setResponseHeader(event, 'Content-Type', cached.contentType);
                setResponseHeader(event, 'X-Cache', 'HIT'); // 命中缓存
                setResponseHeader(event, 'Cache-Control', `public, max-age=${CACHE_TIME / 1000}`);
                return send(event, cached.data);
            }
        }

        // 4. 获取远程图片
        const decodedUrl = decodeURIComponent(url);
        const response = await axios.get(decodedUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': genRandomUserAgent() },
        });

        const imageBuffer = Buffer.from(response.data);
        const originalFormat = detectImageFormat(imageBuffer);

        // 5. 特殊情况处理：如果原图是GIF且无需任何处理，则直接返回。
        if (originalFormat === 'gif' && !options.format && !options.width && !options.height) {
            if (cache === 'true') {
                imageCache.set(cacheKey, {
                    data: imageBuffer,
                    timestamp: Date.now(),
                    contentType: 'image/gif',
                });
            }
            setResponseHeader(event, 'Content-Type', 'image/gif');
            setResponseHeader(event, 'X-Cache', 'MISS'); // 未命中缓存
            setResponseHeader(event, 'Cache-Control', `public, max-age=${CACHE_TIME / 1000}`);
            return send(event, imageBuffer);
        }

        // 6. 使用 Sharp 处理图片
        // 如果原图是GIF，启用 animated: true 以保留动画
        let image = sharp(imageBuffer, { animated: originalFormat === 'gif' });

        // 调整尺寸
        if (options.width || options.height) {
            image.resize(options.width, options.height, {
                fit: 'inside', // 保持宽高比，将图片缩放到刚好能 contener 在指定尺寸内
                withoutEnlargement: true, // 防止图片被放大
            });
        }

        const finalFormat = options.format || originalFormat;

        // 应用特定格式的转换和质量选项
        switch (finalFormat) {
            case 'jpeg':
                image.jpeg({ quality: options.quality });
                break;
            case 'png':
                image.png({ quality: options.quality });
                break;
            case 'webp':
                image.webp({ quality: options.quality });
                break;
            case 'gif':
                // 如果输入是动态的，Sharp可以输出动态GIF
                image.gif();
                break;
        }

        const processedImage = await image.toBuffer();

        // 7. 缓存处理后的结果
        const finalContentType = `image/${finalFormat}`;
        if (cache === 'true') {
            imageCache.set(cacheKey, {
                data: processedImage,
                timestamp: Date.now(),
                contentType: finalContentType,
            });
        }

        // 8. 发送最终的响应
        setResponseHeader(event, 'Content-Type', finalContentType);
        setResponseHeader(event, 'X-Cache', 'MISS'); // 未命中缓存
        setResponseHeader(event, 'Cache-Control', `public, max-age=${CACHE_TIME / 1000}`);

        return send(event, processedImage);

    } catch (error: any) {
        console.error('图片代理出错:', error.message);
        // 检查是否是axios错误，以便返回更具体的错误码
        if (error.isAxiosError && error.response) {
            return ApiResponse.error(`获取图片失败: ${error.response.statusText}`, error.response.status);
        }
        return ApiResponse.error('处理图片时发生错误', 500);
    }
})

// 根据URL和处理选项生成唯一的缓存键。
const generateCacheKey = (url: string, options: any): string => {
    const str = `${url}-${JSON.stringify(options)}`;
    return createHash('md5').update(str).digest('hex');
};
// 验证时间戳以防止重放攻击 (可选功能)。
const verifyRequest = (query: ReturnType<typeof getQuery>): boolean => {
    // 在Nuxt中，使用runtimeConfig来访问环境变量
    const config = useRuntimeConfig();
    if (!config.proxySecret) return true; // 如果没有设置密钥，则跳过验证
    // @ts-ignore
    const timestamp = parseInt(query.t as string);
    // 5分钟的过期窗口
    if (isNaN(timestamp) || Date.now() - timestamp > 300000) {
        return false;
    }

    return true;
};

// 通过缓冲区签名（魔数）来检测图片格式。
const detectImageFormat = (buffer: Buffer): string => {
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'gif';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'png';
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpeg';
    if (buffer.length > 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'webp';
    return 'jpeg'; // 默认回退格式
};
