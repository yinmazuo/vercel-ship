# vercel-ship

[English](README.md) | [简体中文](README.zh-CN.md)

`vercel-ship` 是一个用于 Codex 的交付型 skill，用来根据项目代码或需求文档自动生成包含 starter、能力集与云服务产品选型的完整 GitHub + Vercel 发布方案。

它让 agent 在理解项目代码或需求文档后，先生成一份可审阅的 GitHub + Vercel 发布方案，再在用户批准后继续执行真实发布动作。

## 适用场景

适合以下需求：

- 需要 agent 先给出默认发布方案，而不是直接改云资源
- 需要根据项目代码、设计文档或 demo 文档推荐合适的 starter
- 需要在 GitHub + Vercel 上完成 demo / MVP 级别的最小发布闭环
- 需要明确审批边界，先审方案，再执行外部变更

当前第一版内置 3 个 demo 场景：

- `marketing-site`
- `saas-mvp`
- `upload-app`

## Skill 能做什么

当前版本支持：

- 从结构化文档中推断场景并生成推荐方案
- 推荐 starter 与 capability 组合
- 输出可审批的发布计划
- 校验用户修改后的计划是否仍然成立
- 在批准后创建 GitHub 仓库并发布 starter
- 在批准后创建 Vercel 项目
- 在需要时真实开通 `Neon`、`Clerk`、`Blob`
- 对部署结果做受保护访问验证和运行时检查

当前版本不覆盖：

- 自定义域名自动化
- monorepo 子项目选择
- 生产数据库迁移
- 企业级 SSO / 合规流程
- 超出当前 demo 范围的大规模应用层接线

资源开通是真实的，但应用层集成仍然保持最小实现。

## 如何使用这个 Skill

这个仓库的标准使用方式是“安装为 skill，然后让 agent 按 skill 工作流执行”。

典型流程：

1. 把 `vercel-ship` 安装或复制到本地 Codex skills 目录。
2. 安装依赖：

```bash
npm install
```

3. 配置 `GitHub MCP` 与 `Vercel MCP`。
4. 在 agent 使用的 shell 环境中准备好所需环境变量。
5. 让 agent 显式使用 `vercel-ship`，并提供：
   - 一个项目路径，或
   - 一个设计文档 / PRD 路径，或
   - `assets/demo-docs` 下的 demo 文档
6. 审阅 agent 生成的推荐方案与审批计划。
7. 只有在你批准后，skill 才继续执行 GitHub / Vercel 变更。

更符合这个 skill 定位的使用方式，是直接给 agent 下达类似请求：

- “使用 `vercel-ship`，基于这个 PRD 生成推荐发布方案”
- “使用 `vercel-ship`，先给我一份可审批的 GitHub + Vercel 发布计划”
- “使用 `vercel-ship`，评估这个项目适合哪个 starter 和 capability 组合”

## MCP 与环境准备

当前第一版依赖两个 MCP：

- `GitHub MCP`
- `Vercel MCP`

建议先参考官方资料完成接入：

- GitHub MCP Server: https://github.com/github/github-mcp-server
- GitHub Personal Access Token 文档: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Vercel MCP: https://vercel.com/docs/ai-tooling/vercel-mcp
- MCP 概览: https://vercel.com/docs/mcp

除了 MCP，还需要在 agent 的 shell 环境中提供这些变量：

| 变量 | 是否必需 | 用途 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 是 | GitHub 认证与仓库操作 |
| `GITHUB_OWNER` | 是 | 目标 GitHub 用户名或组织名 |
| `VERCEL_TOKEN` | 是 | Vercel 认证与项目操作 |
| `VERCEL_TEAM_ID` | 是 | Vercel API 使用的团队或个人 scope id |
| `VERCEL_SCOPE` | 资源开通时需要 | 供 Vercel CLI 集成安装流程使用 |

模板见 [.env.example](.env.example)。

相关文档：

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Managing environment variables: https://vercel.com/docs/environment-variables/managing-environment-variables
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Edge Config: https://vercel.com/docs/edge-config/get-started
- Neon on Vercel Marketplace: https://vercel.com/marketplace/neon
- Clerk on Vercel Marketplace: https://vercel.com/marketplace/clerk

## Skill 工作流

`vercel-ship` 的工作流是：

1. 收集输入项目或文档。
2. 生成默认推荐方案。
3. 解释推荐的 starter、capabilities、理由和假设。
4. 输出可审批的计划文档。
5. 如果用户修改了计划，先校验修改是否合法。
6. 在本地完成 starter materialization 与构建验证。
7. 只有在审批通过后，才执行 GitHub / Vercel 变更。
8. 如果启用了真实资源，再执行资源开通和部署验证。

这个审批边界很重要：

- 批准前：只读分析、计划生成、计划校验、本地 starter 验证
- 批准后：创建仓库、推送代码、创建 Vercel 项目、配置资源与环境变量、触发部署

## Demo 场景

| 场景 | 推荐 starter | 默认能力 | 说明 |
| --- | --- | --- | --- |
| `marketing-site` | `nextjs-marketing-starter` | 可选 `edge-config` | 内容型 / 落地页 / 品牌站 |
| `saas-mvp` | `nextjs-saas-starter` | `clerk`、`neon`，可选 `edge-config` | dashboard 风格 SaaS MVP |
| `upload-app` | `nextjs-blob-upload-starter` | `blob`，按需 `clerk` | 上传 / 图库 / 媒体 demo |

当前公开 demo：

| Demo | 公开地址 | 当前接入状态 |
| --- | --- | --- |
| Marketing | https://vercel-ship-demo-marketing.vercel.app | 落地页 starter 已上线；当前使用 fallback 内容配置，未接入独立 `Edge Config` |
| SaaS | https://vercel-ship-demo-saas.vercel.app | 已接通 `Clerk`、`Neon`、`Edge Config`，可展示认证壳、数据库检查与 feature flags |
| Upload | https://vercel-ship-demo-upload.vercel.app | 已接通 `Blob`，公开文件列表与上传接口可用 |

当前 demo 对应仓库：

- Marketing: https://github.com/yinmazuo/vercel-ship-demo-marketing
- SaaS: https://github.com/yinmazuo/vercel-ship-demo-saas
- Upload: https://github.com/yinmazuo/vercel-ship-demo-upload

对应参考资料：

- [references/demo-scenarios.md](references/demo-scenarios.md)
- [references/starter-catalog.md](references/starter-catalog.md)
- [references/decision-matrix.md](references/decision-matrix.md)
- [references/validation-rules.md](references/validation-rules.md)

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

建议阅读顺序：

1. [SKILL.md](SKILL.md)
2. [references/demo-scenarios.md](references/demo-scenarios.md)
3. [references/starter-catalog.md](references/starter-catalog.md)
4. [references/decision-matrix.md](references/decision-matrix.md)
5. [references/validation-rules.md](references/validation-rules.md)

## 关于 `scripts/`

`scripts/` 目录里的脚本主要服务于这个 skill 的实现、验证和维护。

在这个仓库里，它们主要用于：

- 生成推荐计划
- 渲染审批计划
- 校验计划
- materialize starter
- 执行本地验证
- 执行云端 demo 验证

如果你在维护这个 skill，或需要做本地验证与调试，再去看 `scripts/` 会更合适。

## 验证记录

仓库内保留了两份验证记录：

- [records/validation-2026-03-25.md](records/validation-2026-03-25.md)
- [records/cloud-validation-2026-03-25.md](records/cloud-validation-2026-03-25.md)

前者覆盖本地验证，后者覆盖真实 GitHub、Vercel、Blob、Neon、Clerk 的云端验证。

## 开源说明

这个仓库按公开发布方式整理：

- 不提交 secrets
- 不保留生成出来的 `.env.local`
- 不包含 `node_modules`
- 验证记录已清理，不依赖个人 share URL

正式对外发布前，仍建议再检查：

- Git 历史里没有凭证
- 如果验证过程中曾在本机外暴露 token，先完成轮换
- 云端验证记录中没有组织特定名称或敏感链接

## 许可证

MIT，见 [LICENSE](LICENSE)。
