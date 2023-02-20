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

//change Home class to functional component
export default function Home() {  
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [txBeingSent, setTxBeingSent] = useState(null)
  const [networkError, setNetworkError] = useState(null)
  const [transactionError, setTransactionError] = useState(null)
  const [balance, setBalance] = useState(null)

  const _connectWallet = async () => {
    if(window.ethereum === undefined) {
      setNetworkError('Please install Metamask!')
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
  
  const _initialize = async (selectedAddress) => {
    this._provider = new ethers.providers.Web3Provider(window.ethereum)

    this._contract = new ethers.Contract(
      FIDcontractAddress,
      FID.abi,
      this._provider.getSigner(selectedAddress)
    )

    this._contract.on('Transfer', (from, to, amount) => {
      this._updateBalance()
    })

    this._updateBalance()
    this.setState({
      selectedAccount: selectedAddress,
      networkError: null,
      transactionError: null,
    })
  }

  const _checkNetwork = () => {
    if(window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this.setState({
        networkError: 'Please connect to the Binance Smart Chain Testnet!'
      })
      return false
    }

    return true

  }

  const _dismissNetworkError = () => {
    this.setState({
      networkError: null
    })
  }

  const _updateBalance = async () => {
    const newBalance = (await this._provider.getBalance(
      this.state.selectedAccount
    )).toString()

    this.setState({
      balance: newBalance
    })
  }

  const _resetState = () => {
    this.setState(this.initialState)
  }

  const _dismissTransactionError = () => {
    this.setState({
      transactionError: null
    })
  }

  const _sendTransaction = async () => {
    if(!this._checkNetwork()) { return }
    
    this.setState({
      txBeingSent: true
    })

    try {
      const transaction = await this._contract.bid({
        value: ethers.utils.parseEther('0.1')
      })

      await transaction.wait()

      this.setState({
        txBeingSent: false
      })
    } catch (err) {
      console.error(err)

      if(err.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        this.setState({
          txBeingSent: false
        })
      } else {
        this.setState({
          txBeingSent: false,
          transactionError: err.message
        })

      }
    }
  }

  const _withdraw = async () => {
    if(!this._checkNetwork()) { return }

    this.setState({
      txBeingSent: true
    })

    try {
      const transaction = await this._contract.withdraw()

      await transaction.wait()

      this.setState({
        txBeingSent: false
      })
    } catch (err) {
      console.error(err)

      if(err.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        this.setState({
          txBeingSent: false
        })
      } else {
        this.setState({
          txBeingSent: false,
          transactionError: err.message
        })  
      }
    }
  }

  const _renderTransactionError = () => {
    if(this.state.transactionError === null) { return null }

    return (
      <div className="alert alert-danger" role="alert">
        {this.state.transactionError}
        <button type="button" className="btn-close" onClick={this._dismissTransactionError}></button>
      </div>
    )
  }

  const _renderNetworkError = () => {
    if(this.state.networkError === null) { return null }

    return (
      <div className="alert alert-danger" role="alert">
        {this.state.networkError}
        <button type="button" className="btn-close" onClick={this._dismissNetworkError}></button>
      </div>
    )
  }

  const _renderConnectButton = () => {
    if(this.state.selectedAccount !== null) { return null }

    return (
      <button className="btn btn-primary" onClick={this._connectWallet}>
        Connect Wallet
      </button>
    )
  }

  const _renderBidButton = () => {
    if(this.state.selectedAccount === null) { return null }

    return (
      <button className="btn btn-primary" onClick={this._sendTransaction}>
        Bid
      </button>
    )
  }

  const _renderWithdrawButton = () => {
    if(this.state.selectedAccount === null) { return null }
    
    return (
      <button className="btn btn-primary" onClick={this._withdraw}>
        Withdraw
      </button>
    )
  }

  const _renderBalance = () => {
    if(this.state.selectedAccount === null) { return null }

    return (
      <div>
        <p>Balance: {ethers.utils.formatEther(this.state.balance)} ETH</p>
      </div>
    )
  }

  const _renderTxBeingSent = () => {
    if(!this.state.txBeingSent) { return null }

    return (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    )

  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>FID Auction</h1>
          <p>Current Bid: 0.1 ETH</p>
          {this._renderConnectButton()}
          {this._renderBidButton()}
          {this._renderWithdrawButton()}
          {this._renderBalance()}
          {this._renderTxBeingSent()}
          {this._renderNetworkError()}
          {this._renderTransactionError()}
        </div>
      </div>
    </div>
  )
}



