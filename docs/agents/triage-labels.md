# Triage labels

| Matt Skill 中的角色 | GitHub 标签 | 含义 |
|---|---|---|
| `needs-triage` | `needs-triage` | 等待维护者判断 |
| `needs-info` | `needs-info` | 等待报告者补充信息 |
| `ready-for-agent` | `ready-for-agent` | 规格完整，可由 AFK Agent 处理 |
| `ready-for-human` | `ready-for-human` | 需要人类执行或实时参与 |
| `wontfix` | `wontfix` | 明确不处理 |

Matt Skills 提到某个 triage role 时，使用表中对应的 GitHub 标签。除下述运行态标签外，当前不增加其他项目自定义标签。

## Operational label

`in-progress` 表示 Loop 已领取并正在处理该 Issue。它不是 Matt triage state role，可以与恰好一个 state role 共存；不得用它替代 `ready-for-agent`、`ready-for-human` 等 triage 状态。
