# 拆拆核心修复分支

本分支基于上游 ChaiChai 提交 `74ec6d01074c7df4a0e635bb59b8fe50e5a27607`，保留 MIT 许可证及上游来源声明。改动落在原引擎的源码读取与原生关系图遍历，不依赖中文工作台界面。

## 修复内容

| 问题                 | 原行为                                                        | 本分支行为                                                                                             |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 清单建立后文件变大   | 读取并合并替换内容后才检查指纹及长度                          | 对已捕获的文件系统大小提前比对；读取时继续用清单中的实际大小约束每块数据，在超出时停止并报告 integrity |
| 节点上限产生悬空边   | max_nodes 为 1 时，可能只返回起点，却保留起点到被省略节点的边 | 先判断能否纳入新节点，再保留对应边；节点限制及截断原因仍可见                                           |
| 输入图的截断状态丢失 | 输入图已截断、局部遍历未超限时，输出可能显示 truncated: false | 保留输入图的截断状态及说明；局部限制导致的停止原因优先保留                                             |

源码读取将“保留文本”和“只校验指纹”统一到同一条受限流式校验路径，删除原先先读取、再单独计算指纹的重复路径。取消信号、无效 UTF-8、原始指纹及清理责任保持原有契约。

提前比对使用文件系统捕获状态，不使用归档头部声明大小：归档声明本身可能已在清单阶段被记录为不一致。用户明确选择 `record-and-continue` 时，仍允许保留这类矛盾证据；实际读取继续与清单捕获的字节数和指纹比对。

相关源码：[JavaScriptArtifactFiles.ts](../src/artifacts/javascript/JavaScriptArtifactFiles.ts)、[nativeInvestigationGraph.ts](../src/domain/native/nativeInvestigationGraph.ts)。

## 文件变化场景对照

场景为：创建 23 字节源码并完成清单扫描，再把该文件扩展到 32 MiB，随后读取源码。两个版本都应以 integrity 失败结束，不能把变化后的内容当成原清单中的文件。以下数字只反映这个拒绝路径，不代表一般分析任务都获得同等加速。

环境：macOS、Apple M1 Pro、arm64、Node.js 24.20.0。每个版本单独启动一个进程，完成首轮及 5 轮重复。计时覆盖临时样本创建、扫描、扩展、读取与清理，不含模块加载；未清空操作系统文件缓存，首轮不等同于物理冷盘测试。

| 指标                         | 上游基线        | 本分支     |
| ---------------------------- | --------------- | ---------- |
| 首轮耗时                     | 77.41 ms        | 13.89 ms   |
| 重复轮耗时中位数             | 40.74 ms        | 3.32 ms    |
| 首轮 CPU 时间                | 112.50 ms       | 27.30 ms   |
| 重复轮 CPU 时间中位数        | 60.71 ms        | 3.58 ms    |
| 每轮源码读取量               | 33,554,432 字节 | 0 字节     |
| 进程峰值 RSS，六轮累计高水位 | 200,544 KiB     | 85,728 KiB |

RSS 包含运行时、导入模块和样本流程，不是单个文件缓冲区的大小。流程不启动分析器子进程，不调用模型；模型 token 消耗不适用，未测其他分析任务或完整助手会话的成本。

复现脚本：[ingestion-drift.mjs](../experiments/analysis-efficiency/ingestion-drift.mjs)。分别准备并构建上游基线和本分支后，给脚本传入各自仓库路径：

```bash
node experiments/analysis-efficiency/ingestion-drift.mjs ../chaichai-upstream
node experiments/analysis-efficiency/ingestion-drift.mjs .
```

## 使用本分支

```bash
git clone --branch codex/core-integrity-fixes https://github.com/Yiheng-guo/chaichai.git chaichai-engine
cd chaichai-engine
HUSKY=0 npm ci
npm run build:cached
node scripts/rea.mjs --help
```

原项目首页的一键安装命令仍指向上游，不会安装本分支修复。中文工作台为独立项目：[拆拆研究台](https://github.com/Yiheng-guo/chaichai-studio)。

## 回归范围

新增用例覆盖：文件变大后在打开前拒绝；超出清单大小的文本、未选择文件和原生附加模块数据流提前停止并销毁；正向和反向节点上限；输入图截断状态保留。

回归涉及 9 个测试文件、83 个用例，包括真实目录和 ASAR 读取、指纹矛盾处理、UTF-8 BOM 来源位置、CLI 源文件选择及实际 MCP 的保留证据流程。原生关系图用例验证提供者中立的遍历语义，不构成 Ghidra、Hopper、IDA 实机反编译验证。未宣称完整的 1015 个测试文件全部运行通过。

可运行的检查入口见 [核心回归工作流](../.github/workflows/core-regressions.yml)。
