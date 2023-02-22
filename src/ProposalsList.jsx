// import { ethers } from 'ethers'
// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import Web3Modal from 'web3modal'
// import { useRouter } from 'next/router'

// import {
//   FIDcontractAddress
// } from '../config';

// import FID from '../artifacts/contracts/FID.sol/FID.json';

// export default function MyAssets() {
//   const [nfts, setNfts] = useState([])
//   const [loadingState, setLoadingState] = useState('not-loaded')
//   const router = useRouter()
//   useEffect(() => {
//     loadProposals()
//   }, [])
//   async function loadProposals() {
//     const web3Modal = new Web3Modal({
//       network: "testnet",
//       cacheProvider: true,
//     })
//     const connection = await web3Modal.connect()
//     const provider = new ethers.providers.Web3Provider(connection)
//     const signer = provider.getSigner()

//     const FIDContract = new ethers.Contract(FIDcontractAddress, FID.abi, signer)
//     const data = await FIDContract.fetchProposals()

//     const items = await Promise.all(data.map(async i => {
//       //const tokenURI = await FIDContract.tokenURI(i.tokenId)
//       //const meta = await axios.get(tokenURI)
//       //let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
//       let item = {

//         name: i.name,
//         description: i.description,
//         forVotes: i.forVotes.toNumber(),
//         againstVotes: i.againstVotes.toNumber(),
//         succeeded: i.succeeded.toString()
//       }
//       return item
//     }))
//     setNfts(items)
//     setLoadingState('loaded') 
//   }
//   function listNFT(nft) {
//     console.log('nft:', nft)
//     router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
//   }
//   if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
//   return (
//     <div className="flex justify-center">
//       <div className="p-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
//           {
//             nfts.map((nft, i) => (
//               <div key={i} className="border shadow rounded-xl overflow-hidden">
//                 <img src={nft.image} className="rounded" />
//                 <div className="p-4 bg-black">
//                   <p className="text-2xl font-bold text-white">Price -  Eth</p>
//                   <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
//                 </div>
//               </div>
//             ))
//           }
//         </div>
//       </div>
//     </div>
//   )
// }