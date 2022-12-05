import { useState } from 'react'
import { ethers } from 'ethers'

import {
    FIDcontractAddress
  } from '../config';
  
import FID from '../artifacts/contracts/FID.sol/FID.json';


export default function Proposals() {
  //const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ description: '' })

  async function listProposal() {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    /* next, create the item */
    
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
        {/* <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        /> */}
        <textarea
          placeholder="Proposal Description"
          className="mt-2"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <button onClick={listProposal}>
          Create proposal
        </button>
      </div>
    </div>
  )
}