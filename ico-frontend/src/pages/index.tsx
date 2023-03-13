import { BigNumber, Contract, providers, utils } from "ethers";
import { connect } from "http2";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../constants";
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
  // balanceOfStakedPunkTokens keeps track of the number of tokens held by a user
  const [balanceOfStakedPunkTokens, SetbalanceOfStakedPunkTokens] =
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
      const provider = await getProviderOrSigner(false);
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
      const signer = await getProviderOrSigner(true);
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
      const provider = await getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);

      const address = signer.getAddress();

      const balance = await tokenContract.balanceOf(address);
      //set balance
      SetbalanceOfStakedPunkTokens(balance);
    } catch (err) {
      console.error(err);
      SetbalanceOfStakedPunkTokens(zero);
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
   * claimStakedPunkTokens: helps the user to claim their tokens
   */

  const claimStakedPunkTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);

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
      const provider = await getProviderOrSigner();

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

  /**
   * getOwner: gets the owner of the contract by connected address
   */

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _owner = await tokenContract.owner();

      const signer = await getProviderOrSigner(true);

      const address = signer.getAddress();
      if (_owner.toLowerCase() === address.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * withdrawEth: withdraw eth in the contract
   */

  const withdrawEth = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
      window.alert(err.reason);
    }
  };

  /**
   * getProviderOrSigner: gets the provider or signer depending on the parameter that's passed to it
   *
   */
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change network to Goerli");
        throw new Error("Change network to Goerli");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    //if wallet is not connected, create a new instance of web3modal and connect it to metamask
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfStakedPunksTokens();
      getTokensToBeClaimed();
      getOwner();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (loading) {
      return (
        <div className={styles.description}>
          <button className={styles.button}>Loading...</button>
        </div>
      );
      if (tokensToBeClaimed > zero) {
        return (
          <div>
            <div className={styles.description}>
              {tokensToBeClaimed.mul(10)} Tokens can be claimed!
            </div>
            <button className={styles.button} onClick={claimStakedPunkTokens}>
              Claim Tokens
            </button>
          </div>
        );
      }
      //if user doesn't have any tokens to claim, prompt them to mint
      return (
        <div style={{ display: "flex-col" }}>
          <div>
            <input
              type="number"
              placeholder="Number of tokens"
              onChange={(e) => {
                setTokenAmount(BigNumber.from(e.target.value));
              }}
              className={styles.input}
            />
          </div>
          <button
            className={styles.button}
            disabled={!tokenAmount.gt(10)}
            onClick={() => mintCryptoDevToken(tokenAmount)}
          >
            Mint Tokens
          </button>
        </div>
      );
    }
  };
  return (
    <div>
      <Head>
        <title>Staked Punks</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Staked Punks ICO</h1>
          <div className={styles.description}>
            You can mint or claim STPs here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfStakedPunkTokens)}{" "}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
              {isOwner ? (
                <div>
                  {loading ? (
                    <button className={styles.button}>Loading...</button>
                  ) : (
                    <button className={styles.button} onClick={withdrawEth}>
                      Withdraw Coins
                    </button>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by ScrumOpsChainDevBlock
      </footer>
    </div>
  );
}
