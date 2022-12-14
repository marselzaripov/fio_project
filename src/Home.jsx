import React, { Component } from 'react'
import { ethers } from 'ethers'
import { ConnectWallet } from '../components/ConnectWallet'

// import auctionAddress from '../contracts/DutchAuction-contract-address.json'
// import auctionArtifact from '../contracts/DutchAuction.json'

import {
    FIDcontractAddress
  } from '../config';
  
  import FID from '../artifacts/contracts/FID.sol/FID.json';

const HARDHAT_NETWORK_ID = '97'
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

export default class Home extends Component {
  constructor(props) {
    super(props)

    this.initialState = {
      selectedAccount: null,
      txBeingSent: null,
      networkError: null,
      transactionError: null,
      balance: null,
    }

    this.state = this.initialState
  }

  

  _connectWallet = async () => {
    if(window.ethereum === undefined) {
      this.setState({
        networkError: 'Please install Metamask!'
      })
      return
    }

    const [selectedAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    
    if(!this._checkNetwork()) { return }

    this._initialize(selectedAddress)

    window.ethereum.on('accountsChanged', ([newAddress]) => {
      if(newAddress === undefined) {
        return this._resetState()
      }

      this._initialize(newAddress)
    })

    window.ethereum.on('chainChanged', ([networkId]) => {
      this._resetState()
    })

    window.sessionStorage.setItem('wallet', selectedAddress)
  }

  async _initialize(selectedAddress) {
    this._provider = new ethers.providers.Web3Provider(window.ethereum)

    this._contract = new ethers.Contract(
        FIDcontractAddress,
        FID.abi,
      this._provider.getSigner(0)
    )

    // let faceio;
    // faceio = new faceIO("fioa47b9");

    // let response = await faceio.enroll({
    //     locale: "auto",
    //     payload: {
    //       email: "developermars0@gmail.com",
    //       pin: "12345",
    //     },
    //   });

    //   console.log(` Unique Facial ID: ${response.facialId}`);



    this.setState({
      selectedAccount: selectedAddress
    }, 
    async () => {
      await this.updateBalance()
    }
    )
    // let faceIdBytes = bytes32(response.facialId)
    // let transaction = await this._contract.setAddressToFaceid(selectedAddress, faceIdBytes)
    // let transactionRes= await transaction.wait()
    // console.log(transactionRes)
  }

  async updateBalance() {
    const newBalance = (await this._provider.getBalance(
      this.state.selectedAccount
    )).toString()

    this.setState({
      balance: newBalance
    })
  }

  _resetState() {
    this.setState(this.initialState)
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) { return true }

    this.setState({
      networkError: 'Please connect to localhost:8545'
    })

    return false
  }

  _dismissNetworkError = () => {
    this.setState({
      networkError: null
    })
  }

  render() {
    if(!this.state.selectedAccount) {
      return <ConnectWallet
        connectWallet={this._connectWallet}
        networkError={this.state.networkError}
        dismiss={this._dismissNetworkError}
      />
    }


    return(
      <>
        {this.state.balance &&
          <p>Your balance: {this.state.selectedAccount} ETH</p>}
      </>
    )
  }
}