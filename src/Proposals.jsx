import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";

import {
    FIDcontractAddress
  } from '../config';
  
import FID from '../artifacts/contracts/FID.sol/FID.json';


export default function Proposals() {
  //const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ description: '' })

  async function listProposal() {
    
    // const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545")
    // const ethPrivkey = "49ee088b9bcda1b6b8f8cde688193e67bbbc41602deeef0454bd838b3f414cb7"
    // const wallet = new ethers.Wallet(ethPrivkey, provider)
    // const signer = provider.getSigner(wallet.address)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner()
    let contract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)
    let transaction = await contract.propose(formInput.name, formInput.description)
    let transactionRes = await transaction.wait()
    console.log(transactionRes)
   
  }

  // async function checkfio() {
  //   console.log(items)
  // }

  async function fio() {
      const [items, setItems] = useState([]);
      //faceio api call from backend, save face id only in backend
      let faceio;
      faceio = new faceIO("fioa669e");

      let response = await faceio.enroll({
          locale: "auto",
          payload: {
            email: "developermars1@gmail.com",
            pin: "12345",
          },
        });

        //console.log(` Unique Facial ID: ${response.facialId}`);

        // let faceIdBytes = bytes32(response.facialId)
        // let transaction = await this._contract.setAddressToFaceid(selectedAddress, faceIdBytes)
        // let transactionRes= await transaction.wait()
        // console.log(transactionRes)
  }

  return (
    <Container>
    <Form>
    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" onChange={e => updateFormInput({ ...formInput, name: e.target.value })}>
      <Form.Label>Name</Form.Label>
      <Form.Control type="name" placeholder="name" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" onChange={e => updateFormInput({ ...formInput, description: e.target.value })}>
      <Form.Label>Description</Form.Label>
      <Form.Control as="textarea" rows={3}  />
    </Form.Group>
    <Button variant="primary" onClick={listProposal}>
        Submit
      </Button>
      <Button variant="primary" onClick={fio}>
        Face id identify
      </Button>
      {/* <Button variant="primary" onClick={checkfio}>
        check
      </Button> */}
  </Form>
  </Container>
    

  )
}
