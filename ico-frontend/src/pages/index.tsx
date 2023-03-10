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
//Types

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

  /**
   * getTokensToBeClaimed: get the number of tokens that can be claimed by the user
   */
  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      //create instance of NFT Contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract: Contract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      //get signer from wallet connect to metamastk
      const signer = getProviderOrSigner(true);
      //grab signer's address
      const address: string = signer.getAddress();
      //get signer's balance(number of NFTs held by user)
      const balance = nftContract.balanceOf(address);

      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        let amount: number = 0;
        // for all NFTs held by user, check if the tokens have already been claimed
        // only increase amount if tokens have not been claimed for an NFT(for a given tokenId)
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };
  /**
   * getBalanceOfStakedPunksTokens: check the balance of STPTokens held by an address
   */
  const getBalanceOfStakedPunksTokens = async () => {
    try {
      const provider = getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = getProviderOrSigner(true);

      const address = signer.getAddress();

      const balance = await tokenContract.balanceOf(address);
      //set balance
      SetBalanceOfCryptoDevTokens(balance);
    } catch (err) {
      console.error(err);
      SetBalanceOfCryptoDevTokens(zero);
    }
  };
  /**
   * mintCryptoDevToken: mints `amount` number of tokens to a given address
   */
  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully minted Crypto Dev Tokens");
      await getBalanceOfStakedPunksTokens();
      await getTokensToBeClaimed();
      await getTotalTokensMinted();
    } catch (err) {
      console.error(err);
    }
  };
  /**
   * claimTokensToBeClaimed: helps the user to claim their tokens
   */

  const claimTokensToBeClaimed = async () => {
    try {
      const signer = getProviderOrSigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      window.alert("Successfuly claimed tokens");
      await getBalanceOfStakedPunksTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getTotalTokensMinted - gets the total amount of tokens that have been minteds
   */

  const getTotalTokensMinted = async () => {
    try {
      const provider = getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _totalSupply = tokenContract.maxSupply();
      setTokensMinted(_totalSupply);
    } catch (error) {
      console.error(error);
    }
  };
}
