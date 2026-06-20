# Weekly Work Plan - Team Board (Vue 3 版本)

本项目是从单文件 HTML（`weekly_work_plan_team_board.html`）重构而来的 **Vue 3（非 TypeScript）+ Vite** 工程。
功能、交互、视觉样式与原 HTML 文件保持一致；数据存储方式不变，仍为浏览器 `localStorage` + JSON 导入/导出。

## 目录结构

```
weekly-work-plan-team-board/
├── index.html                     # Vite 入口 HTML
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── main.js                    # Vue 应用挂载入口
    ├── App.vue                    # 主页面（拼装各组件 + 生命周期）
    ├── assets/
    │   └── main.css               # 完整保留原文件全部 CSS（含响应式断点）
    ├── constants/
    │   └── index.js                # TEAMS 团队成员配置 / 状态枚举 / 时间槽等常量
    ├── utils/
    │   ├── date.js                  # 周历计算（buildWorkWeeks / 默认周定位等）
    │   ├── helpers.js               # 通用工具（id生成 / 截断字符串）
    │   └── model.js                 # Work Item / Task 数据模型（创建/归一化/校验/清理）
    ├── composables/
    │   └── useBoardStore.js         # 核心状态管理（对应原 dataStore + state + 全部业务函数）
    └── components/
        ├── AppToolbar.vue           # 顶部工具栏：Team/Year/Week 选择、保存/导入/导出/清空
        ├── BoardTable.vue           # 看板表格 + 拖放（drag & drop）逻辑
        ├── ItemCard.vue             # 单个 Work Item 卡片（含 hover 预览）
        ├── ItemModal.vue            # Work Item 编辑弹窗（含 Tasks 表格）
        ├── TaskRow.vue              # Tasks 表格中的单行（含 AM/PM 10 个半天勾选）
        └── ToastMessage.vue         # 右下角提示条
```

## 功能对照（与原 HTML 完全一致）

- Team / Year / Week 三级联动选择，自动计算每周的周一～周五日期范围
- 看板三态列：Pending / Processing / Done，按成员（Member）分行展示
- Work Item 卡片支持拖拽，可在不同成员、不同状态列之间移动
- 鼠标悬浮卡片可查看任务预览（任务名、描述、10 个半天勾选状态）
- 点击卡片或"编辑"按钮打开编辑弹窗：
  - 编辑 Work Item 基本信息（名称、Expect/Create 日期、Priority）
  - Tasks 表格：可新增/删除 task，每个 task 含 AM/PM × 周一至周五共 10 个半天勾选格
  - "保存并关闭"才会真正提交修改；空白 Work Item / 空 Task 不会被保存
- 顶部工具栏：手动保存、导出 JSON 备份、导入 JSON（含覆盖确认提示）、清空当前周（含确认提示）
- 数据持久化：浏览器 `localStorage`（key: `weekly_work_plan_team_board_v3`，与原版一致）
- 所有 UI 文案、颜色、间距、断点样式 100% 复用原 CSS 文件（包括原文件中 `app-hader-sub` 的拼写"瑕疵"也原样保留，确保样式选择器不失效）

如需修改团队和成员名单，编辑 `src/constants/index.js` 中的 `TEAMS` 对象即可。

## 安装与运行

> 需要 Node.js 18+（推荐 18 / 20 / 22 LTS）和 npm。

```bash
# 1. 解压后进入项目目录
cd weekly-work-plan-team-board

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 4. 构建生产版本（输出到 dist/ 目录，可直接部署到任意静态服务器）
npm run build

# 5. 本地预览生产构建产物
npm run preview
```

## 自检说明（重要，请阅读）

本工程的开发环境（沙箱容器）**网络出口被禁止**（无法访问 npm 仓库 / CDN），因此无法在当前环境中实际执行
`npm install` 并启动 `npm run dev` 做"眼见为实"的浏览器级端到端验证。为尽可能保证交付质量，我采用了以下静态自检手段，并已根据发现的问题做了修复：

1. **逐文件人工逐行比对**：将重构后的每个 `.vue` / `.js` 文件与原 1718 行 HTML 源文件的对应逻辑段落逐一比对（DOM 结构、class 名、id、事件触发顺序、函数调用顺序）。
2. **JS 语法静态检查**：对所有 `.js` 文件及每个 `.vue` 文件的 `<script setup>` 代码块执行 `node --check`，确认无语法错误。
3. **模板结构校验**：用 Python `html.parser` 对每个组件的 `<template>` 块做标签配对检查，确认无未闭合 / 不匹配标签；同时校验所有 `{{ }}` 插值括号配对、CSS 大括号配对。
4. **CSS class 交叉比对**：提取所有模板中使用的静态 class 与动态 `:class` 绑定 key，与 `main.css` 中定义的选择器做集合比对，确认无遗漏样式类。
5. **核心业务逻辑单元测试**：针对日期周历计算（`buildWorkWeeks`、`getDefaultWeekKey`，已用 2026-06-19 实测验证落在 `2026-W25` 周、范围 `2026-06-15~2026-06-19`，与原算法逻辑一致）、年份边界裁剪、Work Item / Task 数据归一化、跨任务去重的 slot 计数、空白条目过滤（`isMeaningfulItem`/`cleanItemForSave`）、深拷贝隔离性、ID 唯一性、文件名时间戳格式等，编写并运行了独立的 Node.js 断言测试，全部通过。
6. **响应式设计审查**：发现并修复了一处真实问题——`getMemberItems` 原实现会在模板渲染期间对 reactive 数据做写入（数据结构初始化），存在触发多余重渲染甚至潜在循环更新的风险；已重构为纯读取，数据结构初始化职责收敛到 `init()` / 状态切换事件处理函数中。
7. **行为一致性修复**：发现并修复了 `addTaskToCurrentItem` 中一处由本人草稿阶段引入的逻辑错误（错误地用当前提示文案反推下一状态），已改为与原版完全一致的行为（新增 task 后立即调用 `saveNow(true)` 并重置提示文案）。
8. 经核对，原始 HTML 源文件中 `scheduleAutoSave`（防抖自动保存）函数本身定义后从未被实际调用——这是原文件中已存在的"死代码"。本次重构忠实保留了这一现象（同样定义但不主动调用），未擅自改变保存时机行为，以确保功能行为与原版严格一致；如需启用真正的输入防抖自动保存，可在 `ItemModal.vue` 的输入事件中改为调用 `scheduleAutoSave` 并告知我进一步调整。

**强烈建议**：拿到工程后，请务必在你本地有网络访问权限的机器上执行一次 `npm install && npm run dev`，在浏览器中实际操作一遍（新增/编辑/删除 Work Item、拖拽、导入导出 JSON、切换 Team/Year/Week）进行最终验收。如发现任何与原版不一致之处，欢迎反馈，我会立即定位修复。

## 技术栈

- Vue 3.4（Composition API，`<script setup>` 语法，纯 JavaScript 非 TypeScript）
- Vite 5（开发服务器 + 构建工具）
- 无额外 UI 框架依赖，样式 100% 来自原文件 CSS
