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


## 技术栈

- Vue 3.4（Composition API，`<script setup>` 语法，纯 JavaScript 非 TypeScript）
- Vite 5（开发服务器 + 构建工具）
- 无额外 UI 框架依赖，样式 100% 来自原文件 CSS
