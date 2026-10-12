# 大白鲨音乐资料库 · 使用说明

一个深色风格的学员资料浏览网站：按 **科目 → 章节 → 资料** 三层分栏浏览，支持 PDF / 图片 / 音频在线查看与播放，顶部可搜索，手机端自动变成逐级跳转。

---

## 一、网站结构

```
大白鲨音乐资料库/
├── index.html          # 网站首页（打开它即可浏览）
├── css/style.css       # 样式
├── js/main.js          # 交互逻辑（一般不用动）
├── data/manifest.js    # ★ 资料清单：加资料改这个文件
├── materials/          # ★ 资料文件夹：把你的文件放进对应科目文件夹
│   ├── 乐理/
│   ├── 视唱练耳/
│   ├── 和声学/
│   ├── Logic 入门/
│   └── FL Studio 入门/
├── logo.png            # Logo 原图
├── logo-small.png      # 顶部 Logo
├── favicon.png         # 浏览器小图标
└── README.md           # 本说明
```

---

## 二、如何添加新资料（三步）

以给「乐理」新增一份 PDF 讲义为例：

**第 1 步**：把文件放进对应文件夹
> 把 `第一章讲义.pdf` 复制到 `materials/乐理/` 目录下

**第 2 步**：打开 `data/manifest.js`，在「乐理」的 chapters 里加一行
```js
{
  name: "乐理",
  chapters: [
    { name: "第一章 音与音高", files: [
      { name: "第一章讲义.pdf", path: "materials/乐理/第一章讲义.pdf", updated: "2026-10-12" }
    ] }
  ]
}
```

**第 3 步**：保存，重新上传部署网站（见第四节），学员刷新即可看到。

### 添加多个文件
在 `files: [ ... ]` 里继续加即可，每个一行，中间用英文逗号隔开：
```js
files: [
  { name: "第一章讲义.pdf", path: "materials/乐理/第一章讲义.pdf", updated: "2026-10-12" },
  { name: "音阶示范.mp3",    path: "materials/乐理/音阶示范.mp3",    updated: "2026-10-12" }
]
```

### 文件类型自动识别（不用写）
| 扩展名 | 显示为 |
|---|---|
| .pdf | PDF 讲义（红色标签） |
| .jpg .jpeg .png .gif .webp | 图片（青色标签） |
| .mp3 .wav .m4a .ogg .flac | 音频（金色标签，列表带播放按钮） |
| 其他 | 文件（灰色标签） |

### 小提示
- 列表会自动按名称拼音排序，不用管顺序
- 章节/科目旁的「资料数量」和「更新时间」自动计算，不用手动填
- 文件夹名称建议与 manifest.js 里的科目名保持一致，方便管理

---

## 三、本地预览

- **最简单**：双击打开 `index.html` 即可在浏览器里浏览
- 想模拟线上环境（可选）：
  ```bash
  cd 大白鲨音乐资料库
  python3 -m http.server 8000
  # 浏览器打开 http://localhost:8000
  ```

---

## 四、部署上线（免费，二选一）

### 方案 A：GitHub Pages（推荐，最省心）
1. 注册/登录 GitHub（github.com），新建一个仓库（Repository）
2. 把「大白鲨音乐资料库」文件夹里的**所有文件**上传到仓库（网页右上角 Add file → Upload files 可直接拖拽）
3. 仓库页面点 **Settings → Pages**，Source 选 `main` 分支，点 Save
4. 等 1~2 分钟，会出现网址 `https://你的用户名.github.io/仓库名/` —— 这就是你的网站地址
5. 以后每次更新资料：网页上替换/新增文件 → 网站自动生效

### 方案 B：Vercel
1. 注册 vercel.com（可用 GitHub 账号登录）
2. 新建项目 → 导入刚才的 GitHub 仓库
3. 框架选 **Other**，直接 Deploy
4. 完成后得到一个 `xxx.vercel.app` 网址

> 两个方案都是免费、公开访问、微信里可以直接打开。
> 以后资料变多变大，免费额度不够时再考虑付费托管。

---

## 五、可自行修改的地方

| 想改什么 | 在哪里改 |
|---|---|
| 页脚「联系方式：待补充」 | `index.html` 页脚部分 |
| 网站标题文字 | `index.html` 顶部 `<title>` |
| 换 Logo | 替换 `logo-small.png` / `favicon.png`（建议方形图片） |
| 「按资料 / 按水平」的建设中提示 | `index.html` 对应区块 |
| 配色 | `css/style.css` 顶部 `:root` 里的颜色变量 |
