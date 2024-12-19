/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tele_health.json`.
 */
export type TeleHealth = {
  "address": "H946v5ZdWCTBKb6Zyc6GXRmANSrKp1NaZFyT1QNC4UoL",
  "metadata": {
    "name": "teleHealth",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "enterHealthRecord",
      "discriminator": [
        1,
        238,
        4,
        119,
        95,
        250,
        129,
        209
      ],
      "accounts": [
        {
          "name": "recordEntry",
          "writable": true,
          "signer": true
        },
        {
          "name": "doctor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "patientId",
          "type": "string"
        },
        {
          "name": "signsNSymptoms",
          "type": "string"
        },
        {
          "name": "diagnosis",
          "type": "string"
        },
        {
          "name": "prescription",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "recordDetailsEntry",
      "discriminator": [
        148,
        192,
        163,
        69,
        166,
        60,
        160,
        44
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "snsTooLong",
      "msg": "Signs ann symptoms should be less than 300 characters"
    },
    {
      "code": 6001,
      "name": "diagnosistTooLong",
      "msg": "Diagnosis shouldn't be more than 300 characters"
    },
    {
      "code": 6002,
      "name": "prescriptionTooLong",
      "msg": "Prescription note too long"
    }
  ],
  "types": [
    {
      "name": "recordDetailsEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "doctor",
            "type": "pubkey"
          },
          {
            "name": "patientId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "signsNSymptoms",
            "type": "string"
          },
          {
            "name": "diagnosis",
            "type": "string"
          },
          {
            "name": "prescription",
            "type": "string"
          }
        ]
      }
    }
  ]
};
