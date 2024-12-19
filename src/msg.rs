use cosmwasm_schema::QueryResponses;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    EnterHealthRecord {
        patient_id: String,
        signs_n_symptoms: String,
        diagnosis: String,
        prescription: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, QueryResponses)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    #[returns(RecordDetailsEntry)]
    GetHealthRecord {
        patient_id: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct RecordDetailsEntry {
    pub doctor: String,
    pub patient_id: String,
    pub timestamp: i64,
    pub signs_n_symptoms: String,
    pub diagnosis: String,
    pub prescription: String,
}