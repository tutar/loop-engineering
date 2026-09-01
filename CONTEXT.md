# Loop Engineering

本上下文定义围绕同一业务目标、由外部证据驱动继续或停止的工作闭环语言，并区分它与单次 Agent 执行及未来跨闭环业务编排的边界。

## Language

**Harness（驾驭系统）**:
在一次受控执行中为 Agent 提供上下文、Skill、工具、权限、安全边界、运行状态与恢复能力的执行环境。
_Avoid_: Loop、业务流程编排器、Runner

**Attempt（尝试）**:
Harness 围绕一个明确 Goal 进行的一次受控执行；在当前 GitHub 场景中，一次新的 Codex Session 是一次 Attempt。
_Avoid_: Tool call、GitHub event、整个 Ticket 生命周期

**Development Ticket（研发票据）**:
由一个 GitHub Issue 定义 Goal、并由其关联 Draft PR 承载当前实现的研发工作；它可以跨多个 Attempt 接收 CI、Review 或显式人工命令的 Evidence，直至通过或交给人。
_Avoid_: 单次 Codex Session、Draft PR、GitHub event

**Implementation Attempt（实现尝试）**:
调用 Matt `implement` Skill 完成实现、自测、Code Review、commit，并由 Codex 创建或复用关联 Draft PR 的 Attempt；PR 缺失时只在同一 Session 提醒一次。
_Avoid_: Development Ticket、CI Repair、整个 PR 生命周期

**Evidence Feedback Loop（证据反馈闭环）**:
围绕同一 Goal，根据外部 Evidence 决定完成、继续、停止或交给人的跨 Attempt 反馈机制。
_Avoid_: 单次 Agent Run、定时任务、任务调度器

**External Evidence（外部证据）**:
独立于执行 Agent 自我判断、可用于决定 Goal 是否满足的可检查结果；具体 Evidence 由场景定义。
_Avoid_: Agent 自报完成、未经核实的总结

**Human Command（人工命令）**:
由对目标仓库拥有 write 或更高权限的人，以任意 open Issue 或 open PR 的新评论首个非空白 token `@codex` 加非空指令的形式发出的明确要求；它受目标对象上下文与 Harness 权限约束，不是完成或失败的 Evidence。
_Avoid_: 普通评论、External Evidence、系统指令

**Command Run（命令运行）**:
Human Command 启动的独立工作；每条命令只启动一个新的 Codex Session，不自动重试，并在正常结束时返回成功、失败或阻塞结果。它不消耗或重置 Development Ticket 的自动事件 Attempt 预算；即使自动闭环已耗尽，人仍可显式发起新的 Command Run。
_Avoid_: Development Ticket、Repair Attempt、无限自主循环

**Repair Attempt（修复尝试）**:
当前 PR revision 出现 required CI failure 或有效的 human `changes_requested` 后，为同一 Development Ticket 启动的新 Codex Session。
_Avoid_: 普通 PR comment、旧 revision 结果、全新 Ticket

**Operational Label（运行态标签）**:
表达 Loop 当前执行占用状态、但不属于 Matt triage state role 的 GitHub 标签；`in-progress` 是当前唯一的运行态标签。
_Avoid_: Triage state、完成证据、业务状态源
