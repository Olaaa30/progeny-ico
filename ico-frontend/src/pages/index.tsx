import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  //create a bignumber 0
  const zero = BigNumber.from(0);
  //keep track of whether user's wallet is connected
  const [walletConnected, setWalletConnected] = useState(false);
  //loading is set to true when a transaction is pending
  const [loading, setLoading] = useState(false);
  // tokensToBeClaimed is used to keep track of the tokens that can be claimed
  // based on the StakedPunk NFTs held by the user for which they haven't claimed the tokens
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  // balanceOfCryptoDevTokens keeps track of the number of tokens held by a user
  const [balanceOfCryptoDevTokens, SetBalanceOfCryptoDevTokens] =
    useState(zero);
  //amount of tokens that user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  // tokensMinted keeps track of the total number of STP tokens that have been minted
  // out of a max supply of 10000
  const [tokensMinted, setTokensMinted] = useState(zero);
  //isOwner gets the owner of the contract through the signed address
  const [isOwner, setIsOwner] = useState(false);
  //create a reference to web3modal which will be used to connect Metamask
  const web3ModalRef = useRef();
}
