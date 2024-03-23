const express = require('express');
const { Gateway } = require('fabric-network');

const app = express();
const port = 3000;

// 환자 등록 요청 처리
app.post('/RegistPatient', async (req, res) => {
    try {
        const { id, name, age, gender } = req.body;

        // Gateway 설정
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // 네트워크로부터 채널 가져오기
        const network = await gateway.getNetwork('mychannel');

        // 체인코드 가져오기
        const contract = network.getContract('mychaincode');

        // 환자 등록 호출
        await contract.submitTransaction('RegistPatient', id, name, age, gender);

        res.status(200).send('환자가 성공적으로 등록되었습니다.');
    } catch (error) {
        console.error(`Error registering patient: ${error}`);
        res.status(500).send('환자 등록 중 오류가 발생했습니다.');
    }
});

// 환자 조회 요청 처리
app.get('/RearchPatient/:id', async (req, res) => {
   try {
       const id = req.params.id;

       // Gateway 설정
       const gateway = new Gateway();
       await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

       // 네트워크로부터 채널 가져오기
       const network = await gateway.getNetwork('mychannel');

       // 체인코드 가져오기
       const contract = network.getContract('mychaincode');

       // 환자 조회 호출
       const patientResult = await contract.evaluateTransaction('SearchPatient', id);

       // 병원 내진 이력 조회 호출
       const historyResult = await contract.evaluateTransaction('SearchHistory', id);

       const patient = JSON.parse(patientResult.toString());
       const history = JSON.parse(historyResult.toString());

       // 조회 결과 합치기
       const result = {
           patient: patient,
           history: history
       };

       res.status(200).send(result);
   } catch (error) {
       console.error(`Error searching patient and hospital history: ${error}`);
       res.status(500).send('환자 이력 조회 중 오류가 발생했습니다.');
   }
});

// 병원 내진 이력 작성 요청 처리
app.post('/RecordHistory', async (req, res) => {
    try {
        const { id, record } = req.body;

        // Gateway 설정
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // 네트워크로부터 채널 가져오기
        const network = await gateway.getNetwork('mychannel');

        // 체인코드 가져오기
        const contract = network.getContract('mychaincode');

        // 병원 내진 이력 작성 호출
        await contract.submitTransaction('RecordHistory', id, record);

        res.status(200).send('병원 내진 이력이 성공적으로 작성되었습니다.');
    } catch (error) {
        console.error(`Error recording hospital history: ${error}`);
        res.status(500).send('병원 내진 이력 작성 중 오류가 발생했습니다.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
