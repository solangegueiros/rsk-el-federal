import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, Card, Col, Form, Container, Row } from "react-bootstrap";
// import Container from 'react-bootstrap/Container';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import './App.css';
import ElFederal from "./contracts/ElFederal.json";
import TokenEFD from "./contracts/TokenEFD.json";
//import Register from "./contracts/Register.json";

function App() {
  const [account, setAccount] = useState('');
  const [elFederal, setElFederal] = useState(null);
  const [token, setToken] = useState(null);  
  const [name, setName] = useState('');
  const [required, setRequired] = useState('');  

  const [inputApprove, setInputApprove] = useState('', 0);
  const [inputApproveValue, setInputApproveValue] = useState(0);
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
      //window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'));
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
        if (networkData) {
          console.log ('ElFederal address: ', networkData.address);
          var contract = new web3.eth.Contract(
            ElFederal.abi,
            networkData.address,
          );
          setElFederal(contract);
          setRequired(await contract.methods.required().call());

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
        setInputApproveValue(0);
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
   
  
  return (
    <Container>
      <div className="App">

        <div>
          <h1>ElFederal</h1>
          <Row>
            <Col>
              {account && <p>Account: {account}</p>}
              {elFederal && <p>ElFederal Address: {elFederal._address}</p>}
              {required && <p>required: {required}</p>}
            </Col>
            <Col>
              <h3>ElFederal Token</h3>
              {token && <p>TokenEFD Address: {token._address}</p>}
              {name && <p>Name: {name}</p>}
            </Col>
          </Row>
        </div>

        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <Form onSubmit={handleApprove}>
                  <Form.Group controlId="formApproveAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputApproveAddress(e.target.value)}
                      value={inputApproveAddress}
                    />
                  </Form.Group>
                  <Form.Group controlId="formApproveValue">
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      placeholder="Value"
                      onChange={(e) => setInputApproveValue(e.target.value)}
                      value={inputApproveValue}
                    />
                  </Form.Group>
                  <Button type="submit">Approve send</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <Form onSubmit={handleRevoke}>
                  <Form.Group controlId="formRevokeAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputRevokeAddress(e.target.value)}
                      value={inputRevokeAddress}
                    />
                  </Form.Group>
                  <Button type="submit">Revoke</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card className="mb-2" sm="12" md="6">
              <Card.Body>
              <Col>
                  <Form onSubmit={getApprove}>
                    <Form.Group controlId="formGetApproveInfoAddress">
                    <Form.Label>Approved information for address</Form.Label>
                      <Form.Control placeholder="Address"
                        onChange={e => setInputAddress(e.target.value)}
                        value={inputAddress}
                      />
                    </Form.Group>                  
                    <Button type="submit">Get approve information</Button>
                  </Form>
                </Col>
                <Row>
                  {approvedInfo && <p>Address: {address} <br/> Value: {approvedInfo[0]} <br/> Approved Count: {approvedInfo[1]}</p>}
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card >
              <Card.Body>
                <Col>
                  <Form onSubmit={getWhitelistAddress}>
                    <Form.Group controlId="formGetWhitelistAddress">
                      <Form.Label>Address</Form.Label>
                      <Form.Control placeholder="Address"
                        onChange={e => setInputAddress(e.target.value)}
                        value={inputAddress}
                      />
                    </Form.Group>
                    <Button type="submit">is whitelisted?</Button>
                  </Form>
                </Col>
                {isWhitelisted && <p>Address: {address} <br/> is whitelisted: {isWhitelisted}</p>}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card >
              <Card.Body>
              <Form onSubmit={handleAddWhitelist}>
                <Form.Label>Address list</Form.Label>
                <Form.Control as="textarea" rows="5" placeholder="Addresses list"
                  onChange={e => setInputAddWhitelist(e.target.value)}
                  value={inputAddWhitelist}
                />
                <Form.Text className="text-muted">
                  one address per line
                </Form.Text>
                <Button type="submit">Add to whitelist</Button>
              </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col className="mb-2" sm="12" md="6">
            <Card >
              <Card.Body>
                <Form onSubmit={handleRemoveWhitelist}>
                  <Form.Label>Address list</Form.Label>
                  <Form.Control as="textarea" rows="5" placeholder="Addresses  list"
                    onChange={e => setInputRemoveWhitelist(e.target.value)}
                    value={inputRemoveWhitelist}
                  />
                  <Form.Text className="text-muted">
                    one address per line
                  </Form.Text>
                  <Button type="submit">Remove from whitelist</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card >
              <Card.Body>
              </Card.Body>
            </Card>
          </Col>
          <Col className="mb-2" sm="12" md="6">
            <Card >
              <Card.Body>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </div>
    </Container>

  );
}

export default App;
