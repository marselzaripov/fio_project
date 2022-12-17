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
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    listProposal()
  }, [])

  async function listProposal() {

      //TODO: jsonRpcProvider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const fidContract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)

    const data = await fidContract.getAllProposals()
    console.log(data)
    const items = await Promise.all(data.map(async i => {
      let item = {
        description: i.description
      }
      return item
    }))
    setProposals(items)
    setLoadingState('loaded') 
   
  }

  async function voteFor(proposalId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const fidContract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)
    const transaction = await fidContract.vote(proposalId, 1, {
      gasLimit: 100000
    })
    await transaction.wait()
  }

  async function voteAgainst(proposalId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const fidContract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi, 
        signer)
    const transaction = await fidContract.vote(proposalId, 0, {
      gasLimit: 100000
    })
    await transaction.wait()
  }

  
  if (loadingState === 'loaded' && !proposals.length) return (<h1 className="px-20 py-10 text-3xl">No items</h1>)
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
      {
            proposals.map((proposal, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
            
                <div className="p-4">
                  <p className="text-2xl font-bold">{proposal.description}</p>
                  <button onClick={() => voteFor(i)} className="mt-4 w-full bg-pink-500 font-bold py-2 px-12 rounded">vote for</button>
                  <button onClick={() => voteAgainst(i)} className="mt-4 w-full bg-pink-500 font-bold py-2 px-12 rounded">vote against</button>
                </div>
              </div>
            ))
          }
      </div>
    </div>
  )
}