# vercel-ship

[English](README.md) | [简体中文](README.zh-CN.md)

`vercel-ship` 是一个面向 Codex 风格 agent 的开源 skill bundle，用来把“部署一个项目”的请求转成一条可控、可审查、可验证的发布流程：

- 分析项目或 demo 技术文档
- 推荐合适的 starter 和能力组合
- 生成可审批的方案
- 校验用户对方案的修改
- 将 starter 发布到 GitHub
- 创建 Vercel 项目
- 在需要时自动开通真实的 Vercel 资源
- 验证部署结果

当前第一版内置了 3 个 demo 场景：

- `marketing-site`
- `saas-mvp`
- `upload-app`

## 当前覆盖范围

`vercel-ship` 目前支持：

- 从结构化文档推荐 starter
- 本地生成 starter 并执行构建验证
- 创建 GitHub 仓库并发布文件
- 创建 Vercel 项目
- 为数据库类 demo 真实开通 `Neon`
- 为认证类 demo 真实开通 `Clerk`
- 为上传类 demo 真实开通 `Blob`
- 通过 Vercel share link 验证受保护部署
- 通过运行时健康检查确认资源已注入

## 当前未覆盖范围

- 自定义域名
- monorepo 子项目选择
- 生产数据迁移流程
- 企业级 SSO 和合规流程
- 超出当前 demo 范围的完整应用层 provider 接入

也就是说，资源开通是真实的，但应用层业务接入目前仍然保持最小实现。

## 仓库结构

```text
vercel-ship/
├── SKILL.md
├── README.md
├── README.zh-CN.md
├── LICENSE
├── .env.example
├── agents/
├── assets/
│   ├── demo-docs/
│   └── starters/
├── references/
├── records/
└── scripts/
```

## 如何使用

这个仓库默认就是作为 Codex skill 使用。

典型流程：

1. 把 `vercel-ship` 安装到你的 Codex skills 目录
2. 先准备好需要的 MCP 和凭证
3. 让 agent 使用 `vercel-ship`，并给它项目路径或 demo 文档
4. 审阅它生成的方案
5. 批准方案
6. 让 agent 继续执行 GitHub 和 Vercel 动作

## 运行要求

- Node.js `20+`
- 一个支持本地 skills 的 Codex 环境
- 一个可创建仓库的 GitHub 账号
- 一个可创建项目和集成的 Vercel 账号或团队

## 需要手动准备的前置条件

在你准备让 skill 执行真实云端动作前，需要用户手动准备：

- 配置好 `GitHub MCP`
- 配置好 `Vercel MCP`
- 在 agent 使用的 shell 环境中提供这些环境变量：
  - `GITHUB_TOKEN`
  - `GITHUB_OWNER`
  - `VERCEL_TOKEN`
  - `VERCEL_TEAM_ID`
- 如果你的 Vercel CLI 集成流程需要，也提供：
  - `VERCEL_SCOPE`

仓库里提供了 [.env.example](.env.example) 作为模板，但具体值需要你在本地自行填写。

## 需要哪些 MCP

- `GitHub MCP`
- `Vercel MCP`

当前第一版只依赖这两个 MCP。

## 安装

安装依赖：

```bash
npm install
```

仓库不会提交 `node_modules`。把这个仓库安装或复制到 Codex skills 目录后，就可以直接通过名字触发。

## 用户需要提供什么

最少提供以下任一输入：

- 一个项目路径
- 一个设计文档或 PRD 路径
- 一个位于 `assets/demo-docs` 下的 demo 文档

如果要执行云端动作，用户还需要准备好批准：

- 创建 GitHub 仓库
- 发布代码到 GitHub
- 创建 Vercel 项目
- 在需要时开通 Vercel 资源

## Demo 场景

### marketing-site

- 推荐 starter：`nextjs-marketing-starter`
- 默认能力：可选 `edge-config`

### saas-mvp

- 推荐 starter：`nextjs-saas-starter`
- 默认能力：`neon`、`clerk`，以及可选 `edge-config`

### upload-app

- 推荐 starter：`nextjs-blob-upload-starter`
- 默认能力：`blob`

## 开源说明

这个仓库是按公开发布方式整理的：

- 不提交 secrets
- 不保留生成出来的 `.env.local`
- 不包含 `node_modules`
- 验证记录已做清理，不依赖个人 share URL

正式对外发布前，仍建议你再做一次检查：

- 确认 git 历史里没有凭证
- 如果验证过程中曾在本机外暴露 token，先完成轮换
- 复查云端验证记录，替换任何组织特定名称

## 验证记录

仓库内保留了两份验证记录：

- [records/validation-2026-03-25.md](records/validation-2026-03-25.md)
- [records/cloud-validation-2026-03-25.md](records/cloud-validation-2026-03-25.md)

第一份是本地验证，第二份是真实 GitHub、Vercel、Blob、Neon、Clerk 的云端验证。

## 许可证

MIT，见 [LICENSE](LICENSE)。
