import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import {
    FIDcontractAddress
  } from '../config';
  
import FID from '../artifacts/contracts/FID.sol/FID.json';


export default function Manifest() {
  //const [fileUrl, setFileUrl] = useState(null)
  //const [formInput, updateFormInput] = useState({ description: '' })

  const [proposals, setProposals] = useState([])
//   const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    listProposal()
  }, [])

  async function listProposal() {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    /* next, create the item */
    
    const fidContract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)

    const data = await fidContract.getAllProposals()
    console.log(data)
    const items = await Promise.all(data.map(async i => {
      let item = {
        succeeded: i.succeeded,
        description: i.description
      }
      return item
    }))
    setProposals(items)
    //setLoadingState('loaded') 
   
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      {
            proposals.map((proposal, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
            
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{proposal.description}</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded">List</button>
                </div>
              </div>
            ))
          }
      </div>
    </div>
  )
}