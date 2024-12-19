pub mod msg;
pub use msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, StdError,
    to_json_binary, from_json,
};
use cw_storage_plus::Map;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

// Storage for medical records
const MEDICAL_RECORDS: Map<&str, RecordDetailsEntry> = Map::new("medical_records");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct RecordDetailsEntry {
    pub doctor: String,  // Using String instead of Pubkey for Cosmos address
    pub patient_id: String,
    pub timestamp: i64,
    pub signs_n_symptoms: String,
    pub diagnosis: String,
    pub prescription: String,
}

#[entry_point]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::new().add_attribute("action", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::EnterHealthRecord {
            patient_id,
            signs_n_symptoms,
            diagnosis,
            prescription,
        } => enter_health_record(
            deps,
            env,
            info,
            patient_id,
            signs_n_symptoms,
            diagnosis,
            prescription,
        ),
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetHealthRecord { patient_id } => {
            let record = MEDICAL_RECORDS.load(deps.storage, &patient_id)?;
            to_json_binary(&record)
        }
    }
}

pub fn enter_health_record(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    patient_id: String,
    signs_n_symptoms: String,
    diagnosis: String,
    prescription: String,
) -> StdResult<Response> {
    // Validate string lengths
    if signs_n_symptoms.chars().count() > 500 {
        return Err(StdError::generic_err("Signs and symptoms should be less than 500 characters"));
    }
    if diagnosis.chars().count() > 500 {
        return Err(StdError::generic_err("Diagnosis shouldn't be more than 500 characters"));
    }
    if prescription.chars().count() > 500 {
        return Err(StdError::generic_err("Prescription note too long"));
    }

    let record = RecordDetailsEntry {
        doctor: info.sender.to_string(),
        patient_id: patient_id.clone(),
        timestamp: env.block.time.seconds() as i64,
        signs_n_symptoms,
        diagnosis,
        prescription,
    };

    MEDICAL_RECORDS.save(deps.storage, &patient_id, &record)?;

    Ok(Response::new()
        .add_attribute("action", "enter_health_record")
        .add_attribute("patient_id", patient_id)
        .add_attribute("doctor", info.sender))
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{
        mock_dependencies, mock_env, mock_info,
    };

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("creator", &[]);
        let msg = InstantiateMsg {};

        let res = instantiate(deps.as_mut(), env, info, msg).unwrap();
        assert_eq!(0, res.messages.len());
    }

    #[test]
    fn test_enter_health_record() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("doctor_address", &[]);

        // Test valid record
        let msg = ExecuteMsg::EnterHealthRecord {
            patient_id: "PATIENT123".to_string(),
            signs_n_symptoms: "Fever".to_string(),
            diagnosis: "Common cold".to_string(),
            prescription: "Rest and fluids".to_string(),
        };

        let res = execute(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        assert_eq!(3, res.attributes.len());

        // Query the record
        let query_msg = QueryMsg::GetHealthRecord {
            patient_id: "PATIENT123".to_string(),
        };
        let res = query(deps.as_ref(), env.clone(), query_msg).unwrap();
        let record: RecordDetailsEntry = from_json(&res).unwrap();
        assert_eq!(record.doctor, "doctor_address");
        assert_eq!(record.signs_n_symptoms, "Fever");
    }

    #[test]
    fn test_long_strings() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("doctor_address", &[]);

        // Test too long signs and symptoms
        let long_string = "a".repeat(501);
        let msg = ExecuteMsg::EnterHealthRecord {
            patient_id: "PATIENT123".to_string(),
            signs_n_symptoms: long_string,
            diagnosis: "Common cold".to_string(),
            prescription: "Rest and fluids".to_string(),
        };

        let err = execute(deps.as_mut(), env.clone(), info.clone(), msg).unwrap_err();
        assert_eq!(
            err.to_string(),
            "Generic error: Signs and symptoms should be less than 500 characters"
        );
    }
}