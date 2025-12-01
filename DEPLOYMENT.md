# 部署指南 | Deployment Guide

本指南将帮助你将 FlowSol 项目部署到 Solana 区块链（Devnet/Mainnet）并运行前端应用。

---

## 📋 目录

- [准备工作](#准备工作)
- [智能合约部署](#智能合约部署)
  - [部署到 Devnet](#部署到-devnet)
  - [部署到 Mainnet](#部署到-mainnet)
- [前端部署](#前端部署)
  - [配置环境变量](#配置环境变量)
  - [本地运行](#本地运行)
  - [生产构建](#生产构建)
  - [部署到 Vercel](#部署到-vercel)
- [验证部署](#验证部署)
- [常见问题](#常见问题)

---

## 准备工作

### 1. 安装依赖工具

确保已安装以下工具：

```bash
# Node.js 18+
node --version

# Rust & Cargo
rustc --version
cargo --version

# Solana CLI
solana --version

# Anchor CLI
anchor --version
```

如果未安装，请参考：
- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation)

### 2. 创建钱包

```bash
# 创建新钱包
solana-keygen new --outfile ~/.config/solana/id.json

# 查看钱包地址
solana address

# 查看余额
solana balance
```

### 3. 获取 SOL

**Devnet：**
```bash
# 设置为 Devnet
solana config set --url devnet

# 申请空投
solana airdrop 2

# 可以多次申请
solana airdrop 2
```

**Mainnet：**
- 需要购买真实的 SOL
- 推荐至少准备 1-2 SOL 用于部署和测试

---

## 智能合约部署

### 部署到 Devnet

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/flowsol-demo.git
cd flowsol-demo
```

#### 2. 配置 Anchor

```bash
# 设置为 Devnet
solana config set --url devnet

# 验证配置
solana config get
```

输出应该类似：
```
Config File: /Users/你的用户名/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/你的用户名/.config/solana/id.json
Commitment: confirmed
```

#### 3. 构建程序

```bash
anchor build
```

这将：
- 编译 Rust 代码
- 生成程序二进制文件
- 生成 IDL 文件
- 生成 TypeScript 类型文件

#### 4. 获取程序 ID

```bash
# 查看默认的程序 ID
anchor keys list
```

输出：
```
flowsol: 你的程序ID
```

#### 5. 更新程序 ID

将程序 ID 更新到以下文件：

**Anchor.toml:**
```toml
[programs.devnet]
flowsol = "你的程序ID"
```

**programs/flowsol/src/lib.rs:**
```rust
declare_id!("你的程序ID");
```

**app/lib/idl.ts:**
```typescript
export const PROGRAM_ID = "你的程序ID";
```

#### 6. 重新构建

```bash
anchor build
```

#### 7. 部署

```bash
# 部署到 Devnet
anchor deploy --provider.cluster devnet
```

成功输出：
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: 你的钱包地址
Deploying program "flowsol"...
Program path: /path/to/flowsol-demo/target/deploy/flowsol.so...
Program Id: 你的程序ID

Deploy success
```

#### 8. 验证部署

```bash
# 查看程序信息
solana program show 你的程序ID --url devnet
```

输出应显示：
- Program Id
- Owner
- ProgramData Address
- Authority
- Last Deployed Slot
- Data Length
- Balance

---

### 部署到 Mainnet

⚠️ **警告：部署到 Mainnet 将花费真实的 SOL。请确保代码经过充分测试！**

#### 1. 配置 Mainnet

```bash
# 切换到 Mainnet
solana config set --url mainnet-beta

# 确认配置
solana config get
```

#### 2. 确保有足够的 SOL

```bash
# 检查余额
solana balance

# 至少需要 1-2 SOL 用于部署
```

#### 3. 更新 Anchor.toml

```toml
[programs.mainnet]
flowsol = "你的Mainnet程序ID"

[provider]
cluster = "mainnet"
```

#### 4. 构建并部署

```bash
# 构建
anchor build

# 部署到 Mainnet
anchor deploy --provider.cluster mainnet
```

#### 5. 验证

```bash
solana program show 你的程序ID --url mainnet
```

---

## 前端部署

### 配置环境变量

#### 1. 创建环境文件

在 `app/` 目录下创建 `.env.local`:

```bash
cd app
touch .env.local
```

#### 2. 配置变量

**开发环境（.env.local）：**
```env
# Solana 网络
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# 程序 ID
NEXT_PUBLIC_PROGRAM_ID=你的程序ID

# 代币 Mint（如果使用自定义代币）
NEXT_PUBLIC_TOKEN_MINT=你的代币Mint地址
```

**生产环境（.env.production）：**
```env
# Solana 网络
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# 或使用付费 RPC（推荐）
# NEXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-provider.com

# 程序 ID（Mainnet）
NEXT_PUBLIC_PROGRAM_ID=你的Mainnet程序ID

# 代币 Mint
NEXT_PUBLIC_TOKEN_MINT=你的代币Mint地址
```

### 本地运行

#### 1. 安装依赖

```bash
cd app
npm install
```

#### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

#### 3. 测试功能

- 连接 Phantom/Solflare 钱包
- 创建测试流
- 提取资金
- 关闭流

### 生产构建

#### 1. 构建应用

```bash
npm run build
```

这将：
- 优化代码
- 压缩资源
- 生成静态文件

#### 2. 本地测试生产版本

```bash
npm run start
```

访问：http://localhost:3000

### 部署到 Vercel

#### 方式一：通过 Git 集成（推荐）

1. **将代码推送到 GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **在 Vercel 导入项目**

- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 导入你的 GitHub 仓库
- 选择 `app` 目录作为根目录

3. **配置环境变量**

在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=你的RPC_URL
NEXT_PUBLIC_PROGRAM_ID=你的程序ID
NEXT_PUBLIC_TOKEN_MINT=你的代币Mint地址
```

4. **部署**

点击 "Deploy" 按钮，Vercel 将自动：
- 安装依赖
- 构建应用
- 部署到 CDN

5. **获取域名**

部署完成后，Vercel 会提供一个域名：
```
https://你的项目名.vercel.app
```

#### 方式二：通过 CLI 部署

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录**

```bash
vercel login
```

3. **部署**

```bash
cd app
vercel --prod
```

### 部署到其他平台

#### Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
cd app
netlify deploy --prod
```

#### AWS S3 + CloudFront

```bash
# 构建
npm run build

# 上传到 S3
aws s3 sync out/ s3://你的桶名 --delete

# 清除 CloudFront 缓存
aws cloudfront create-invalidation \
  --distribution-id 你的分发ID \
  --paths "/*"
```

---

## 验证部署

### 智能合约验证

#### 1. 检查程序是否部署

```bash
solana program show 你的程序ID --url devnet
```

#### 2. 运行测试

```bash
cd flowsol-demo
anchor test --skip-local-validator
```

#### 3. 查看 Solana Explorer

访问：
- Devnet: https://explorer.solana.com/?cluster=devnet
- Mainnet: https://explorer.solana.com/

搜索你的程序 ID，查看：
- 程序信息
- 交易历史
- 账户数据

### 前端验证

#### 1. 检查网站可访问性

访问部署的 URL，确保：
- 页面正常加载
- 样式正确显示
- 钱包可以连接

#### 2. 功能测试

- [ ] 钱包连接
- [ ] 创建流支付
- [ ] 查看流列表
- [ ] 提取资金
- [ ] 关闭流

#### 3. 性能检查

使用工具检查：
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

## 常见问题

### 部署失败

**问题：余额不足**
```
Error: Attempt to debit an account but found no record of a prior credit.
```

**解决：**
```bash
# 检查余额
solana balance

# Devnet 申请空投
solana airdrop 2

# Mainnet 需要转入 SOL
```

---

**问题：程序 ID 不匹配**
```
Error: Program address is not a valid Program ID
```

**解决：**
确保所有文件中的程序 ID 一致：
- `Anchor.toml`
- `programs/flowsol/src/lib.rs`
- `app/lib/idl.ts`

---

**问题：构建失败**
```
Error: failed to compile
```

**解决：**
```bash
# 清理缓存
anchor clean

# 重新构建
anchor build
```

---

### 前端问题

**问题：钱包连接失败**

**解决：**
1. 检查钱包是否连接到正确的网络（Devnet/Mainnet）
2. 确保钱包有足够的 SOL
3. 检查浏览器控制台错误

---

**问题：交易失败**

**解决：**
1. 检查程序 ID 是否正确
2. 确认钱包有足够的 SOL 支付交易费用
3. 查看交易详情获取错误信息

---

### 性能优化

#### RPC 优化

使用付费 RPC 提供商提高性能：
- [Alchemy](https://www.alchemy.com/solana)
- [QuickNode](https://www.quicknode.com/chains/sol)
- [Helius](https://helius.xyz/)
- [Triton](https://triton.one/)

#### 前端优化

```typescript
// 使用连接池
const commitment = 'confirmed';
const connection = new Connection(RPC_URL, commitment);

// 缓存账户数据
const cache = new Map();

// 批量获取账户
const accounts = await connection.getMultipleAccountsInfo([...]);
```

---

## 🔧 维护和更新

### 更新智能合约

```bash
# 1. 修改代码
# 2. 测试
anchor test

# 3. 构建
anchor build

# 4. 升级程序
anchor upgrade target/deploy/flowsol.so \
  --program-id 你的程序ID \
  --provider.cluster devnet
```

### 更新前端

```bash
# 1. 修改代码
# 2. 测试
npm run build
npm run start

# 3. 部署
git push origin main  # Vercel 自动部署
```

---

## 📊 监控

### 智能合约监控

- 定期检查程序账户余额
- 监控交易失败率
- 跟踪 gas 费用

### 前端监控

使用工具：
- [Sentry](https://sentry.io/) - 错误追踪
- [Google Analytics](https://analytics.google.com/) - 用户分析
- [Vercel Analytics](https://vercel.com/analytics) - 性能监控

---

## 🆘 需要帮助？

如果遇到部署问题：

1. 查看 [README.md](README.md)
2. 搜索 [Issues](https://github.com/yourusername/flowsol-demo/issues)
3. 提问在 [Discussions](https://github.com/yourusername/flowsol-demo/discussions)
4. 联系维护者

---

**祝你部署顺利！** 🚀
