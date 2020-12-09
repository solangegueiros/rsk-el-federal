import React, { useState, useEffect } from 'react';
//import Rsk3 from '@rsksmart/rsk3';
import Web3 from 'web3';
import { Button, Card, Col, Form, Container, Row } from "react-bootstrap";
import './App.css';
import ElFederal from "./contracts/ElFederal.json";
import TokenEFD from "./contracts/TokenEFD.json";
import HeadNode from "./contracts/HeadNode.json";
import Node from "./contracts/Node.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [networkId, setNetworkId] = useState(0);

  const [WHITELIST_ROLE, setWHITELIST_ROLE] = useState(null);

  const [account, setAccount] = useState('');
  const [token, setToken] = useState(null);
  const [elFederal, setElFederal] = useState(null);
  const [headNode, setHeadNode] = useState(null);
  const [node, setNode] = useState(null);

  const [required, setRequired] = useState('');  
  const [tokenName, setTokenName] = useState('');  

  const [inputBalanceOfAddress, setInputBalanceOfAddress] = useState();
  const [balanceOf, setBalanceOf] = useState();
  const [inputTransferTokenAddress, setInputTransferTokenAddress] = useState();
  const [inputTransferTokenValue, setInputTransferTokenValue] = useState();  

  const [headNodes, setHeadNodes] = useState(null);  

  const [inputCreateHeadNodeAdmin, setInputCreateHeadNodeAdmin] = useState();
  const [inputCreateHeadNodeName, setInputCreateHeadNodeName] = useState('');

  const [inputApproveValue, setInputApproveValue] = useState(0);
  const [inputApproveAddress, setInputApproveAddress] = useState();  
  const [inputRevokeAddress, setInputRevokeAddress] = useState();

  const [inputGetApproveInfoAddress, setInputGetApproveInfoAddress] = useState('');
  const [address, setAddress] = useState();
  const [approvedInfo, setApprovedInfo] = useState(null, null);

  //HeadNode section
  const [inputSelectHead, setInputSelectHead] = useState('');
  const [headNodeName, setHeadNodeName] = useState(null);

  const [inputCreateNodeName, setInputCreateNodeName] = useState('');
  const [inputCreateNodeAdmin, setInputCreateNodeAdmin] = useState();

  const [inputHeadNodeSendAddress, setInputHeadNodeSendAddress] = useState();
  const [inputHeadNodeSendValue, setInputHeadNodeSendValue] = useState();

  const [nodes, setNodes] = useState(null);
  
  //Node section
  const [inputSelectNode, setInputSelectNode] = useState('');
  const [nodeName, setNodeName] = useState(null);
  const [nodeHead, setNodeHead] = useState(null);

  const [inputAddWhitelist, setInputAddWhitelist] = useState('');
  const [inputRemoveWhitelist, setInputRemoveWhitelist] = useState('');

  const [inputNodeSendAddress, setInputNodeSendAddress] = useState();
  const [inputNodeSendValue, setInputNodeSendValue] = useState(0);
  
  const [inputIsWhitelistedAddress, setInputIsWhitelistedAddress] = useState(null); 
  const [isWhitelistedAddress, setIsWhitelistedAddress] = useState(null); 

  useEffect(() => {
    async function loadWeb3() { 
      //window.web3 = new Rsk3('http://localhost:4444');     
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
      console.log ('window.web3.currentProvider', window.web3.currentProvider);
      //setWeb3(window.web3);
    }
    
    async function loadBlockchainData() {
      try {
        const web3 = window.web3;
        setWeb3(web3);
        console.log ('web3', web3);
       
        setWHITELIST_ROLE(web3.utils.sha3('WHITELIST_ROLE'));
  
        // Load first account
        const [account] = await web3.eth.getAccounts();
        console.log ('account: ', account);
        setAccount(account);

        // Check which network is active on web3
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        console.log ('networkId: ', networkId);

        // Check if Token has been published on that network
        var networkToken = TokenEFD.networks[networkId];        
        if (networkToken) {
          console.log ('TokenEFD address: ', networkToken.address);
          var contract = new web3.eth.Contract(
            TokenEFD.abi,
            networkToken.address,
          );
          setToken(contract);
          setTokenName(await contract.methods.name().call());
        }

        // Check if ElFederal has been published on that network
        var networkData = ElFederal.networks[networkId];
        if (networkData) {
          var contract = new web3.eth.Contract(
            ElFederal.abi,
            networkData.address,
          );
          setElFederal(contract);
          setRequired(await contract.methods.required().call());
          //var tokenAddress = await contract.methods.tokenEFD().call();
          //console.log ('ElFederal balance: ', await tokenEFD.methods.balanceOf(elFederalAddress).call());
          //setElFederalBalance(await contract.methods.balanceOf(elFederalAddress).call());
        } else {
          window.alert('Smart contract not deployed to detected network.');
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadWeb3().then(() => loadBlockchainData());
  }, []);


  function getBalanceOf(e) {
    e.preventDefault();

    console.log ('inputBalanceOfAddress: ', inputBalanceOfAddress);
    try {
      token.methods
      .balanceOf(inputBalanceOfAddress.toLowerCase()).call()
      .then( function(res) {
        //console.log ('approvedValue: ', res[0]);
        console.log ('res: ', res);
        setBalanceOf(res);
        setInputBalanceOfAddress();
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleTransferTokens = e => {
    e.preventDefault();

    console.log ('inputTransferTokenAddress: ', inputTransferTokenAddress);
    try {
      token.methods
      .transfer(inputTransferTokenAddress.toLowerCase(), inputTransferTokenValue)
      .send({ from: account })
      .once('receipt', receipt => {
        console.log ('transaction receipt: ', receipt);
        setInputTransferTokenAddress('');
        setInputTransferTokenValue(0);
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }    
  };

  const handleApprove = e => {
    e.preventDefault();

    console.log ('inputApproveAddress: ', inputApproveAddress);
    console.log ('inputApproveValue: ', inputApproveValue);
    setAddress(inputApproveAddress);
    try {
      elFederal.methods.approve(inputApproveAddress.toLowerCase(), inputApproveValue)
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
          })
          .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleRevoke = e => {
    e.preventDefault();

    console.log ('inputRevokeAddress: ', inputRevokeAddress);
    setAddress(inputRevokeAddress);
    try {
      elFederal.methods.revoke(inputRevokeAddress.toLowerCase())
      .send({ from: account })
      .once('receipt', receipt => {
        console.log ('transaction receipt: ', receipt);
        setInputRevokeAddress('');
        elFederal.methods.getApprove(inputRevokeAddress).call()
          .then( function(res) {
            console.log ('approvedValue: ', res[0]);
            setApprovedInfo(res);
          })
          .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const getApprove = e => {
    e.preventDefault();

    console.log ('inputGetApproveInfoAddress: ', inputGetApproveInfoAddress);
    try {
      elFederal.methods
      .getApprove(inputGetApproveInfoAddress.toLowerCase()).call()
      .then( function(res) {
        //console.log ('approvedValue: ', res[0]);
        console.log ('res: ', res);
        setApprovedInfo(res);
        setInputGetApproveInfoAddress('');
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }

  };

  function getHeadNodesList(e) {
    e.preventDefault();

    try {
      elFederal.methods.listHeadNodes().call()
        .then( function(res) {
          console.log ('listHeadNodes: ', res);
          setHeadNodes(res);
          //(async () => { await instanceHeadNode(res[0]);})();          
          console.log ('headNode - getHeadNodesList: ', headNode);
          getHeadNode(res[0])
        })
        .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  async function getHeadNode(address) {
    console.log ('networkId on instanceHeadNode: ', networkId);
    //console.log ('address', address);

    var networkData = HeadNode.networks[networkId];
    //console.log ('networkData', networkData);
    if (networkData) {
      var contract = new web3.eth.Contract(HeadNode.abi, address.toLowerCase());
      console.log ('headNode contract', contract);
      setHeadNode(contract);      
      setHeadNodeName(await contract.methods.name().call());      
      return contract;
    }
  }

  function getHeadNodeInfo(e) {
    e.preventDefault();

    try {
      getHeadNode(inputSelectHead)
      .then( function(headNode) {
        headNode.methods.name().call()
        .then( function(res) {
          console.log ('name: ', res);
          setHeadNodeName(res);
        })
        //Listar os admins
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  function getNodesList(e) {
    e.preventDefault();

    try {
      getHeadNode(inputSelectHead)
      .then( function(headNode) {
        headNode.methods.listNodes().call()
        .then( function(res) {
          console.log ('listNodes: ', res);
          setNodes(res);
        })
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };


  const handleCreateHeadNode = e => {
    e.preventDefault();

    console.log ('inputCreateHeadNodeAdmin: ', inputCreateHeadNodeAdmin);
    console.log ('inputCreateHeadNodeName: ', inputCreateHeadNodeName);
    try {
      elFederal.methods.createHeadNode(inputCreateHeadNodeAdmin.toLowerCase(), inputCreateHeadNodeName)
      .send({ from: account })
      .once('receipt', receipt => {
        //setData(inputValue);
        console.log ('transaction receipt: ', receipt);
        setInputCreateHeadNodeAdmin();
        setInputCreateHeadNodeName();
        elFederal.methods.listHeadNodes().call()
          .then( function(res) {
            console.log ('listHeadNodes: ', res);
            setHeadNodes(res);
          })
          .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleCreateNode = e => {
    e.preventDefault();

    console.log ('inputSelectHead: ', inputSelectHead);
    console.log ('inputCreateNodeAdmin: ', inputCreateNodeAdmin);
    console.log ('inputCreateNodeName: ', inputCreateNodeName);
    try {
      getHeadNode(inputSelectHead)
      .then( function(headNode) {
        headNode.methods.createNode(inputCreateNodeAdmin.toLowerCase(), inputCreateNodeName)
        .send({ from: account })
        .once('receipt', receipt => {
          console.log ('transaction receipt: ', receipt);
          //setInputCreateNodeHead();
          setInputCreateNodeAdmin();
          setInputCreateNodeName();
        })
        .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };
  
  const handleHeadNodeSend = e => {
    e.preventDefault();

    console.log ('inputSelectHead: ', inputSelectHead);
    console.log ('inputHeadNodeSendAddress: ', inputHeadNodeSendAddress);
    console.log ('inputHeadNodeSendValue: ', inputHeadNodeSendValue);
    try {
      getHeadNode(inputSelectHead)
      .then( function(headNode) {
        headNode.methods.send(inputHeadNodeSendAddress.toLowerCase(), inputHeadNodeSendValue)
        .send({ from: account })
        .once('receipt', receipt => {
          console.log ('transaction receipt: ', receipt);
          setInputHeadNodeSendAddress();
          setInputHeadNodeSendValue();
        })
        .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };
  
  async function getNode(address) {
    //console.log ('networkId on instanceHeadNode: ', networkId);
    //console.log ('address', address);

    var networkData = Node.networks[networkId];
    //console.log ('networkData', networkData);
    if (networkData) {
      var contract = new web3.eth.Contract(Node.abi, address.toLowerCase());
      console.log ('node contract', contract);
      setNode(contract);      
      setNodeName(await contract.methods.name().call());      
      return contract;
    }
  }  

  function getNodeInfo(e) {
    e.preventDefault();

    try {
      getNode(inputSelectNode)
      .then( function(node) {
        node.methods.name().call()
        .then( function(res) {
          console.log ('name: ', res);
          setNodeName(res);
        })
        node.methods.headNode().call()
        .then( function(res) {
          console.log ('nodeHead: ', res);
          setNodeHead(res);
        })        
        //Listar os admins
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleIsWhitelisted = e => {
    e.preventDefault();

    console.log ('inputSelectNode: ', inputSelectNode);
    console.log ('inputIsWhitelistedAddress: ', inputIsWhitelistedAddress);
    //setAddress(inputAddress);
    try {
      getNode(inputSelectNode)
      .then( function(node) {
        node.methods      
        .hasRole(WHITELIST_ROLE, inputIsWhitelistedAddress.toLowerCase()).call()
        .then( function(res) {
          console.log ('res: ', res);
          setIsWhitelistedAddress(res.toString());
          //setInputIsWhitelistedNode('');
          setInputIsWhitelistedAddress('');
        })  
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }    
  };

  const handleAddWhitelist = e => {
    e.preventDefault();

    console.log ('inputAddWhitelist: ', inputAddWhitelist);
    console.log ('WHITELIST_ROLE: ', WHITELIST_ROLE);
    
    //var addressList = inputAddWhitelist.toLowerCase().split('\n');
    //console.log ('addressList: ', addressList);
    try {
      getNode(inputSelectNode)
      .then( function(node) {
        node.methods
        .grantRole(WHITELIST_ROLE, inputAddWhitelist)
        .send({ from: account })
        .once('receipt', receipt => {
          console.log ('transaction receipt: ', receipt);
          //setInputAddWhitelistNode('');
          setInputAddWhitelist('');
        })  
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleRemoveWhitelist = e => {
    e.preventDefault();

    console.log ('inputRemoveWhitelist: ', inputRemoveWhitelist);
    //var addressList = inputRemoveWhitelist.toLowerCase().split('\n');
    //console.log ('addressList: ', addressList);
    try {
      getNode(inputSelectNode)
      .then( function(node) {
        node.methods
        .revokeRole(WHITELIST_ROLE, inputRemoveWhitelist)
        .send({ from: account })
        .once('receipt', receipt => {
          console.log ('transaction receipt: ', receipt);
          //setInputRemoveWhitelistNode('');
          setInputRemoveWhitelist('');
        })  
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  const handleNodeSend = e => {
    e.preventDefault();

    console.log ('inputSelectNode: ', inputSelectNode);
    console.log ('inputNodeSendAddress: ', inputNodeSendAddress);
    console.log ('inputNodeSendValue: ', inputNodeSendValue);
    try {
      getNode(inputSelectNode)
      .then( function(node) {
        node.methods.send(inputNodeSendAddress.toLowerCase(), inputNodeSendValue)
        .send({ from: account })
        .once('receipt', receipt => {
          console.log ('transaction receipt: ', receipt);
          setInputNodeSendAddress();
          setInputNodeSendValue();
        })
        .catch(err => window.alert(err.message));
      })
      .catch(err => window.alert(err.message));
    }
    catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <Container>
      <div className="App">

        <div>
          <h1>ElFederal</h1>
          <Row>
            <Col>
              {account && <p>Account: {account}</p>}
            </Col>
            <Col>
              {elFederal && <p>ElFederal Address: {elFederal._address}</p>}
              {required && <p>required: {required}</p>}
            </Col>
          </Row>
        </div>

        <h2>Token section</h2>
        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body> 
                {token && <p>TokenEFD Address: {token._address}</p>}
                {tokenName && <p>Name: {tokenName}</p>}            
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Form onSubmit={getBalanceOf}>
                  <Form.Group controlId="formGetBalanceOfAddress">
                  <Form.Label>Balance for address</Form.Label>
                    <Form.Control placeholder="Address"
                      onChange={e => setInputBalanceOfAddress(e.target.value)}
                      value={inputBalanceOfAddress}
                    />
                  </Form.Group>                  
                  <Button type="submit">Get balance</Button>
                </Form>
                {balanceOf && <p>Value: {balanceOf}</p>}
              </Card.Body>
            </Card>                        
          </Col>
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <h4>Send tokens</h4>
                <Form onSubmit={handleTransferTokens}>
                  <Form.Group controlId="formTransferTokensAddress">
                    <Form.Label>To address</Form.Label>
                    <Form.Control placeholder="Address"
                      onChange={e => setInputTransferTokenAddress(e.target.value)}
                      value={inputTransferTokenAddress}
                    />
                  </Form.Group>
                  <Form.Group controlId="formTransferTokensValue">
                    <Form.Label>Value</Form.Label>
                    <Form.Control placeholder="Value"
                      onChange={e => setInputTransferTokenValue(e.target.value)}
                      value={inputTransferTokenValue}
                    />
                  </Form.Group>
                  <Button type="submit">Send</Button>
                </Form>
              </Card.Body>
            </Card>            
          </Col>
        </Row>

        <h2>El Federal section</h2>
        <Row>          
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <h4>Approve send to head node</h4>
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
                <h4>Revoke send to head node</h4>
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
            <br/>
            <Card>
              <Card.Body>
              <Col>
                  <Form onSubmit={getApprove}>
                    <Form.Group controlId="formGetApproveInfoAddress">
                    <Form.Label>Approved information for address</Form.Label>
                      <Form.Control placeholder="Address"
                        onChange={e => setInputGetApproveInfoAddress(e.target.value)}
                        value={inputGetApproveInfoAddress}
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
        </Row>
        
        <Row>          
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <h4>Create head nodes</h4>
                <Form onSubmit={handleCreateHeadNode}>
                  <Form.Group controlId="formCreateHeadNodeAdmin">
                    <Form.Label>Admin</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputCreateHeadNodeAdmin(e.target.value)}
                      value={inputCreateHeadNodeAdmin}
                    />
                  </Form.Group>
                  <Form.Group controlId="formCreateHeadNodeName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      placeholder="Head Node Name"
                      onChange={(e) => setInputCreateHeadNodeName(e.target.value)}
                      value={inputCreateHeadNodeName}
                    />
                  </Form.Group>
                  <Button type="submit">Create</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card >
              <Card.Body>
                <h4>Head nodes list</h4>
                <Button onClick={getHeadNodesList}>Get head nodes list</Button>
                <br/>
                {headNodes && headNodes.map((item) =>
                  <li key={item.id}>{item}</li>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h2>Head nodes section</h2>
        <Row>                    
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <h4>Create nodes</h4>
                <Form onSubmit={handleCreateNode}>
                  <Form.Group controlId="formCreateNodeHead">
                    <Form.Label>Head node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectHead(e.target.value)}
                      value={inputSelectHead}
                    />
                  </Form.Group>                  
                  <Form.Group controlId="formCreateNodeAdmin">
                    <Form.Label>Admin</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputCreateNodeAdmin(e.target.value)}
                      value={inputCreateNodeAdmin}
                    />
                  </Form.Group>
                  <Form.Group controlId="formCreateNodeName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      placeholder="Node Name"
                      onChange={(e) => setInputCreateNodeName(e.target.value)}
                      value={inputCreateNodeName}
                    />
                  </Form.Group>
                  <Button type="submit">Create</Button>
                </Form>
              </Card.Body>
            </Card>
            <br/>
            <Card >
              <Card.Body>
                <h4>Nodes list</h4>
                <Form onSubmit={getNodesList}>
                  <Form.Group controlId="formCreateNodeHead">
                    <Form.Label>Head node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectHead(e.target.value)}
                      value={inputSelectHead}
                    />
                  </Form.Group>                  
                  <Button type="submit">Get nodes list</Button>
                </Form>
                <br/>
                {nodes && nodes.map((item) =>
                  <li key={item.id}>{item}</li>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card >              
              <Card.Body>
                <h4>Send to node</h4>
                <Form onSubmit={handleHeadNodeSend}>
                  <Form.Group controlId="formHeadNodeSendHead">
                    <Form.Label>From Head node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectHead(e.target.value)}
                      value={inputSelectHead}
                    />
                  </Form.Group>                   
                  <Form.Group controlId="formHeadNodeSendAddress">
                    <Form.Label>Node address</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputHeadNodeSendAddress(e.target.value)}
                      value={inputHeadNodeSendAddress}
                    />
                  </Form.Group>
                  <Form.Group controlId="formHeadNodeSendValue">
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      placeholder="Amount to send"
                      onChange={(e) => setInputHeadNodeSendValue(e.target.value)}
                      value={inputHeadNodeSendValue}
                    />
                  </Form.Group>
                  <Button type="submit">Send</Button>
                </Form>
              </Card.Body>
            </Card>            
            <br/>
            <Card >
              <Card.Body>
                <h4>Head node info</h4>
                <Form onSubmit={getHeadNodeInfo}>
                  <Form.Group controlId="formHeadNodeInfo">
                    <Form.Label>Head node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectHead(e.target.value)}
                      value={inputSelectHead}
                    />
                  </Form.Group>                  
                  <Button type="submit">Get head node info</Button>
                </Form>
                <br/>
                {headNodeName && <p>Name: {headNodeName} </p> }
              </Card.Body>
            </Card>

          </Col>
        </Row>

        <h2>Nodes section</h2>
        <Row>
          <Col className="mb-2" sm="12" md="6">
            <Card>
              <Card.Body>
                <h4>Add in whitelist</h4>
                <Form onSubmit={handleAddWhitelist}>
                  <Form.Group controlId="formInputAddWhitelistNode">
                    <Form.Label>Node</Form.Label>
                    <Form.Control
                      placeholder="Node Address"
                      onChange={(e) => setInputSelectNode(e.target.value)}
                      value={inputSelectNode}
                    />
                  </Form.Group>
                  <Form.Group controlId="formInputAddWhitelist">
                    <Form.Label>Address</Form.Label>
                    <Form.Control placeholder="Address to whitelist"
                      onChange={e => setInputAddWhitelist(e.target.value)}
                      value={inputAddWhitelist}
                    />
                  </Form.Group>
                  <Button type="submit">Add to whitelist</Button>
                </Form>                
              </Card.Body>
            </Card>
            <br/>
            <Card>
              <Card.Body>
              <h4>Send to address whitelisted</h4>
                <Form onSubmit={handleNodeSend}>
                  <Form.Group controlId="formNodeSendNode">
                    <Form.Label>From node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectNode(e.target.value)}
                      value={inputSelectNode}
                    />
                  </Form.Group>                   
                  <Form.Group controlId="formNodeSendAddress">
                    <Form.Label>To address</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputNodeSendAddress(e.target.value)}
                      value={inputNodeSendAddress}
                    />
                  </Form.Group>
                  <Form.Group controlId="formNodeSendValue">
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      placeholder="Amount to send"
                      onChange={(e) => setInputNodeSendValue(e.target.value)}
                      value={inputNodeSendValue}
                    />
                  </Form.Group>
                  <Button type="submit">Send</Button>
                </Form>              
              </Card.Body>
            </Card>
          </Col>
          <Col className="mb-2" sm="12" md="6">
            <Card >
              <Card.Body>
                <h4>Remove from whitelist</h4>
                <Form onSubmit={handleRemoveWhitelist}>
                  <Form.Group controlId="formInputRemoveWhitelistNode">
                    <Form.Label>Node</Form.Label>
                    <Form.Control
                      placeholder="Node Address"
                      onChange={(e) => setInputSelectNode(e.target.value)}
                      value={inputSelectNode}
                    />
                  </Form.Group>
                  <Form.Group controlId="formInputRemoveWhitelistNode">
                    <Form.Label>Address</Form.Label>
                    <Form.Control placeholder="Address to remove from whitelist"
                      onChange={e => setInputRemoveWhitelist(e.target.value)}
                      value={inputRemoveWhitelist}
                    />
                  </Form.Group>
                  <Button type="submit">Remove from whitelist</Button>
                </Form>
              </Card.Body>
            </Card>
            <br/>
            <Card>
              <Card.Body>
                <h4>Is whitelisted?</h4>
                <Form onSubmit={handleIsWhitelisted}>
                  <Form.Label>Node</Form.Label>
                  <Form.Control
                    placeholder="Node Address"
                    onChange={(e) => setInputSelectNode(e.target.value)}
                    value={inputSelectNode}
                  />                  
                  <Form.Label>Address</Form.Label>
                  <Form.Control placeholder="Address"
                    onChange={e => setInputIsWhitelistedAddress(e.target.value)}
                    value={inputIsWhitelistedAddress}
                  />
                  <Button type="submit">Is whitelisted</Button>
                </Form>
                {isWhitelistedAddress && <p>is whitelisted: {isWhitelistedAddress}</p>}
              </Card.Body>
            </Card>
            <br/>
            <Card>
              <Card.Body>
                <h4>Node info</h4>
                <Form onSubmit={getNodeInfo}>
                  <Form.Group controlId="formNodeInfo">
                    <Form.Label>Node</Form.Label>
                    <Form.Control
                      placeholder="Address"
                      onChange={(e) => setInputSelectNode(e.target.value)}
                      value={inputSelectNode}
                    />
                  </Form.Group>                  
                  <Button type="submit">Get node info</Button>
                </Form>
                <br/>
                {nodeName && <p>Name: {nodeName} </p> }
                {nodeHead && <p>Head node: {nodeHead} </p> }
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </div>
    </Container>

  );
}

export default App;
