# 日系穿搭网站 · Design Spec

**Date:** 2026-04-19
**Owner:** Mengyuan (Pi)
**Audience:** 一位具体的 30+ 男性朋友（单用户场景）
**Status:** Draft — pending review

---

## 1. Context & Motivation

Pi 想为一位零基础朋友做一个个人向的日系穿搭参考网站。朋友的情况：
- 身材：175cm / 75kg
- 年龄：30+
- 日常：上班 + 休闲混合场景
- 当前水平：零基础（基本 T 恤牛仔裤走天下）
- 风格偏好：无明确偏好

网站不是公开产品，也不面向一群用户。就是给这个朋友看的，目的是让他在最低心智负担下能"买对 + 穿对"。

## 2. Goals & Non-Goals

### Goals
- 让朋友在不读任何"搭配原理"的情况下，能照着网站直接买到一批基础单品
- 让他能照着现成搭配复刻（不需要自己搭）
- 内容维护成本低（Pi 一人即可更新，图片直接用品牌官网）
- 手机访问体验优先（他大概率在手机上看）

### Non-Goals
- 不做账号系统、收藏、评论、分享等社区功能
- 不做"搭配原理教程"页（原则藏在每套搭配的一句话点评里）
- 不做多用户、多国家、多语言
- 不做季节/月度自动更新机制（v1 是一份精选，之后人工增量）
- 不做电商交易闭环，只给外链
- 不做 SEO 优化（访客就一个人）

## 3. Target User Profile

单一 target user：那位男生朋友。设计、文案、配色、交互都围绕他：
- 阅读场景：通勤地铁上滑手机 / 周末躺沙发上 / 买衣服前快速查
- 心智负担：极低 —— 不看就能买，看一眼就能学
- 情绪：不想被说教，不想感到"被改造"；希望网站看起来顺眼、不土、不女性化

## 4. Style Direction（穿搭内容方向）

**都市简约日系**（Urban Minimal Japanese）

- **代表品牌**：UNIQLO U、无印良品、COS、Auralee（作为气质参考）
- **代表杂志**：POPEYE（City Boy 感）、Popeye 的日常编排
- **关键词**：干净剪裁、中性色、不张扬、通勤休闲通吃
- **核心单品**：牛津衬衫、T 恤、polo、针织衫、直筒裤、卡其裤、乐福鞋、简约运动鞋、轻外套
- **色系**：米白、海军蓝、卡其、橄榄、炭灰、焦糖

**明确不包含的日系子风格**：Amekaji（太复古）、Mode/暗黑系（太前卫）、古着（太小众）、街头潮牌（太年轻）。这些以后可以加子分类，v1 不做。

## 5. Information Architecture

三个页面，结构故意极简：

```
/ (首页 · Lookbook)
  └─ 10 套搭配卡片，按场景标签筛选
     └─ /outfit/:id (搭配详情)
          ├─ 大图
          ├─ 一句话点评（为什么这样搭）
          ├─ 单品拆解（每件：缩略图 / 名字 / 价格 / 购买链接）
          └─ 相关搭配推荐（同场景 2-3 套）

/essentials (核心衣橱)
  └─ 15 件基础单品的汇总清单
     ├─ 按品类分组：上衣 / 下装 / 外套 / 鞋 / 配件
     └─ 每件：品牌 / 价格 / 购买链接 / 出现在哪些搭配里（链接回 lookbook）
```

### Outfit 场景分布（10 套）
- 工作日：4 套（周一 clean / 周三 layering / 周五 casual friday / 热天 smart casual）
- 周末休闲：2 套（出门吃饭 / 逛街看展）
- 约会：2 套（白天咖啡 / 晚餐偏正式）
- 略正式：2 套（公司团建 / 见长辈）

### Essentials 15 件
（品类预估，具体单品由 Pi 在内容生产阶段定稿）
- 上衣：白 T、灰 T、白牛津衬衫、浅蓝牛津衬衫、条纹 polo、米色针织衫 —— 6 件
- 下装：深色直筒牛仔、卡其直筒、深灰羊毛西裤 —— 3 件
- 外套：浅色风衣 或 海军蓝夹克、米色开衫 —— 2 件
- 鞋：白色运动鞋、棕色乐福鞋 —— 2 件
- 配件：简约皮带、素色袜（多双算一类） —— 2 件

## 6. Data Model (`data.json`)

单一 JSON 文件驱动整个站点。结构：

```json
{
  "essentials": [
    {
      "id": "white-oxford-shirt",
      "name": "白色牛津衬衫",
      "nameEn": "White Oxford Shirt",
      "category": "top",
      "brand": "UNIQLO",
      "productName": "宽松版牛津扣领衬衫",
      "priceRange": "¥199",
      "image": "/images/essentials/white-oxford.jpg",
      "buyUrl": "https://www.uniqlo.cn/...",
      "note": "一件挡十件。能上班能约会，袖口卷一下就是周末。"
    }
  ],
  "outfits": [
    {
      "id": "weekday-01",
      "title": "Oxford, Chino, Loafer.",
      "subtitle": "白衬衫 + 卡其裤 + 乐福鞋",
      "scene": "weekday",
      "sceneLabel": "工作日 · 周一晨会",
      "heroImage": "/images/outfits/weekday-01.jpg",
      "tagline": "最稳的一套。颜色不超过三个，剪裁干净就够了。",
      "itemIds": ["white-oxford-shirt", "khaki-chino", "brown-loafer", "simple-belt"],
      "relatedOutfitIds": ["weekday-03", "semi-formal-01"]
    }
  ]
}
```

**交叉引用**：outfit 引用 essentials 的 id；essentials 页面反向列出"出现在哪些搭配里"。通过前端 JS 在加载时建立反向索引。

## 7. Page Designs

### 7.1 首页（Lookbook）
- 顶部：极简 header（站名 + Essentials 链接 + 场景筛选 chips）
- 主体：搭配卡片瀑布流（desktop 3 列 / tablet 2 列 / mobile 1 列）
- 卡片：大图 / 顶部角落 `No. XX` + 场景标签 / 下方标题 + 中文副标 / 小色板
- 底部：footer（"为 [朋友名] 做 · 2026" 之类）

### 7.2 搭配详情页
- 顶部：全宽 hero 图（可滑动切换多视角，若有）
- 标题 + 一句话 tagline
- 场景标签 · 日期/天气适配提示（可选）
- 单品网格：4-5 件单品卡片，每张点击可外跳购买
- 底部：2-3 张"类似场景"的搭配卡片，引导继续逛

### 7.3 核心衣橱页
- 顶部：一句话引入（"先有这 15 件，再谈搭配"）
- 分组列表：上衣 / 下装 / 外套 / 鞋 / 配件
- 每件：缩略图 / 名字 / 品牌 / 价格 / 购买链接 / 出现在搭配数量（链接）
- 提供一个"打包购买清单"导出（可选：复制文本版清单到剪贴板）

## 8. Visual Design System

**方向**：Editorial Minimal · POPEYE magazine 感

### Typography
- 英文标题：serif（EB Garamond 或类似 transitional serif）· 400 weight · 字距 +0.02em
- 中文标题/副标：思源宋体 或 花园明朝体
- 英文正文：Inter · 14-15px
- 中文正文：PingFang SC / 系统默认

### Color
- 背景：`#ffffff` / `#f7f3ea`（米白）
- 主文：`#1a1a1a`
- 副文：`#7a7468`
- 边框/分隔：`#e8e6e1`
- 点缀色（少量使用）：`#8b6a3c`（焦糖，来自 Pi 的大地色延伸）· `#2a2620`（深棕）

### Layout
- 白色大留白，grid 克制
- serif 标题与极简 sans-serif label 对比
- 色板小圆点用于传达"这套搭配的色彩语言"
- 图片居中、留白充足，编号 `No. XX` 作为杂志感的 editorial 元素

### Anti-references
- 不要带任何 Pinterest aesthetic（粉色、手写字、贴纸）
- 不要 streetwear 潮牌感（粗体字、高饱和）
- 不要典型电商站（促销色块、价格标签过大）

## 9. Tech Stack

- **前端**：Vanilla HTML + CSS + JavaScript（无框架）
- **数据**：单份 `data.json` 手动维护
- **样式**：一份 `styles.css`，CSS 变量管理 token，响应式用 media query
- **路由**：URL hash 路由（`/#/outfit/weekday-01`）或简单的静态 path + `index.html` 回退
- **PWA**：基础 `manifest.json` + service worker（可离线缓存图片和 JSON）
- **构建**：无构建步骤 · 纯静态文件
- **部署**：GitHub Pages（repo 命名如 `jp-style-site`，走 `pipiquan352.github.io/jp-style-site/`）
- **域名**：v1 使用 GitHub Pages 默认域名，未来可选映射到 `jp.mengyuan-pi.xyz`

### File Structure
```
/
├── index.html              # Lookbook (router 入口)
├── outfit.html             # Outfit detail 模板
├── essentials.html         # Essentials 页
├── data.json               # 所有内容
├── styles.css              # 样式
├── app.js                  # 路由 + 渲染
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── images/
    ├── outfits/
    ├── essentials/
    └── og/                 # social share 预留
```

## 10. Image Strategy

**v1 方案**：全部使用品牌官网的 lookbook 图片
- 来源：UNIQLO U 官网 lookbook、无印官网、COS 官网
- 保存为本地 `images/` 目录（不 hot link）
- 格式：WebP 为主，JPG 兜底
- 尺寸：原图压到 1200px 宽 · hero 图可保留 1600px
- 命名：语义化（`weekday-01-hero.webp`、`white-oxford.webp`）

**法律/版权考量**：非商业个人站，展示的是单品本身而不是品牌图作为产品售卖，风险可控。首页会有 small print 标注"图片版权归各品牌所有，本站仅用于个人穿搭参考"。

**未来替换路径**：当朋友实际上身后拍照，逐步把 lookbook 图替换成他本人的照片（v2 or v3）。

## 11. Out of Scope for v1

明确不做：
- 账号 / 登录 / 收藏 / 评论
- 搭配原理教程页（避免说教感）
- 单品搜索 / 筛选（15 件东西用不上）
- 季节切换 / 月度更新自动化
- 购买闭环 / 支付
- 多语言（中文主，英文只用于标题点缀）
- Analytics（就一个用户）
- SEO / OG 分享卡（私人性质）

## 12. Success Criteria

网站上线后 1 个月内：
- 朋友至少完整看过一次 Lookbook
- 朋友照着买了 >=5 件 essentials
- 朋友能主动说"我照着哪套穿了"

Non-metric 成功标志：网站让他觉得"挺好看的、不土"，愿意在无聊时打开翻一翻。

## 13. Open Questions

1. **朋友的名字 / 代号**：footer 是否放他的名字？还是用 "To a friend" 这种含蓄写法？（Pi 决定）
2. **朋友是否知道这是给他做的**？还是做完惊喜上线？（影响 footer 文案和 tagline 语气）
3. **是否需要加一个"为什么做这个"的 About 页**？（1 段话介绍，非必需）
4. **购买链接的跳转行为**：新窗口 or 同窗口？（推荐新窗口，留着 Lookbook 上下文）
5. **10 套搭配的具体清单**由谁来定？—— Pi 来选，但需要 Pi 花时间过一遍 UNIQLO/MUJI/COS lookbook。估算内容生产工作量。

## 14. Implementation Phases (preview)

具体 plan 由后续 writing-plans skill 产出，先预览阶段：

- **Phase 0 · 内容生产**：Pi 从品牌官网挑图、定 15 件单品、写 10 套搭配的点评
- **Phase 1 · 静态骨架**：三个页面的 HTML / CSS 搭好，假数据跑通
- **Phase 2 · 数据接入**：真实 `data.json`、路由、图片加载
- **Phase 3 · 细节打磨**：视觉微调、响应式校验、PWA 基础
- **Phase 4 · 部署**：GitHub Pages 上线、手机访问验证
