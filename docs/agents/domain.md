# Domain docs

本项目采用 single-context 领域文档布局。

## 探索代码前

按当前任务需要读取：

- 根目录 `CONTEXT.md`；
- `docs/adr/` 中与当前工作相关的 ADR。

文件不存在时继续工作；只有在术语或重要决策真正确定后，才通过 Domain Modeling 创建对应文档。

## 文件布局

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

`CONTEXT.md` 只维护领域词汇及相邻概念边界，不保存实现规格。

ADR 只记录同时满足以下条件的决策：

1. 改变成本较高；
2. 缺少背景时结果令人意外；
3. 确实经过了有代价的方案取舍。

## 使用领域语言

Issue、规格、代码、测试和评审使用 `CONTEXT.md` 中的 canonical terms。出现新概念或已有术语冲突时，先通过 Domain Modeling 澄清，不自行制造同义词。

如果方案与已有 ADR 冲突，明确指出冲突并说明为何值得重新打开该决策，不得静默覆盖。
