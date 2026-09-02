# Loop Engineering

本上下文定义围绕单一业务目标、由 Goal Prompt 驱动持续迭代的工作闭环语言，并区分它与单次 Agent 执行及跨闭环业务编排的边界。

## Language

**Harness（驾驭系统）**:
在一次受控 Agent Turn 中提供上下文、Skill、工具、权限、沙箱、安全边界与运行恢复能力的执行环境。
_Avoid_: Loop Runtime、Graph、Runner

**Agent Turn（智能体轮次）**:
Agent 在 Harness 中完成的一次模型与工具交互；一个 Goal Run 可以跨越多个 Agent Turn。
_Avoid_: Goal Run、整个业务流程

**Loop Engineering（循环工程）**:
通过 Goal、Stop Rules、Iteration Control、State and Memory 以及可选 Trigger，设计一个 Agent 可以高质量、有限且可恢复地持续执行的循环；它复用业务对象与 Skill 已定义的完成语义，不在 Goal Prompt 中复制业务验收标准。
_Avoid_: Harness Engineering、Graph Engineering、中央 Runtime

**Goal Prompt（目标提示）**:
由事件类型选择 Skill、引用业务对象并补充必要运行边界后形成的简洁 Loop 输入；例如“使用 Matt `implement` Skill 完成 Issue #2”。
_Avoid_: Loop Contract、普通单轮指令、Graph Definition

**Acceptance Criteria（验收条件）**:
业务对象中定义高质量完成的可验证条件；Harness 将其提供给 Agent，Skill 负责解释和验证，所选 Skill 的成功终态构成当前 Goal Run 的成功停止信号。
_Avoid_: Goal Prompt 副本、Graph Gate、整个业务流程完成

**Goal Run（目标运行）**:
Loop Runtime 围绕一个 Goal Prompt 跨多个 Agent Turn 持续工作，直至成功、失败、预算耗尽、停滞或需要人工升级；Codex `/goal` 是一种实现。
_Avoid_: Agent Turn、GitHub Workflow、整个 Graph

**Graph Engineering（图工程）**:
定义多个 Goal Run、Verifier、Human Gate 与业务节点之间的拓扑、转移和整体完成判断；CI 或 Review Gate 失败后启动新的 Repair Goal Run 属于这一层。
_Avoid_: Loop Engineering、Harness Engineering、LangGraph 特定实现

**Development Ticket（研发票据）**:
携带指定标签、并至少给出业务目标与 Acceptance Criteria 的 GitHub Issue；Harness 向 `implement` Skill 提供它，Skill 成功结束即表示首个 Development Goal Run 完成。
_Avoid_: Goal Run、Draft PR、完整 CI/Review Graph

**Human Command（人工命令）**:
由对目标仓库拥有 write 或更高权限的人，以任意 open Issue 或 open PR 的新评论首个非空白 token `@codex` 加非空指令的形式发出的明确要求；事件路由用它与目标对象上下文形成 Goal Prompt。
_Avoid_: 普通评论、Graph Gate、系统指令

**Command Run（命令运行）**:
Human Command 启动的独立 Goal Run；每条命令不自动重试，并在正常结束时返回成功、失败或阻塞结果。
_Avoid_: Development Ticket、Graph transition、无限自主循环

**Operational Label（运行态标签）**:
表达 Loop 当前执行占用状态、但不属于 Matt triage state role 的 GitHub 标签；`in-progress` 是当前唯一的运行态标签。
_Avoid_: Triage state、完成证据、业务状态源

**Workflow Definition（工作流定义）**:
`loop-engineering` 为一种业务闭环维护的、带来源版本且可整体复制的普通文件集合；未经真实 Consumer Project 验证时是 Candidate Definition，发布后仍不构成项目的运行时依赖。
_Avoid_: Reusable Workflow、中央 Runtime、通用 DSL

**Workflow Instance（工作流实例）**:
Consumer Project 从某个 Workflow Definition 版本复制并自行拥有的可运行工作流；项目可以自由修改，记录的来源版本只表示最后参考的定义版本，不保证文件仍完全一致。
_Avoid_: 中央托管实例、只读副本、远程调用
