import assert from 'assert'
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair } from '@solana/web3.js';
import { HelloWorld } from "../target/types/hello_world";

describe("hello-world", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;

  let base: Keypair;
  let base2: Keypair;
  let _consumedActions: PublicKey;

  it("Init base account!", async () => {
    base = anchor.web3.Keypair.generate()

    const tx = await program.methods
      .initialize(new anchor.BN(10000))
      .accounts({
        user: provider.wallet.publicKey,
        base: base.publicKey
      })
      .signers([base])
      .rpc()

    console.log("transaction signature", tx);

    const baseAccount = await program.account.baseAccount.fetch(base.publicKey)

    assert.ok(baseAccount.action.eq(new anchor.BN(10000)))
  });

  it("Init my account", async () => {
    const [consumedActions, _] = await PublicKey
      .findProgramAddress(
        [
          base.publicKey.toBuffer(),
          new anchor.BN(10000).toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

    const tx = await program.methods
      .initConsumedActions()
      .accounts({
        base: base.publicKey,
        consumedActions: consumedActions
      })
      .rpc()

    console.log("transaction signature", tx);

    const consumedActionsAccount = await program.account.consumedActions.fetch(consumedActions)
    assert.ok(consumedActionsAccount.consumed == true)

    _consumedActions = consumedActions
  })

  it("change consumed actions value", async () => {
    const consumedActions = _consumedActions
    const tx = await program.methods
      .changeActionValue(false)
      .accounts({
        base: base.publicKey,
        consumedActions: consumedActions
      })
      .rpc()

    console.log("transaction signature", tx);

    const consumedActionsAccount = await program.account.consumedActions.fetch(consumedActions)
    assert.ok(consumedActionsAccount.consumed == false)
  })
});
