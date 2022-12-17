import { useState } from 'react'
import { ethers } from 'ethers'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

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
    const signer = provider.getSigner()

    let contract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)

    let transaction = await contract.propose(formInput.description)
    let transactionRes = await transaction.wait()
    console.log(transactionRes)
   
  }

  return (
    
<div className="flex justify-center">
<div className="w-1/2 flex flex-col pb-12">

         
           
            <textarea
            placeholder="Proposal Description"
            className="mt-2"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />

      
          <button onClick={listProposal} className="mt-4 w-full bg-pink-500 font-bold py-2 px-12 rounded">Create proposal</button>
        </div>

</div>

  )
}