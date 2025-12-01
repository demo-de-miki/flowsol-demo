import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Flowsol } from "../target/types/flowsol";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo
} from "@solana/spl-token";
import { assert } from "chai";

describe("flowsol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Flowsol as Program<Flowsol>;

  let mint: PublicKey;
  let senderTokenAccount: PublicKey;
  let receiverTokenAccount: PublicKey;
  let streamPda: PublicKey;
  let streamTokenAccount: PublicKey;

  const sender = provider.wallet as anchor.Wallet;
  const receiver = Keypair.generate();

  const RATE_PER_SECOND = new anchor.BN(1_000_000); // 1 token per second
  const DEPOSIT_AMOUNT = new anchor.BN(100_000_000); // 100 tokens

  before(async () => {
    // Create a test token mint
    mint = await createMint(
      provider.connection,
      sender.payer,
      sender.publicKey,
      null,
      6
    );

    // Create token accounts for sender and receiver
    senderTokenAccount = await createAccount(
      provider.connection,
      sender.payer,
      mint,
      sender.publicKey
    );

    receiverTokenAccount = await createAccount(
      provider.connection,
      sender.payer,
      mint,
      receiver.publicKey
    );

    // Mint tokens to sender
    await mintTo(
      provider.connection,
      sender.payer,
      mint,
      senderTokenAccount,
      sender.publicKey,
      1000_000_000 // 1000 tokens
    );

    // Derive PDAs
    [streamPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("stream"),
        sender.publicKey.toBuffer(),
        receiver.publicKey.toBuffer(),
      ],
      program.programId
    );

    [streamTokenAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("stream_vault"), streamPda.toBuffer()],
      program.programId
    );
  });

  it("Creates a payment stream", async () => {
    const tx = await program.methods
      .createStream(RATE_PER_SECOND, DEPOSIT_AMOUNT)
      .accounts({
        stream: streamPda,
        sender: sender.publicKey,
        receiver: receiver.publicKey,
        senderTokenAccount: senderTokenAccount,
        streamTokenAccount: streamTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Create stream transaction:", tx);

    const streamAccount = await program.account.streamAccount.fetch(streamPda);

    assert.equal(streamAccount.sender.toString(), sender.publicKey.toString());
    assert.equal(streamAccount.receiver.toString(), receiver.publicKey.toString());
    assert.equal(streamAccount.ratePerSecond.toString(), RATE_PER_SECOND.toString());
    assert.equal(streamAccount.totalDeposited.toString(), DEPOSIT_AMOUNT.toString());
    assert.equal(streamAccount.totalWithdrawn.toNumber(), 0);
    assert.equal(streamAccount.isActive, true);
  });

  it("Allows receiver to withdraw", async () => {
    // Wait for some time to accumulate tokens
    await new Promise(resolve => setTimeout(resolve, 3000));

    const streamBefore = await program.account.streamAccount.fetch(streamPda);

    const tx = await program.methods
      .withdraw()
      .accounts({
        stream: streamPda,
        receiver: receiver.publicKey,
        streamTokenAccount: streamTokenAccount,
        receiverTokenAccount: receiverTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([receiver])
      .rpc();

    console.log("Withdraw transaction:", tx);

    const streamAfter = await program.account.streamAccount.fetch(streamPda);

    assert.isTrue(streamAfter.totalWithdrawn.gt(streamBefore.totalWithdrawn));
    console.log("Withdrawn amount:", streamAfter.totalWithdrawn.toString());
  });

  it("Allows sender to close stream", async () => {
    const tx = await program.methods
      .closeStream()
      .accounts({
        stream: streamPda,
        sender: sender.publicKey,
        streamTokenAccount: streamTokenAccount,
        senderTokenAccount: senderTokenAccount,
        receiverTokenAccount: receiverTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Close stream transaction:", tx);

    const streamAccount = await program.account.streamAccount.fetch(streamPda);

    assert.equal(streamAccount.isActive, false);
  });

  it("Prevents withdrawal from inactive stream", async () => {
    try {
      await program.methods
        .withdraw()
        .accounts({
          stream: streamPda,
          receiver: receiver.publicKey,
          streamTokenAccount: streamTokenAccount,
          receiverTokenAccount: receiverTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([receiver])
        .rpc();

      assert.fail("Should have thrown error");
    } catch (err) {
      assert.include(err.toString(), "StreamNotActive");
    }
  });
});
