# 拆拆 ChaiChai

**让 AI 助手帮你"拆开"任何软件，看懂它是怎么运作的。**

你平时用的 App、网页、小游戏，都像一台封好的机器。拆拆是一套工具箱，交给 Codex、Claude Code、Cursor 这类 AI 助手以后，AI 就能自己打开这台机器，一步步查看里面的代码和行为，再用大白话告诉你：

- 这个按钮按下去，背后到底算了什么？
- 这个网页加载时，偷偷连了哪些地址？
- 这个安卓 App 申请了哪些权限、里面有哪些页面？
- 我能不能照着它的规则，自己做一个类似的功能？

AI 给出的每个结论都附带**证据**（在哪个文件、哪一行看到的），并且会分清哪些是"看到的事实"、哪些是"推测"、哪些"还不知道"。

---

## 一、安装（苹果电脑，3 分钟）

**适用电脑：** Apple 芯片（M1、M2、M3、M4 等）的 Mac，系统 macOS 11 或更新。不支持 Intel 芯片的 Mac。

> 不知道自己是哪种芯片？点屏幕左上角的苹果图标 → 「关于本机」，看「芯片」那一栏：写着 Apple M 开头的就可以。

> 除此之外，不需要提前装任何东西，也不需要管理员密码。电脑上以前装过什么、装错过什么，都没关系：拆拆用的是自己的专用环境，不会去碰它们。

**第 1 步：打开「终端」**

按 `Command + 空格`，输入"终端"两个字，按回车。会出现一个黑色或白色的文字窗口。

**第 2 步：复制下面这一整行，粘贴到终端里，按回车**

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hubooooooo/chaichai@main/install.sh | bash
```

如果上面这行报错（比如"连接超时"），换这一行再试：

```bash
curl -fsSL https://raw.githubusercontent.com/hubooooooo/chaichai/main/install.sh | bash
```

如果两行都不行，请老师把 `install.sh` 文件直接发给你，保存到「下载」文件夹，然后运行：`bash ~/Downloads/install.sh`

**第 3 步：等它自己跑完**

安装程序会显示 5 个步骤。中间如果问你"是否继续？"，直接按回车就行。看到 **🎉 安装完成！** 就成功了。

**第 4 步：重启**

- 关掉终端窗口，重新打开一个。
- 把你的 AI 工具（比如 Codex）**完全退出**再打开。

## 二、开始使用

在你的 AI 工具里，用平常说话的方式提要求就行，比如：

- 「用拆拆帮我看看 `/System/Applications/Calculator.app` 是什么，它里面有哪些部分？」
- 「用拆拆分析一下这个文件夹里的网页代码，告诉我点击"提交"按钮后发生了什么。」
- 「用拆拆检查这个安卓安装包 `~/Downloads/xxx.apk`，列出它申请的权限。」

AI 会自己调用拆拆的工具，你只需要看它的回答。

## 三、常用命令

在终端里输入：

| 命令              | 作用                                         |
| ----------------- | -------------------------------------------- |
| `chaichai doctor` | 检查拆拆是否正常                             |
| `chaichai update` | 更新到最新版（也可以重新运行安装命令）       |
| `chaichai setup`  | 重新把拆拆接入 AI 工具（新装了 AI 工具后用） |

**遇到问题？** 先把安装命令重新运行一次，大部分问题都能自动修好。还不行的话，把 `~/.chaichai/install.log` 这个文件发给老师。

## 四、能拆什么？要额外装软件吗？

大多数情况**不需要**额外装软件：

| 想拆的东西                                                   | 需要额外安装                                |
| ------------------------------------------------------------ | ------------------------------------------- |
| 网页代码、Electron 桌面应用（很多聊天/笔记软件就是用它做的） | 不需要                                      |
| .NET 程序、Go 语言程序、Flutter 做的手机 App                 | 不需要                                      |
| 苹果安装包、App 里的图片和配置文件                           | 不需要                                      |
| 正在打开的网站                                               | Chrome 浏览器                               |
| 安卓 App 的代码（.apk）                                      | JADX 和 Java                                |
| 电脑上装的软件的底层代码（.app / .exe）                      | Ghidra、Hopper 或 IDA 三选一（Ghidra 免费） |

需要额外软件的部分，具体装法见 [安装与设置](docs/installation.md#supported-agents)。全部工具清单见 [工具目录](docs/mcp-contracts.md#generated-catalog)。

## 五、卸载

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hubooooooo/chaichai@main/uninstall.sh | bash
```

卸载会把拆拆从 AI 工具里移除，并删除 `~/.chaichai` 文件夹。你的其他软件和 AI 工具的其他设置都不受影响。

## 六、请合法使用

只分析你自己的软件，或者你有权分析的软件。不要用它破解收费软件、绕过版权保护，或者获取别人的隐私数据。详见 [免责声明](DISCLAIMER.md)。

AI 工具弹出"是否允许运行某个工具"的提示时，**先看清楚再点允许**。拆拆有少数工具会真的动手，比如运行程序、给连着的手机安装或卸载 App，这类工具 AI 工具一般会单独询问你。

---

## 给开发者

拆拆是一个本地运行的命令行工具和 MCP 服务器，用 TypeScript 编写，需要 Node.js 22.19+ / 24.11+ / 26+。

```bash
npm ci                     # 安装依赖
npm run build:cached       # 构建
npm run check:fast         # 类型检查 + 代码规范
npm run test:fast          # 快速测试
npm test                   # 完整测试（约 15 分钟）
node scripts/rea.mjs --help
```

- 架构说明：[docs/architecture.mermaid](docs/architecture.mermaid)
- 开发约定：[CONTRIBUTING.md](CONTRIBUTING.md)、[AGENTS.md](AGENTS.md)
- 测试说明：[docs/testing.md](docs/testing.md)
- 发布新版本（给老师/维护者）：[docs/teacher-guide.md](docs/teacher-guide.md)
- 文档总目录：[docs/index.md](docs/index.md)

## 许可证

本项目以 MIT 许可证开源，详见 [LICENSE](LICENSE)。用到的第三方组件及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [licenses/](licenses/)。
