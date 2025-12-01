# 🌊 FlowSol - Solana Payment Streaming Platform

<div align="center">

![Solana](https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)

**实时流式支付协议 | Real-time Payment Streaming Protocol**

[English](#english) | [中文](#chinese)

</div>

---

<a name="chinese"></a>

## 📖 项目简介

FlowSol 是一个基于 Solana 区块链的去中心化实时支付流平台。它允许用户创建按时间计费的连续支付流，接收者可以随时提取已累积的资金，无需等待传统的支付周期。

### 🎯 核心特性

- **⏱️ 实时流式支付** - 按秒计费，资金持续流动
- **💰 随时提取** - 接收者可以随时提取已累积的资金
- **🔒 安全可靠** - 使用 Solana PDA 确保资金安全
- **⚡ 高效节能** - 惰性计算算法，节省链上资源
- **🎨 现代 UI** - 响应式设计，支持主流 Solana 钱包

### 🌟 应用场景

- **💼 工资发放** - 实时工资流，员工随时提取
- **🎓 订阅服务** - 按使用时长付费
- **💸 分期付款** - 自动化的分期支付流
- **🤝 咨询服务** - 按小时实时付费
- **🎮 游戏奖励** - 游戏时间奖励流

---

## 🏗️ 技术架构

### 智能合约层
- **语言**: Rust
- **框架**: Anchor 0.29.0
- **特性**:
  - 惰性计算 (Lazy Evaluation)
  - PDA (Program Derived Address)
  - SPL Token 集成
  - 全面的错误处理

### 前端层
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **钱包**: Solana Wallet Adapter
- **区块链交互**: Anchor Client

---

## 📁 项目结构

```
flowsol-demo/
├── programs/
│   └── flowsol/
│       ├── src/
│       │   └── lib.rs              # 智能合约主文件
│       └── Cargo.toml              # Rust 依赖配置
│
├── app/                             # Next.js 前端应用
│   ├── components/                  # React 组件
│   │   ├── WalletContextProvider.tsx   # 钱包上下文
│   │   ├── WalletConnect.tsx          # 钱包连接组件
│   │   ├── CreateStreamForm.tsx       # 创建流支付表单
│   │   └── StreamList.tsx             # 流支付列表
│   │
│   ├── hooks/                       # 自定义 Hooks
│   │   └── useProgram.ts            # 程序交互 Hook
│   │
│   ├── lib/                         # 工具库
│   │   └── idl.ts                   # 合约 IDL 定义
│   │
│   ├── layout.tsx                   # 根布局
│   ├── page.tsx                     # 主页面
│   ├── globals.css                  # 全局样式
│   ├── package.json                 # Node 依赖
│   └── tsconfig.json                # TS 配置
│
├── tests/
│   └── flowsol.ts                   # 合约测试
│
├── Anchor.toml                      # Anchor 配置
├── Cargo.toml                       # Workspace 配置
├── .gitignore                       # Git 忽略文件
└── README.md                        # 项目文档
```

---

## 🚀 快速开始

### 前置要求

确保你已安装以下工具：

```bash
# Node.js 18 或更高版本
node --version

# Rust 和 Cargo
rustc --version

# Solana CLI
solana --version

# Anchor CLI
anchor --version
```

如果未安装，请参考：
- [Node.js 安装](https://nodejs.org/)
- [Rust 安装](https://www.rust-lang.org/tools/install)
- [Solana 安装](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor 安装](https://www.anchor-lang.com/docs/installation)

### 📦 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/flowsol-demo.git
cd flowsol-demo
```

#### 2. 安装前端依赖

```bash
cd app
npm install
```

#### 3. 配置 Solana 环境

```bash
# 设置为 Devnet
solana config set --url devnet

# 创建新钱包（如果没有）
solana-keygen new

# 获取测试 SOL
solana airdrop 2
```

#### 4. 构建智能合约

```bash
cd ..  # 回到项目根目录
anchor build
```

#### 5. 运行测试（可选）

```bash
anchor test
```

#### 6. 部署合约到 Devnet

```bash
anchor deploy --provider.cluster devnet
```

**重要**: 部署后，复制输出的 Program ID，并更新以下文件：
- `app/lib/idl.ts` 中的 `PROGRAM_ID`
- `Anchor.toml` 中的 program ID

#### 7. 启动前端

```bash
cd app
npm run dev
```

访问 http://localhost:3000

---

## 💻 使用指南

### 1️⃣ 连接钱包

<img src="docs/images/wallet-connect.png" alt="连接钱包" width="600">

- 点击页面顶部的 "Select Wallet" 按钮
- 选择你的钱包（推荐 Phantom 或 Solflare）
- 批准连接请求
- 确保钱包已连接到 **Solana Devnet**

### 2️⃣ 创建流支付

<img src="docs/images/create-stream.png" alt="创建流支付" width="600">

填写以下信息：

- **接收者地址** (Receiver Address): 接收者的 Solana 公钥
- **流速率** (Rate): 每秒流动的代币数量（例如：0.001）
- **总金额** (Total Amount): 存入流的总代币数量（例如：100）

点击 "Create Stream" 并确认交易。

**示例**：
```
接收者: 7xKX...abc
流速率: 0.001 tokens/秒
总金额: 100 tokens
→ 流将持续 100,000 秒（约 27.7 小时）
```

### 3️⃣ 查看流支付

<img src="docs/images/stream-list.png" alt="流支付列表" width="600">

在右侧面板可以看到：
- 所有与你相关的流支付
- 实时更新的可提取金额
- 流的状态（活跃/已关闭）
- 进度条显示已流动的比例

### 4️⃣ 提取资金

作为**接收者**：
- 查看 "Claimable" 显示的可提取金额
- 点击 "Withdraw" 按钮
- 确认交易
- 资金将转入你的钱包

### 5️⃣ 关闭流支付

作为**发送者**：
- 找到你创建的流
- 点击 "Close Stream" 按钮
- 确认操作
- 系统会：
  1. 将已累积的资金转给接收者
  2. 将剩余资金退还给你

---

## 🔧 智能合约详解

### 核心数据结构

```rust
pub struct StreamAccount {
    pub sender: Pubkey,          // 发送者地址
    pub receiver: Pubkey,        // 接收者地址
    pub rate_per_second: u64,    // 每秒流速
    pub start_time: i64,         // 开始时间
    pub last_withdrawal: i64,    // 上次提取时间
    pub total_deposited: u64,    // 总存入金额
    pub total_withdrawn: u64,    // 总已提取金额
    pub is_active: bool,         // 是否活跃
}
```

### 主要指令

#### 1. create_stream - 创建流支付

```rust
pub fn create_stream(
    ctx: Context<CreateStream>,
    rate_per_second: u64,
    amount: u64,
) -> Result<()>
```

**功能**：
- 初始化流支付账户
- 从发送者转移代币到流账户
- 记录开始时间和参数

**账户**：
- `stream`: 流账户 (PDA)
- `sender`: 发送者（签名者）
- `receiver`: 接收者地址
- `sender_token_account`: 发送者代币账户
- `stream_token_account`: 流代币账户 (PDA)

#### 2. withdraw - 提取资金

```rust
pub fn withdraw(ctx: Context<Withdraw>) -> Result<()>
```

**功能**：
- 计算可提取金额（惰性计算）
- 转移代币到接收者账户
- 更新提取记录

**计算公式**：
```
时间差 = 当前时间 - 上次提取时间
可提取 = min(流速率 × 时间差, 剩余金额)
```

**安全检查**：
- 只有接收者可以提取
- 流必须处于活跃状态
- 必须有可提取金额

#### 3. close_stream - 关闭流支付

```rust
pub fn close_stream(ctx: Context<CloseStream>) -> Result<()>
```

**功能**：
- 计算并转移已累积资金给接收者
- 退还剩余金额给发送者
- 标记流为非活跃状态

**安全检查**：
- 只有发送者可以关闭
- 流必须处于活跃状态

### 惰性计算优势

传统方式 vs FlowSol：

| 方式 | 链上写入 | Gas 费用 | 实时性 |
|------|----------|----------|--------|
| 传统定时更新 | 每秒一次 | 极高 | 受限于区块时间 |
| **FlowSol 惰性计算** | 仅在交互时 | **极低** | **实时** |

---

## 🧪 测试

### 运行单元测试

```bash
anchor test
```

### 测试覆盖

- ✅ 创建流支付
- ✅ 接收者提取资金
- ✅ 发送者关闭流
- ✅ 错误处理（未授权操作、非活跃流等）

### 测试示例

```typescript
it("Creates a payment stream", async () => {
  const tx = await program.methods
    .createStream(RATE_PER_SECOND, DEPOSIT_AMOUNT)
    .accounts({...})
    .rpc();

  const stream = await program.account.streamAccount.fetch(streamPda);
  assert.equal(stream.isActive, true);
});
```

---

## 📝 前端开发

### 核心 Hooks

#### useProgram

自定义 Hook，用于获取 Anchor Program 实例：

```typescript
const program = useProgram();

// 使用 program 调用合约方法
await program.methods
  .createStream(rate, amount)
  .accounts({...})
  .rpc();
```

### 组件说明

#### WalletContextProvider
- 提供全局钱包上下文
- 配置 Solana 网络（Devnet/Mainnet）
- 集成多种钱包适配器

#### CreateStreamForm
- 表单验证
- PDA 推导
- 交易构建和发送
- 错误处理

#### StreamList
- 获取用户相关的流
- 实时显示可提取金额
- 提供提取和关闭操作

---

## 🔐 安全考虑

### 智能合约安全

1. **PDA 验证**: 所有账户使用 seeds 验证，防止账户替换攻击
2. **权限检查**: 每个操作都验证调用者身份
3. **溢出保护**: 使用安全的数学运算
4. **重入保护**: Anchor 框架内置保护

### 前端安全

1. **输入验证**: 所有用户输入都进行验证
2. **公钥验证**: 确保接收者地址有效
3. **交易确认**: 用户必须确认所有交易
4. **错误处理**: 友好的错误提示

---

## 🛣️ 路线图

### V1.0（当前版本）
- ✅ 基础流支付功能
- ✅ 提取和关闭操作
- ✅ 前端 UI
- ✅ 单元测试

### V1.1（计划中）
- [ ] 多代币支持
- [ ] 批量创建流
- [ ] 流支付历史记录
- [ ] 通知系统

### V2.0（未来）
- [ ] 条件触发流（基于预言机）
- [ ] 流的暂停/恢复
- [ ] NFT 门控流
- [ ] 移动端应用

---

## 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 联系方式

- **项目主页**: [https://github.com/yourusername/flowsol-demo](https://github.com/yourusername/flowsol-demo)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/flowsol-demo/issues)
- **讨论区**: [GitHub Discussions](https://github.com/yourusername/flowsol-demo/discussions)

---

## 🙏 致谢

- [Solana](https://solana.com/) - 高性能区块链平台
- [Anchor](https://www.anchor-lang.com/) - Solana 开发框架
- [Next.js](https://nextjs.org/) - React 框架
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) - 钱包集成

---

## 📚 参考资源

- [Solana 官方文档](https://docs.solana.com/)
- [Anchor 官方文档](https://www.anchor-lang.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

<a name="english"></a>

# 🌊 FlowSol - Solana Payment Streaming Platform

## 📖 Overview

FlowSol is a decentralized real-time payment streaming platform built on Solana blockchain. It enables users to create continuous payment streams that flow by the second, allowing receivers to withdraw accumulated funds at any time without waiting for traditional payment cycles.

### 🎯 Key Features

- **⏱️ Real-time Streaming** - Payments flow continuously by the second
- **💰 Instant Withdrawal** - Receivers can withdraw anytime
- **🔒 Secure** - Protected by Solana PDAs
- **⚡ Efficient** - Lazy evaluation algorithm saves on-chain resources
- **🎨 Modern UI** - Responsive design with major Solana wallet support

### 🌟 Use Cases

- **💼 Payroll** - Real-time salary streaming
- **🎓 Subscriptions** - Pay-as-you-go services
- **💸 Installments** - Automated payment streaming
- **🤝 Consulting** - Hourly rate payments
- **🎮 Gaming** - Reward streaming

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+
node --version

# Rust & Cargo
rustc --version

# Solana CLI
solana --version

# Anchor CLI
anchor --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flowsol-demo.git
cd flowsol-demo

# Install frontend dependencies
cd app
npm install

# Configure Solana to Devnet
solana config set --url devnet

# Build the program
cd ..
anchor build

# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Start frontend
cd app
npm run dev
```

Visit http://localhost:3000

---

## 📖 Documentation

For detailed documentation, please refer to:
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [API Documentation](docs/API.md)

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 📞 Contact

- **GitHub**: [https://github.com/yourusername/flowsol-demo](https://github.com/yourusername/flowsol-demo)
- **Issues**: [GitHub Issues](https://github.com/yourusername/flowsol-demo/issues)

---

<div align="center">

**Built with ❤️ on Solana**

[⬆ Back to Top](#-flowsol---solana-payment-streaming-platform)

</div>
