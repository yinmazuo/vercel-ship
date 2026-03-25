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
├── docs/
├── agents/
├── assets/
│   ├── demo-docs/
│   └── starters/
├── references/
├── records/
└── scripts/
```

## 使用方式

这个仓库有两种使用方式：

- `script mode`：直接运行仓库内置的 Node.js 脚本
- `skill mode`：把仓库安装成 Codex skill，让 agent 结合文档、脚本和 MCP 执行

第一次使用建议先看 [docs/getting-started.md](docs/getting-started.md)。

## 运行要求

- Node.js `20+`
- 具备仓库写权限的 GitHub access token
- Vercel access token
- 一个可创建项目和集成的 Vercel team 或个人 scope

## 环境变量

执行云端动作时需要：

- `GITHUB_TOKEN`
- `GITHUB_OWNER` 或 `--owner`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`

可选：

- `VERCEL_SCOPE`

建议直接使用仓库里的模板：

```bash
cp .env.example .env.local
export $(grep -v '^#' .env.local | xargs)
```

这些变量分别用于：

- `GITHUB_TOKEN`：供 `ship_demo_to_cloud.mjs` 创建仓库并提交 starter 文件
- `GITHUB_OWNER`：目标 GitHub 用户或组织
- `VERCEL_TOKEN`：供 Vercel API 和 CLI 动作使用
- `VERCEL_TEAM_ID`：目标 Vercel team id 或个人 scope id
- `VERCEL_SCOPE`：供 Vercel CLI 集成命令使用的 team slug 或 scope 名称

## 需要哪些 MCP

如果你只是直接运行脚本，不需要 MCP。

如果你希望 agent 走完整的“分析 -> 方案 -> 审批 -> GitHub -> Vercel -> 验证”链路，建议配置：

- `GitHub MCP`
- `Vercel MCP`

具体说明见 [docs/mcp-requirements.md](docs/mcp-requirements.md)。

## 安装

安装依赖：

```bash
npm install
```

仓库不会提交 `node_modules`。

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env.local
export $(grep -v '^#' .env.local | xargs)
```

3. 执行本地验证：

```bash
npm run validate:local
```

4. 生成方案：

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/marketing-site.md
```

5. 准备好执行云端动作后，发布 demo starter：

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner "$GITHUB_OWNER" \
  --repo vercel-ship-demo-marketing \
  --project vercel-ship-demo-marketing
```

## 本地使用

根据 demo 文档生成推荐方案：

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/saas-mvp.md
```

生成审批摘要：

```bash
node scripts/render_approval_plan.mjs --plan /tmp/vercel-ship-validation/marketing-site.plan.json
```

执行所有 demo 的本地验证：

```bash
node scripts/run_demo_validation.mjs
```

为一个已存在的 Vercel 项目开通资源：

```bash
node scripts/provision_resources.mjs \
  --project-id <vercel-project-id> \
  --project-name <vercel-project-name> \
  --scope <vercel-scope> \
  --capability neon \
  --capability clerk
```

把一个 demo starter 发布到 GitHub 和 Vercel：

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner <github-owner> \
  --repo <github-repo-name> \
  --project <vercel-project-name>
```

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

## 补充文档

- [docs/getting-started.md](docs/getting-started.md)
- [docs/mcp-requirements.md](docs/mcp-requirements.md)
- [docs/command-reference.md](docs/command-reference.md)
- [docs/troubleshooting.md](docs/troubleshooting.md)
