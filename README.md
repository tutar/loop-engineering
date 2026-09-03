# Loop Engineering

本仓库维护经过真实项目验证、可整体复制到项目中的版本化 Workflow Definition（工作流定义）。项目复制后自行拥有 Workflow Instance（工作流实例），可以按项目需要修改，不依赖本仓库在线运行。

## 已发布定义

- [`github-development-ticket` v0.1.2](workflow-definitions/github-development-ticket/v0.1.2/README.md)：当前版本；增加中断工作恢复、可调累计预算、Stop hook 收尾、取消处理和交付标签清理。
- [`github-development-ticket` v0.1.1](workflow-definitions/github-development-ticket/v0.1.1/README.md)：增加基于证据的验收条件同步。
- [`github-development-ticket` v0.1.0](workflow-definitions/github-development-ticket/v0.1.0/README.md)：首个已验证版本。

Workflow Definition 是普通文件模板，不是 Reusable Workflow，也不是中央 Runtime。版本号只表示实例最后参考的定义版本。
