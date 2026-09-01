# Issue tracker: GitHub

本项目的 Issue、规格与 Wayfinder 决策地图保存在 GitHub。所有操作使用 `gh` CLI，并从当前仓库的 remote 推断目标仓库。

## 基本操作

- 创建：`gh issue create --title "..." --body "..."`
- 读取：`gh issue view <number> --comments`
- 列表：`gh issue list --state open`
- 评论：`gh issue comment <number> --body "..."`
- 标签：`gh issue edit <number> --add-label "..."`
- 关闭：`gh issue close <number> --comment "..."`

GitHub 的 Issue 与 PR 共用编号；遇到不明确的编号时，先尝试 PR，再读取 Issue。

## Pull requests as a request surface

PRs as a request surface: no.

PR 是代码交付与审核界面，不作为外部需求或 triage 请求入口。

## Wayfinding operations

- Map：使用 `wayfinder:map` 标签的 GitHub Issue。
- Child ticket：优先使用 GitHub sub-issue；不可用时，在 Map task list 与子 Issue 的 `Part of` 引用中表达关系。
- Ticket labels：`wayfinder:research`、`wayfinder:prototype`、`wayfinder:grilling`、`wayfinder:task`。
- Blocking：优先使用 GitHub native issue dependencies；不可用时，在 Issue body 中使用 `Blocked by`。
- Frontier：Map 下所有尚未关闭、没有未关闭 blocker、没有 assignee 的子 Issue。
- Claim：开始工作前先执行 `gh issue edit <number> --add-assignee @me`。
- Resolve：先发布 resolution comment，再关闭票据，最后向 Map 的 Decisions so far 添加摘要与链接。

叙述地图和票据时始终使用带链接的标题，不用裸 Issue 编号代替名称。
