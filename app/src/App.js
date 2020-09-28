import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './App.css';
import ElFederal from "./contracts/ElFederal.json";
import TokenEFD from "./contracts/TokenEFD.json";
//import Register from "./contracts/Register.json";

function App() {
  const [account, setAccount] = useState('');
  const [elFederal, setElFederal] = useState(null);
  const [token, setToken] = useState(null);  
  const [name, setName] = useState('');
  const [minApproval, setMinApproval] = useState('');  

  const [inputApproveValue, setInputApproveValue] = useState('', 0);
  const [inputApproveAddress, setInputApproveAddress] = useState();  
  const [inputRevokeAddress, setInputRevokeAddress] = useState();
  const [approveValue, setApproveValue] = useState('', 0);
  const [address, setAddress] = useState();
  //const [approvedValue, setApprovedValue] = useState(null);
  const [approvedInfo, setApprovedInfo] = useState(null, null);
  const [inputAddress, setInputAddress] = useState('');
  
  const [inputAddWhitelist, setInputAddWhitelist] = useState('');
  const [inputRemoveWhitelist, setInputRemoveWhitelist] = useState('');
  const [inputValue, setInputValue] = useState(0);
  const [isWhitelisted, setIsWhitelisted] = useState(null);
 

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          'Non-Ethereum browser detected. You should consider trying MetaMask!',
        );
      }
      console.log (window.web3.currentProvider);
    }
    
    async function loadBlockchainData() {
      try {
        const web3 = window.web3;
       
        // Load first account
        const [account] = await web3.eth.getAccounts();
        console.log ('account: ', account);
        setAccount(account);

        // Check which network is active on web3
        const networkId = await web3.eth.net.getId();
        console.log ('networkId: ', networkId);

        // Check if ElFederal has been published on that network
        var networkData = ElFederal.networks[networkId];
        console.log ('ElFederal address: ', networkData.address);
        if (networkData) {
          var contract = new web3.eth.Contract(
            ElFederal.abi,
            networkData.address,
          );
          setElFederal(contract);
          setMinApproval(await contract.methods.minApproval().call());

          var tokenAddress = await contract.methods.tokenEFD().call();
          console.log ('TokenEFD address: ', tokenAddress);
          if (networkData) {
            contract = new web3.eth.Contract(
              TokenEFD.abi,
              tokenAddress,
            );
            setToken(contract);
            setName(await contract.methods.name().call());
          }
        } else {
          window.alert('Smart contract not deployed to detected network.');
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadWeb3().then(() => loadBlockchainData());
  }, []);

  const handleApprove = e => {
    e.preventDefault();

    console.log ('inputApproveAddress: ', inputApproveAddress);
    console.log ('inputApproveValue: ', inputApproveValue);
    setAddress(inputApproveAddress);
    elFederal.methods.approve(inputApproveAddress, inputApproveValue)
      .send({ from: account })
      .once('receipt', receipt => {
        //setData(inputValue);
        console.log ('transaction receipt: ', receipt);
        setInputApproveAddress('');
        setInputApproveValue('');
        elFederal.methods.getApprove(inputApproveAddress).call()
          .then( function(res) {
            console.log ('approvedValue: ', res[0]);
            setApprovedInfo(res);
          });
      });
  };

  const handleRevoke = e => {
    e.preventDefault();

    console.log ('inputRevokeAddress: ', inputRevokeAddress);
    setAddress(inputRevokeAddress);
    elFederal.methods.revoke(inputRevokeAddress)
      .send({ from: account })
      .once('receipt', receipt => {
        console.log ('transaction receipt: ', receipt);
        setInputRevokeAddress('');
        elFederal.methods.getApprove(inputRevokeAddress).call()
          .then( function(res) {
            console.log ('approvedValue: ', res[0]);
            setApprovedInfo(res);
          });  
      });    
  };

  const getApprove = e => {
    e.preventDefault();

    console.log ('inputAddress: ', inputAddress);
    setAddress(inputAddress);
    elFederal.methods
      .getApprove(inputAddress).call()
      .then( function(res) {
        //console.log ('approvedValue: ', res[0]);
        console.log ('res: ', res);
        setApprovedInfo(res);
        setInputAddress('');
      });
  };

  const handleAddWhitelist = e => {
    e.preventDefault();

    console.log ('inputAddWhitelist: ', inputAddWhitelist);
    //convert in array
    var addressList = inputAddWhitelist.split('\n');
    console.log ('addressList: ', addressList);
    elFederal.methods
      .addWhitelist(addressList)
      .send({ from: account })
      .once('receipt', receipt => {
        console.log ('transaction receipt: ', receipt);
        setInputAddWhitelist('');
      });    
  };

  const handleRemoveWhitelist = e => {
    e.preventDefault();

    console.log ('inputRemoveWhitelist: ', inputRemoveWhitelist);
    //convert in array
    var addressList = inputRemoveWhitelist.split('\n');
    console.log ('addressList: ', addressList);
    elFederal.methods
      .removeWhitelist(addressList)
      .send({ from: account })
      .once('receipt', receipt => {
        console.log ('transaction receipt: ', receipt);
        setInputRemoveWhitelist('');
      });    
  };

  const getWhitelistAddress = e => {
    e.preventDefault();

    console.log ('inputAddress: ', inputAddress);
    setAddress(inputAddress);
    token.methods
      .isWhitelisted(inputAddress).call()
      .then( function(res) {
        console.log ('res: ', res);
        setIsWhitelisted(res.toString());
        setInputAddress('');
      });
  };   
  
  return (
    <Container>
      <div className="App">

        <div>
          <h1>ElFederal</h1>
          <Row>
            <Col>
              {account && <p>Account: {account}</p>}
              {elFederal && <p>ElFederal Address: {elFederal._address}</p>}
              {minApproval && <p>minApproval: {minApproval}</p>}
            </Col>
            <Col>
              <h3>ElFederal Token</h3>
              {token && <p>TokenEFD Address: {token._address}</p>}
              {name && <p>Name: {name}</p>}
            </Col>
          </Row>
        </div>

        <Form onSubmit={handleApprove}>
          <Row>
            <Col>
              <Form.Group controlId="formApproveAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control placeholder="Address"
                  onChange={e => setInputApproveAddress(e.target.value)}
                  value={inputApproveAddress}
                />   
              </Form.Group>
            </Col>
            <Col xs="auto">
              <Form.Group controlId="formApproveValue">
                <Form.Label>Value</Form.Label>
                <Form.Control placeholder="Value"
                  onChange={e => setInputApproveValue(e.target.value)}
                  value={inputApproveValue}
                />
              </Form.Group>
            </Col>
            <Button type="submit">Approve send</Button>
          </Row>
          
        </Form>
        
        <Form onSubmit={handleRevoke}>
          <Row>
            <Col>
              <Form.Label>Address</Form.Label>
              <Form.Control placeholder="Address"
                onChange={e => setInputRevokeAddress(e.target.value)}
                value={inputRevokeAddress}
              />
            </Col>
            <Button type="submit">Revoke approve</Button>
          </Row>
        </Form>
          
        <Form onSubmit={getApprove}>
          <Row>
            <Col>
              <Form.Label>Approved information for address</Form.Label>
              <Form.Control placeholder="Address"
                onChange={e => setInputAddress(e.target.value)}
                value={inputAddress}
              />
            </Col>
            <Button type="submit">Get approve information</Button>
          </Row>            
        </Form>
        {approvedInfo && <p>Address: {address} Value: {approvedInfo[0]} Approved Count: {approvedInfo[1]}</p>}

        <Form onSubmit={handleAddWhitelist}>
          <Row>
            <Col>
              <Form.Label>Address list</Form.Label>
              <Form.Control as="textarea" rows="5" placeholder="Addresses list"
                onChange={e => setInputAddWhitelist(e.target.value)}
                value={inputAddWhitelist}
              />
              <Form.Text className="text-muted">
                one address per line
              </Form.Text>
            </Col>            
            <Button type="submit">Add to whitelist</Button>
          </Row>
        </Form>
        
        <Form onSubmit={handleRemoveWhitelist}>
          <Row>
            <Col>
              <Form.Label>Address list</Form.Label>
              <Form.Control as="textarea" rows="5" placeholder="Addresses  list"
                onChange={e => setInputRemoveWhitelist(e.target.value)}
                value={inputRemoveWhitelist}
              />
              <Form.Text className="text-muted">
                one address per line
              </Form.Text>
            </Col>
            <Button type="submit">Remove from whitelist</Button>
            </Row>
        </Form>

        <Form onSubmit={getWhitelistAddress}>
          <Row>
            <Col>
              <Form.Label>Address</Form.Label>
              <Form.Control placeholder="Address"
                onChange={e => setInputAddress(e.target.value)}
                value={inputAddress}
              />            
            </Col>
            <Button type="submit">is whitelisted?</Button>
          </Row>
        </Form>
        {isWhitelisted && <p>Address: {address} is whitelisted: {isWhitelisted}</p>}

      </div>
    </Container>

  );
}

export default App;
