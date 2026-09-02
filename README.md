# Loop Engineering

本仓库维护经过真实项目验证、可整体复制到项目中的版本化 Workflow Definition（工作流定义）。项目复制后自行拥有 Workflow Instance（工作流实例），可以按项目需要修改，不依赖本仓库在线运行。

## 已发布定义

- [`github-development-ticket` v0.1.0](workflow-definitions/github-development-ticket/v0.1.0/README.md)：由同时带 `ready-for-agent` 与 `development-ticket` 标签的 GitHub Issue 启动 Codex Goal，使用 Matt `$implement` Skill 完成开发、自测、提交、推送和 Draft PR。

Workflow Definition 是普通文件模板，不是 Reusable Workflow，也不是中央 Runtime。版本号只表示实例最后参考的定义版本。
