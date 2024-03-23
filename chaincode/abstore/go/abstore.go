package main

import (
    "encoding/json"
    "fmt"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// PatientRegistrationContract 체인코드 정의
type PatientRegistrationContract struct {
    contractapi.Contract
}

// Patient 환자 구조체 정의
type Patient struct {
    ID       string `json:"id"`
    Name     string `json:"name"`
    Age      int    `json:"age"`
    Gender   string `json:"gender"`
    History  []string `json:"history"`
}

// registPatient 환자 등록 함수
// func (c *PatientRegistrationContract) registPatient(ctx contractapi.TransactionContextInterface, id string, name string, age int, gender string) error {
//     patient := Patient{
//         ID:     id,
//         Name:   name,
//         Age:    age,
//         Gender: gender,
//     }
//     patientJSON, err := json.Marshal(patient)
//     if err != nil {
//         return err
//     }
//     return ctx.GetStub().PutState(id, patientJSON)
// }

// registPatient 환자 등록 함수
func (c *PatientRegistrationContract) RegistPatient(ctx contractapi.TransactionContextInterface, id string, name string, age int, gender string) error {
    // 환자 정보를 문자열로 직렬화하여 저장     
    patientInfo := fmt.Sprintf(`{"id": "%s", "name": "%s", "age": %d, "gender": "%s"}`, id, name, age, gender)
    return ctx.GetStub().PutState(id, []byte(patientInfo))
}

// searchPatient 환자 조회 함수
func (c *PatientRegistrationContract) SearchPatient(ctx contractapi.TransactionContextInterface, id string) (*Patient, error) {
    patientJSON, err := ctx.GetStub().GetState(id)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if patientJSON == nil {
        return nil, fmt.Errorf("the patient with ID %s does not exist", id)
    }
    var patient Patient
    err = json.Unmarshal(patientJSON, &patient)
    if err != nil {
        return nil, err
    }
    return &patient, nil
}

// searchHistory 병원 내진 이력 조회 함수
func (c *PatientRegistrationContract) SearchHistory(ctx contractapi.TransactionContextInterface, id string) ([]string, error) {
    patient, err := c.SearchPatient(ctx, id)
    if err != nil {
        return nil, err
    }
    return patient.History, nil
}

// recordHistory 병원 내진 이력 작성 함수
func (c *PatientRegistrationContract) RecordHistory(ctx contractapi.TransactionContextInterface, id string, record string) error {
    patient, err := c.SearchPatient(ctx, id)
    if err != nil {
        return err
    }
    patient.History = append(patient.History, record)
    patientJSON, err := json.Marshal(patient)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState(id, patientJSON)
}

func main() {
    patientRegistrationContract := new(PatientRegistrationContract)
    chaincode, err := contractapi.NewChaincode(patientRegistrationContract)
    if err != nil {
        fmt.Printf("Error creating patient registration chaincode: %s", err.Error())
        return
    }
    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting patient registration chaincode: %s", err.Error())
    }
}
