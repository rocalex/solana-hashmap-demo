use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, action: u64) -> Result<()> {
        let base = &mut ctx.accounts.base;
        base.action = action;
        Ok(())
    }

    pub fn init_consumed_actions(ctx: Context<InitConsumedActions>) -> Result<()> {
        ctx.accounts.consumed_actions.consumed = true;
        Ok(())
    }

    pub fn change_action_value(ctx: Context<ChangeActionValue>, value: bool) -> Result<()> {
        ctx.accounts.consumed_actions.consumed = value;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(action: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 16
    )]
    base: Account<'info, BaseAccount>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitConsumedActions<'info> {
    base: Account<'info, BaseAccount>,
    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [
            base.key().as_ref(),
            base.action.to_le_bytes().as_ref(),
        ],
        bump
    )]
    consumed_actions: Account<'info, ConsumedActions>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeActionValue<'info> {
    base: Account<'info, BaseAccount>,
    #[account(
        mut,
        seeds = [
            base.key().as_ref(),
            base.action.to_le_bytes().as_ref(),
        ],
        bump
    )]
    consumed_actions: Account<'info, ConsumedActions>,
}

#[account]
pub struct ConsumedActions {
    consumed: bool,
    // bump: u8,
}

#[account]
pub struct BaseAccount {
    action: u64,
}
