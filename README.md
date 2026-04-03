# 🧠 hello-claudecode

> **Claude Code 源码深度学习教程** — 25课结构化课程，系统拆解 Claude Code 架构与工程实践

[![在线访问](https://img.shields.io/badge/在线访问-GitHub%20Pages-blue?style=flat-square)](https://keejo125.github.io/hello-claudecode/)
[![GitHub](https://img.shields.io/badge/GitHub-keejo125%2Fhello--claudecode-black?style=flat-square&logo=github)](https://github.com/keejo125/hello-claudecode)

---

## 📖 项目简介

本教程面向有一定前端 / Node.js 基础的开发者，通过深入分析 Claude Code 完整源码，系统讲解大型 AI 编码助手的架构设计、关键实现与工程实践。

课程不止于"看懂代码"，更注重提炼背后的设计决策与工程思维，帮助你在自己的项目中复用这些经过生产验证的模式。

🌐 **在线访问**：[https://keejo125.github.io/hello-claudecode/](https://keejo125.github.io/hello-claudecode/)

---

## 🛠️ 技术栈概览

Claude Code 使用以下核心技术构建：

| 技术 | 用途 |
|------|------|
| **Bun** | 运行时与包管理 |
| **TypeScript**（strict 模式） | 全量类型安全 |
| **React / Ink** | 终端 UI 渲染（专为 CLI 设计） |
| **Commander.js** | CLI 命令解析 |
| **Zod v4** | 运行时 Schema 校验 |
| **Anthropic SDK** | 模型 API 调用 |
| **MCP / LSP** | 协议支持与 IDE 集成 |
| **OpenTelemetry** | 可观测性与遥测 |

---

## 📚 课程体系

### 基础篇（第 01–18 课）— 按模块纵切源码

| 课次 | 课程名称 | 核心内容 |
|------|----------|----------|
| 第 01 课 | 全景架构解析 | 系统整体架构分层、核心模块职责与交互关系、技术选型决策 |
| 第 02 课 | 启动流程与初始化 | 应用启动完整生命周期、并行预取优化、特性标志系统 |
| 第 03 课 | 权限系统 | 多层权限决策链、权限模式设计、危险模式检测机制 |
| 第 04 课 | 命令系统 | 命令类型、注册发现、斜杠指令解析执行全流程 |
| 第 05 课 | 工具系统架构 | Tool 接口设计、工具装配流程、权限集成机制 |
| 第 06 课 | Shell 执行工具 | BashTool 安全执行模型、命令验证、结果处理 |
| 第 07 课 | 文件操作工具 | 文件读写编辑工具设计、路径安全检查、大文件处理策略 |
| 第 08 课 | QueryEngine | AI 对话消息循环、工具调用编排、成本追踪机制 |
| 第 09 课 | 智能代理工具 | AgentTool Fork 机制、代理间通信、内存管理 |
| 第 10 课 | 技能系统 | 技能定义、多源加载、执行隔离、自动生成机制 |
| 第 11 课 | 状态管理系统 | AppState 复杂结构、React 集成模式、持久化策略 |
| 第 12 课 | React + Ink 终端 UI | 终端环境 React 渲染机制、组件库设计、性能优化 |
| 第 13 课 | 主题与快捷键 | 可定制主题架构、快捷键绑定与冲突解决 |
| 第 14 课 | 启动性能优化 | 延迟预取、记忆化缓存、并发调度、关键路径识别 |
| 第 15 课 | 内存管理与诊断 | 堆转储诊断、Perfetto 追踪、遥测导出、性能基准 |
| 第 16 课 | 插件系统 | 插件类型、加载流程、API 设计、沙箱隔离机制 |
| 第 17 课 | 服务层集成 | API 客户端设计、MCP 协议、LSP 集成、OAuth 认证流程 |
| 第 18 课 | IDE 桥接与部署运维 | IDE 桥接层设计、远程模式、自动更新、配置管理 |

---

### 专题篇（第 19–25 课）— 按能力维度横切

| 课次 | 课程名称 | 核心内容 |
|------|----------|----------|
| 第 19 课 | 上下文管理与模型路由 | 上下文窗口管理策略、多模型路由决策、Token 预算控制 |
| 第 20 课 | 复杂工程理解与资产提取 | 大型代码库理解方法、依赖图分析、关键资产自动提取 |
| 第 21 课 | 自主记忆与个性化 | 跨会话记忆机制、用户偏好学习、个性化响应策略 |
| 第 22 课 | 长程任务与多智能体协作 | 长任务分解执行、多 Agent 编排协作、任务恢复机制 |
| 第 23 课 | 工具能力扩展 | 自定义工具开发、MCP 工具集成、工具链组合模式 |
| 第 24 课 | CLI-first 与开放集成架构 | CLI 优先设计哲学、开放 API 接口设计、第三方集成模式 |
| 第 25 课 | Harness Engineering 综合篇 | 完整工程思维总结、最佳实践提炼、生产级应用构建 |

---

## 📐 每课内容结构

每课讲义均按以下结构组织，确保学习效果：

```
1. 核心概念          — 本课涉及的关键术语与背景知识
2. 架构设计          — Mermaid 流程图 / 架构图，直观呈现系统结构
3. 关键源码深度走查  — 逐段分析核心代码，含设计点评与思考
4. Harness Engineering — 如何将这些模式应用到自己的工程中
5. 思考题            — 带参考答案的深度问题，巩固理解
```

---

## 📁 目录结构

```
claudecode-tutorial/
├── README.md          # 项目总目录（本文件）
├── README.md.bak      # 原始 README 备份
├── markdown/          # 各课 Markdown 讲义（25 课）
└── site/              # 静态网站文件（可离线访问）
    └── index.html     # 网站入口
```

---

## 🚀 本地使用

无需安装任何依赖，直接用浏览器打开即可：

```bash
# 克隆仓库
git clone https://github.com/keejo125/hello-claudecode.git

# 打开网站入口（离线可用）
open claudecode-tutorial/site/index.html
```

> 💡 所有讲义已打包为静态网站，**无需联网**，完全离线可用。

---

## 📜 License

MIT
