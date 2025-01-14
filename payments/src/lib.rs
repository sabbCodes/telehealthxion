use serde::{Serialize, Deserialize};
use schemars::JsonSchema;

pub mod msg;
pub use msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use cosmwasm_std::{
    entry_point, Addr, BankMsg, Binary, CosmosMsg, Coin, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult,
};
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub platform_wallet: Addr,
    pub platform_fee_percent: u64,
}

// Store config in contract storage
pub const CONFIG: Item<Config> = Item::new("config");

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    if msg.platform_fee_percent > 100 {
        return Err(StdError::generic_err("Fee percentage must be between 0 and 100"));
    }

    let config = Config {
        platform_wallet: deps.api.addr_validate(&msg.platform_wallet)?,
        platform_fee_percent: msg.platform_fee_percent,
    };
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("platform_wallet", msg.platform_wallet)
        .add_attribute("platform_fee_percent", msg.platform_fee_percent.to_string()))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::DistributePayment { doctor, amount } => execute_distribute_payment(deps, info, doctor, amount),
    }
}

pub fn execute_distribute_payment(
    deps: DepsMut,
    info: MessageInfo,
    doctor: String,
    amount: u128,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;
    
    // Validate received funds
    let payment = info
        .funds
        .iter()
        .find(|coin| coin.denom == "uusdc")
        .ok_or_else(|| StdError::generic_err("No USDC payment provided"))?;
    
    if payment.amount.u128() != amount {
        return Err(StdError::generic_err("Sent amount doesn't match specified amount"));
    }

    let platform_fee = amount * config.platform_fee_percent as u128 / 100;
    let doctor_fee = amount - platform_fee;

    let doctor_addr = deps.api.addr_validate(&doctor)?;

    let platform_payment = BankMsg::Send {
        to_address: config.platform_wallet.to_string(),
        amount: vec![Coin {
            denom: "uusdc".to_string(),
            amount: platform_fee.into(),
        }],
    };

    let doctor_payment = BankMsg::Send {
        to_address: doctor_addr.to_string(),
        amount: vec![Coin {
            denom: "uusdc".to_string(),
            amount: doctor_fee.into(),
        }],
    };

    Ok(Response::new()
        .add_message(platform_payment)
        .add_message(doctor_payment)
        .add_attribute("action", "distribute_payment")
        .add_attribute("platform_fee", platform_fee.to_string())
        .add_attribute("doctor_fee", doctor_fee.to_string()))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => cosmwasm_std::to_json_binary(&CONFIG.load(deps.storage)?),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_json};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();
        let msg = InstantiateMsg {
            platform_wallet: "platform".to_string(),
            platform_fee_percent: 10,
        };
        let info = mock_info("creator", &[]);
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetConfig {}).unwrap();
        let config: Config = from_json(&res).unwrap();
        assert_eq!(config.platform_fee_percent, 10);
        assert_eq!(config.platform_wallet, Addr::unchecked("platform"));
    }

    #[test]
    fn distribute_payment() {
        let mut deps = mock_dependencies();
        
        // Initialize contract
        let msg = InstantiateMsg {
            platform_wallet: "platform".to_string(),
            platform_fee_percent: 10,
        };
        let info = mock_info("creator", &[]);
        instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Execute payment distribution
        let info = mock_info("anyone", &coins(1000, "uusdc"));
        let msg = ExecuteMsg::DistributePayment {
            doctor: "doctor".to_string(),
            amount: 1000,
        };
        let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        assert_eq!(2, res.messages.len()); // Two bank messages
        // Platform gets 10%
        assert_eq!(
            res.messages[0].msg,
            CosmosMsg::Bank(BankMsg::Send {
                to_address: "platform".to_string(),
                amount: vec![Coin {
                    denom: "uusdc".to_string(),
                    amount: 100u128.into(),
                }],
            })
        );
        // Doctor gets 90%
        assert_eq!(
            res.messages[1].msg,
            CosmosMsg::Bank(BankMsg::Send {
                to_address: "doctor".to_string(),
                amount: vec![Coin {
                    denom: "uusdc".to_string(),
                    amount: 900u128.into(),
                }],
            })
        );
    }
}