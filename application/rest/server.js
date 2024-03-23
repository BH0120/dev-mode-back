const express = require('express');
const app = express();
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');

const PORT = 3000;
const HOST = 'localhost';
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.join(process.cwd(), '..', 'wallet');

async function connectToGateway() {
   const wallet = await Wallets.newFileSystemWallet(walletPath);
   const gateway = new Gateway();
   await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
   return gateway;
}

// 환자 등록 요청 처리
app.post('/RegistPatient', async (req, res) => {
    try {
      const {  id, name, age, gender } = req.body;
      const gateway = await connectToGateway();
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('abstore');
      await contract.submitTransaction('RegistPatient', id, name, age, gender);
      res.json({ success: true, message: '환자가 성공적으로 등록되었습니다.' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

// 환자 조회 요청 처리
app.get('/SearchPatient/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const gateway = await connectToGateway();
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('abstore');
      const patientResult = await contract.evaluateTransaction('SearchPatient', id);

      // 병원 내진 이력 조회 호출
      const historyResult = await contract.evaluateTransaction('SearchHistory', id);
      
      let patient = [];
      if(typeof patientResult !== "undefined"){
         patient = JSON.parse(patientResult.toString());
      }else {
         patient = "undefined";
      }

      let history = [];
      if (typeof historyResult !== 'undefined') {
          history = JSON.parse(historyResult.toString());
      } else {
         history = "undefined";
      }
드
       const result = {
         patient: patient,
         history: history
     };
     res.status(200).send(result);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }

});

// 병원 내진 이력 작성 요청 처리
app.post('/RecordHistory', async (req, res) => {
    try {
      const { id, record } = req.body;
      const gateway = await connectToGateway();
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('abstore');
      await contract.submitTransaction('RecordHistory', id, record);
      res.json({ success: true, message: '병원 내진 이력이 성공적으로 작성되었습니다.' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

app.use(express.static(path.join(__dirname, '../client')));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);