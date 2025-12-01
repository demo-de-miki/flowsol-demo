// FlowSol - Solana Payment Streaming Protocol
//
// 这是一个实时流式支付智能合约，允许用户创建按时间计费的连续支付流。
// 接收者可以随时提取已累积的资金，无需等待传统的支付周期。
//
// 核心特性：
// - 惰性计算 (Lazy Evaluation): 只在交互时计算累积金额，节省 Gas
// - PDA 账户管理: 使用 Program Derived Address 确保账户安全
// - 实时提取: 接收者随时可以提取已累积的资金

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// 程序 ID - 部署后需要更新为实际的程序 ID
declare_id!("11111111111111111111111111111112");

#[program]
pub mod flowsol {
    use super::*;

    /// 创建流支付
    ///
    /// 功能说明：
    /// 1. 初始化一个新的流支付账户
    /// 2. 将指定数量的代币从发送者账户转移到流账户
    /// 3. 记录流的参数（流速率、开始时间等）
    ///
    /// # 参数
    /// * `rate_per_second` - 每秒流动的代币数量（基础单位）
    /// * `amount` - 存入流账户的总代币数量
    ///
    /// # 示例
    /// ```
    /// // 创建每秒 1 token，总共 100 tokens 的流
    /// // 这个流将持续 100 秒
    /// create_stream(ctx, 1_000_000, 100_000_000)
    /// ```
    pub fn create_stream(
        ctx: Context<CreateStream>,
        rate_per_second: u64,
        amount: u64,
    ) -> Result<()> {
        // 获取当前区块链时间
        let clock = Clock::get()?;
        let stream = &mut ctx.accounts.stream;

        // 初始化流账户的所有字段
        stream.sender = ctx.accounts.sender.key();
        stream.receiver = ctx.accounts.receiver.key();
        stream.rate_per_second = rate_per_second;
        stream.start_time = clock.unix_timestamp;
        stream.last_withdrawal = clock.unix_timestamp;  // 初始化为开始时间
        stream.total_deposited = amount;
        stream.total_withdrawn = 0;
        stream.is_active = true;

        // 将代币从发送者账户转移到流的代币账户
        // 这些代币将被锁定，并按照流速率逐步释放给接收者
        let transfer_instruction = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.stream_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        token::transfer(cpi_ctx, amount)?;

        msg!("Stream created: {} tokens/sec from {} to {}",
            rate_per_second,
            ctx.accounts.sender.key(),
            ctx.accounts.receiver.key()
        );

        Ok(())
    }

    /// 提取资金
    ///
    /// 功能说明：
    /// 1. 计算从上次提取到现在累积的可提取金额（惰性计算）
    /// 2. 将可提取金额转移到接收者的代币账户
    /// 3. 更新上次提取时间和总提取金额
    ///
    /// # 惰性计算算法
    /// ```
    /// 时间差 = 当前时间 - 上次提取时间
    /// 理论可提取 = 流速率 × 时间差
    /// 实际可提取 = min(理论可提取, 剩余金额)
    /// ```
    ///
    /// # 安全检查
    /// - 只有接收者可以调用此函数
    /// - 流必须处于活跃状态
    /// - 必须有可提取的金额
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let clock = Clock::get()?;
        let stream = &mut ctx.accounts.stream;

        // 安全检查：流必须是活跃的
        require!(stream.is_active, StreamError::StreamNotActive);

        // 安全检查：只有接收者可以提取
        require!(
            ctx.accounts.receiver.key() == stream.receiver,
            StreamError::UnauthorizedWithdrawal
        );

        // 惰性计算可提取金额
        // 这是核心算法：只在提取时才计算累积金额，而不是每秒更新状态
        let time_elapsed = clock.unix_timestamp - stream.last_withdrawal;
        let claimable = (stream.rate_per_second as u128 * time_elapsed as u128) as u64;
        let available = stream.total_deposited - stream.total_withdrawn;
        let withdraw_amount = std::cmp::min(claimable, available);

        // 必须有可提取金额
        require!(withdraw_amount > 0, StreamError::NothingToWithdraw);

        // 更新流的状态
        stream.total_withdrawn += withdraw_amount;
        stream.last_withdrawal = clock.unix_timestamp;

        // 使用 PDA 签名从流的代币账户转移到接收者账户
        // seeds 必须与创建账户时使用的完全一致
        let seeds = &[
            b"stream",
            stream.sender.as_ref(),
            stream.receiver.as_ref(),
            &[ctx.bumps.stream],
        ];
        let signer = &[&seeds[..]];

        let transfer_instruction = Transfer {
            from: ctx.accounts.stream_token_account.to_account_info(),
            to: ctx.accounts.receiver_token_account.to_account_info(),
            authority: ctx.accounts.stream.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );

        token::transfer(cpi_ctx, withdraw_amount)?;

        msg!("Withdrawn {} tokens to {}", withdraw_amount, ctx.accounts.receiver.key());

        Ok(())
    }

    /// 关闭流支付
    ///
    /// 功能说明：
    /// 1. 计算并转移接收者的最终可提取金额
    /// 2. 将剩余的未流动资金退还给发送者
    /// 3. 将流标记为非活跃状态
    ///
    /// # 安全检查
    /// - 只有发送者可以关闭流
    /// - 流必须处于活跃状态
    ///
    /// # 资金分配
    /// - 接收者获得：已流动但未提取的部分
    /// - 发送者获得：剩余未流动的部分
    pub fn close_stream(ctx: Context<CloseStream>) -> Result<()> {
        let stream = &mut ctx.accounts.stream;

        // 安全检查：流必须是活跃的
        require!(stream.is_active, StreamError::StreamNotActive);

        // 安全检查：只有发送者可以关闭流
        require!(
            ctx.accounts.sender.key() == stream.sender,
            StreamError::UnauthorizedClose
        );

        // 计算接收者的最终可提取金额（已流动但未提取的部分）
        let clock = Clock::get()?;
        let time_elapsed = clock.unix_timestamp - stream.last_withdrawal;
        let claimable = (stream.rate_per_second as u128 * time_elapsed as u128) as u64;
        let available = stream.total_deposited - stream.total_withdrawn;
        let final_withdrawal = std::cmp::min(claimable, available);

        // 如果有可提取金额，先转给接收者
        if final_withdrawal > 0 {
            stream.total_withdrawn += final_withdrawal;

            let seeds = &[
                b"stream",
                stream.sender.as_ref(),
                stream.receiver.as_ref(),
                &[ctx.bumps.stream],
            ];
            let signer = &[&seeds[..]];

            let transfer_instruction = Transfer {
                from: ctx.accounts.stream_token_account.to_account_info(),
                to: ctx.accounts.receiver_token_account.to_account_info(),
                authority: ctx.accounts.stream.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                signer,
            );

            token::transfer(cpi_ctx, final_withdrawal)?;
        }

        // Return remaining balance to sender
        let remaining = stream.total_deposited - stream.total_withdrawn;
        if remaining > 0 {
            let seeds = &[
                b"stream",
                stream.sender.as_ref(),
                stream.receiver.as_ref(),
                &[ctx.bumps.stream],
            ];
            let signer = &[&seeds[..]];

            let transfer_instruction = Transfer {
                from: ctx.accounts.stream_token_account.to_account_info(),
                to: ctx.accounts.sender_token_account.to_account_info(),
                authority: ctx.accounts.stream.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                signer,
            );

            token::transfer(cpi_ctx, remaining)?;
        }

        // 将流标记为非活跃，防止后续操作
        stream.is_active = false;

        msg!("Stream closed by {}", ctx.accounts.sender.key());

        Ok(())
    }

    /// 查询可提取金额（只读函数）
    ///
    /// 这个函数不修改状态，仅用于查询当前可提取的金额
    /// 前端可以使用这个函数实时显示可提取余额
    pub fn get_claimable_amount(ctx: Context<GetClaimableAmount>) -> Result<u64> {
        let clock = Clock::get()?;
        let stream = &ctx.accounts.stream;

        if !stream.is_active {
            return Ok(0);
        }

        let time_elapsed = clock.unix_timestamp - stream.last_withdrawal;
        let claimable = (stream.rate_per_second as u128 * time_elapsed as u128) as u64;
        let available = stream.total_deposited - stream.total_withdrawn;

        Ok(std::cmp::min(claimable, available))
    }
}

// ============================================================================
// 账户验证结构（Account Validation Structs）
// ============================================================================

/// CreateStream 指令的账户结构
///
/// 这个结构定义了创建流支付时需要的所有账户及其约束条件
#[derive(Accounts)]
pub struct CreateStream<'info> {
    /// 流账户 - 使用 PDA 确保唯一性和安全性
    /// seeds: ["stream", sender_pubkey, receiver_pubkey]
    #[account(
        init,
        payer = sender,
        space = StreamAccount::LEN,
        seeds = [b"stream", sender.key().as_ref(), receiver.key().as_ref()],
        bump
    )]
    pub stream: Account<'info, StreamAccount>,

    /// 发送者账户 - 必须签名，因为需要支付账户创建费用和转移代币
    #[account(mut)]
    pub sender: Signer<'info>,

    /// 接收者公钥 - 不需要签名，只是记录地址
    /// CHECK: This is the receiver's public key
    pub receiver: AccountInfo<'info>,

    /// 发送者的 SPL Token 账户 - 代币将从这里转移
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,

    /// 流的 SPL Token 账户 - 使用 PDA 创建，由程序控制
    /// 这个账户会持有锁定的代币
    #[account(
        init,
        payer = sender,
        token::mint = sender_token_account.mint,
        token::authority = stream,
        seeds = [b"stream_vault", stream.key().as_ref()],
        bump
    )]
    pub stream_token_account: Account<'info, TokenAccount>,

    /// SPL Token 程序
    pub token_program: Program<'info, Token>,

    /// 系统程序 - 用于创建账户
    pub system_program: Program<'info, System>,

    /// Rent sysvar - 用于计算租金豁免所需的最小余额
    pub rent: Sysvar<'info, Rent>,
}

/// Withdraw 指令的账户结构
///
/// 定义提取资金时需要的账户
#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// 流账户 - 需要读取和更新状态
    #[account(
        mut,
        seeds = [b"stream", stream.sender.key().as_ref(), stream.receiver.key().as_ref()],
        bump
    )]
    pub stream: Account<'info, StreamAccount>,

    /// 接收者 - 必须签名以证明身份
    pub receiver: Signer<'info>,

    /// 流的代币账户 - 从这里转出
    #[account(
        mut,
        seeds = [b"stream_vault", stream.key().as_ref()],
        bump
    )]
    pub stream_token_account: Account<'info, TokenAccount>,

    /// 接收者的代币账户 - 转入这里
    #[account(mut)]
    pub receiver_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

/// CloseStream 指令的账户结构
///
/// 定义关闭流时需要的账户
#[derive(Accounts)]
pub struct CloseStream<'info> {
    /// 流账户
    #[account(
        mut,
        seeds = [b"stream", stream.sender.key().as_ref(), stream.receiver.key().as_ref()],
        bump
    )]
    pub stream: Account<'info, StreamAccount>,

    /// 发送者 - 必须签名，只有发送者能关闭流
    pub sender: Signer<'info>,

    /// 流的代币账户
    #[account(
        mut,
        seeds = [b"stream_vault", stream.key().as_ref()],
        bump
    )]
    pub stream_token_account: Account<'info, TokenAccount>,

    /// 发送者的代币账户 - 剩余资金退还到这里
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,

    /// 接收者的代币账户 - 已累积资金转入这里
    #[account(mut)]
    pub receiver_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

/// GetClaimableAmount 指令的账户结构（只读查询）
#[derive(Accounts)]
pub struct GetClaimableAmount<'info> {
    #[account(
        seeds = [b"stream", stream.sender.key().as_ref(), stream.receiver.key().as_ref()],
        bump
    )]
    pub stream: Account<'info, StreamAccount>,
}

// ============================================================================
// 数据结构（Data Structures）
// ============================================================================

/// 流支付账户的数据结构
///
/// 存储流支付的所有状态信息
#[account]
pub struct StreamAccount {
    /// 发送者的公钥（创建流的人）
    pub sender: Pubkey,          // 32 bytes

    /// 接收者的公钥（接收流的人）
    pub receiver: Pubkey,        // 32 bytes

    /// 每秒流动的代币数量（基础单位）
    pub rate_per_second: u64,    // 8 bytes

    /// 流开始的时间戳
    pub start_time: i64,         // 8 bytes

    /// 上次提取的时间戳（用于惰性计算）
    pub last_withdrawal: i64,    // 8 bytes

    /// 总共存入的代币数量
    pub total_deposited: u64,    // 8 bytes

    /// 总共已提取的代币数量
    pub total_withdrawn: u64,    // 8 bytes

    /// 流是否处于活跃状态
    pub is_active: bool,         // 1 byte
}

impl StreamAccount {
    /// 计算账户所需的空间
    /// 8 (discriminator) + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 = 113 bytes
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

// ============================================================================
// 错误代码（Error Codes）
// ============================================================================

/// 自定义错误类型
#[error_code]
pub enum StreamError {
    /// 流已关闭，无法操作
    #[msg("Stream is not active")]
    StreamNotActive,

    /// 未授权的提取操作（非接收者尝试提取）
    #[msg("Unauthorized withdrawal")]
    UnauthorizedWithdrawal,

    /// 没有可提取的金额
    #[msg("Nothing to withdraw")]
    NothingToWithdraw,

    /// 未授权的关闭操作（非发送者尝试关闭）
    #[msg("Unauthorized close")]
    UnauthorizedClose,
}