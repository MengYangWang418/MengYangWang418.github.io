# MYWang & ZBYin · 我们的故事

一个静态的小站，用来收藏属于我们的日子。

## 页面

1. **首页 `#hero`** —— 黑眼菊花田为背景，展示从 `2023-07-26` 至今我们在一起的天数。
2. **798 艺术馆 `#gallery`** —— 那天在 798 拍下的 4 张照片，每张配一段简短的描述。

页面之间使用 CSS `scroll-snap` + `scroll-behavior: smooth` 实现「丝滑」吸附跳转，
右侧悬浮小圆点 / 键盘上下方向键 / 首页向下箭头 / 底部"回到我们的开始"按钮，
都可以触发同一种平滑过渡。

## 本地预览

任意一种方式：

```bash
# Python 自带
python3 -m http.server 8000

# 或者 Node
npx serve .
```

随后在浏览器打开 <http://localhost:8000>。

## 部署到 GitHub Pages

仓库名为 `MengYangWang418.github.io`，将代码推送到 `main` 分支即可由 GitHub Pages 自动发布到
<https://MengYangWang418.github.io>。

## 文件结构

```
.
├── index.html        # 两个 section：#hero + #gallery
├── style.css         # 全部样式（含响应式）
├── script.js         # 天数计算、滚动吸附、滚入动画
├── assets/           # 图片资源
│   ├── hero_flowers.png
│   ├── 798_couple.png
│   ├── 798_gallery.png
│   ├── 798_mural.png
│   └── 798_deity.png
└── README.md
```

## 自定义

- **修改纪念日**：打开 `script.js`，编辑顶部的 `START_DATE`。
- **替换文案/描述**：直接编辑 `index.html` 中对应的 `<figcaption>`。
- **更换图片**：把新图放进 `assets/` 并替换 `index.html`、`style.css` 里的引用即可。
