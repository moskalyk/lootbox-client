import React, { useState, useEffect } from 'react'
import { Button, Modal, Box, Spinner, useTheme } from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'
import { useOpenConnectModal, signEthAuthProof } from '@0xsequence/kit'
import { useDisconnect, useAccount, useWalletClient } from 'wagmi'
import { ethers } from "ethers";
import {contractABI as abi} from './abi.ts'
import maze from './assets/maze.png'
import socketIOClient from "socket.io-client";
import { SequenceIndexer } from '@0xsequence/indexer'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'

import './lootExpanse/styles.css'

const ENDPOINT = "http://localhost:3000";  // Change this to your server's address
const contractAddress = "0xc8a3e4268e9fccaeedb26c0fb22e7653c76d2771";

let init = false
let count = 0
let socket = null
// let inDungeon_ = true; 
function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { data: walletClient }: any = useWalletClient({chainId: 56})
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const {setTheme} = useTheme()

  // const [socket, setSocket] = useState<any>(null);

  const [isOpen, toggleModal] = useState(false)
  const [treasureIsOpen, setTtreasureIsOpen] = useState(false)
  const [image, setImage] = useState<any>(null)
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [title, setTitle] = useState('')
  const [inDungeon, setInDungeon] = useState(true)

  const { setOpenWalletModal } = useOpenWalletModal()

  setTheme('dark')

  // const [mutex, setMutex] = useState(false)
  const [items, setItems] = useState([])

  const [loaded, setLoaded] = useState(false);
  const [space, setSpace] = useState(false);

  useEffect(() => {
    
  }, [loaded])

  useEffect(() => {
    
  }, [inDungeon])

  useEffect(() =>{

  }, [items])

  const [loadCount, setLoadCount] = useState(0);

  const handleImageLoaded = () => {
    // setLoaded(true);
    setLoadCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    if (loadCount === items.length) {
      setLoaded(true);
      setSpace(true)
      console.log('loaded', loaded)
    const elements = document.querySelectorAll('.standin');

    elements.forEach(el => {
      el.parentNode.removeChild(el);
    });
    }
  }, [loadCount, items.length, space]);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      // if (event.origin !== 'http://localhost:8000') {
      //     // Security check: Ensure that the message is from a trusted source
      //     return;
      // }
    
      // Handle the message
      console.log('Message received from iframe:', event.data);
      console.log(event.data.portal == 'loot' && count == 0)
      console.log(count)
      if(event.data.portal == 'loot' && count == 0){
        console.log('IN HERE')
        setInDungeon(false)
        // console.log(inDungeon_)
        // inDungeon_ = false
        // console.log(inDungeon_)
        // setMutex(true)
        mint()
        count++
      }
    });
  }, [])

  useEffect(() => {

  }, [socket, loadingTreasure])


  useEffect(() => {
    setTimeout(async () => {
      if(isConnected && !init){
        console.log(init)
        init = true
        console.log(init)
        const proof = await signEthAuthProof(walletClient)
        const socketRaw = await socketIOClient(ENDPOINT, {
            query: {
              address: address,
              token: proof?.proofString  // Replace with your actual token
            }
        })
        // console.log(socketRaw)
        socket = socketRaw
        // setSocket(socketRaw)
      }
    }, 0)
  },[isConnected])

  const onClick = () => {
    setOpenConnectModal(true)
  }

  const mint = async () => {
    console.log(socket)
    // setTimeout(async () => {
    //   const res = await fetch('http://0.0.0.0:5000')
    //   const json = await res.json()
    //   setItems([json.armor, json.weapon])
    //   // setTimeout(() => {
    //   //   setLoaded(true);
    //   // }, 1000);
    //   // document.getElementById('standin')
    //   // If the element exists, remove it


    // }, 0);
    setLoadingTreasure(true)
    // setTtreasureIsOpen(true)

    // ERC-1155 contract ABI and address
    // Create a contract instance
    // const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/bsc-testnet');

    // const contract = new ethers.Contract(contractAddress, abi, provider);

    // contract.on("TransferSingle", async (operator, from, to, id, value, event) => {
    //   console.log(to)
    //     if(to == address){
    //       const res = await fetch(`https://metadata.sequence.app/tokens/bsc-testnet/${`0xf744f684a054b142418148abbd9a917f9fae7eaf`}/${id.toString()}`)
    //       const json = await res.json()
    //       setImage(json[0].image)
    //       setTitle(json[0].name)
    //       toggleModal(true)
    //       setLoadingTreasure(false)
    //     }
    // });
    
    const proof = await signEthAuthProof(walletClient)
    
    socket.emit('collect', {proof: proof, address: address})
    console.log(socket.id)

    socket.on('disconnected', ()=> {
      console.log('disconnected')
      init =false
    })

    socket.on('test', async (data: any) => {
      console.log(data)
      console.log('testing')
    })

    socket.on('loot', async (data: any) => {
      console.log(data)
      // let response = await fetch(data + '/0.json') // update to get tokenID

      // const text = await response.text()
      // const json = JSON.parse(text)
      // console.log(json)
      // setTxHash(data)
      console.log(data[1].data)
      console.log(data[1].data.url)
      let interval = setInterval(async () => {
        const res = await fetch(data[1].data.url)
        console.log(res.status)
        if(res.status == 200){
          setLoaded(true)
          clearInterval(interval)
          setLoadingTreasure(false)
          setItems([data[1].data])
        }
      }, 5000)

      // setImage(data[0].image)
      // setTitle(data[0].name)

      // const indexer = new SequenceIndexer('https://bsc-testnet-indexer.sequence.app', 'c3bgcU3LkFR9Bp9jFssLenPAAAAAAAAAA')

      // // try any account address you'd like :)
      // const filter = {
      //   accountAddress: address
      // }

      // // query Sequence Indexer for all token transaction history on Polygon
      // const transactionHistory = await indexer.getTransactionHistory({
      //   filter: filter,
      //   includeMetadata: true
      // })
        
      // console.log('transaction history in account:', transactionHistory)

      // transactionHistory.transactions.map((transaction: any, i: any) => {
      //   if(i == 0){
      //     transaction.transfers.map(async (transfer: any) => {
      //       transfer.tokenIds
      //       const res = await fetch(`https://metadata.sequence.app/tokens/bsc-testnet/${contractAddress}/${transfer.tokenIds[0]}`)
      //       const json = await res.json()
      //       console.log(json)
      //       setImage(json[0].image)
      //       setTitle(json[0].name)
      //       toggleModal(true)
      //       setLoadingTreasure(false)
      //     })
      //   }
      // })

      // setImage(json.image)
      // setTitle(json.name)
      // toggleModal(true)
      // setLoadingTreasure(false)
    })

    // Maybe a quick response toggle for 5-10 seconds vs. 60 seconds
    // let response = await fetch('http://localhost:8000/api', {
    //   method: 'POST',
    //   headers: {
    //       'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ proof: proof.proofString, address: address })
    // });

    // if(response.status == 200){
    //     const hash = await response.text()
    //     console.log(hash)
    //     setTxHash(JSON.parse(hash).txHash)
    // } else {
    //   alert('Something went wrong with the request, check the console and try again.')
    // }
  }
  return (
    <>
      {
        !
          isConnected 
        ? 
          <>
            <div style={{
              justifyContent: 'center',
              width: '100vw',
              }}
            >
              <br/>
            <Box justifyContent={'center'}>
              <p>l o o t b o x</p>
            </Box>
            <br/>
            <Box justifyContent={'center'}>
              <img src={maze} width={200}/>
            </Box>
            <br/>
            <Box justifyContent={'center'}>
              <p>... you've made your way <br/> through the internet, <br/>and you've found yourself <br/>here</p>
            </Box>
            <br/>
            <br/>
            <Box justifyContent={'center'}>
              <Button label="connect" onClick={() => onClick()}/>
            </Box>
            </div>
          </>
        :
          <>
          {
            inDungeon 
            ? 
            <div>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => disconnect()}>
              sign out
              </div>

              <div className='container'>
                <iframe src="http://localhost:8001" width={window.innerWidth} height={window.innerHeight*.76} ></iframe>
              </div>
            </div>
            :
            <>
            <br/>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => disconnect()}>
              sign out
            </div>
            { !loadingTreasure ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', left: '30px'}} onClick={() => {setInDungeon(true);count=0;setItems([])}}>
              <Button label='play again?'/>
            </div> : null}
            <br/>
            {
                loadingTreasure 
              ? 
                <div style={{
                  position: 'fixed', 
                  top: '50%',       
                  left: '50%',      
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                }}
                >
                  <Spinner/>
                </div>
              : 
                null
            }
            <div className='doesnt-work' style={{
                  display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
              }}
              // onClick={() => {if(!treasureIsOpen) {mint()}}}
               >
                <br/>
                <br/>
                {loaded ? <div className={`items-container fade-in`} style={{width: '100vw', marginTop: '20px', overFlow: 'auto'}}>
                {items.map((item, index) => (
                  <div key={index} className="frame" tier={item.tier}>
                    <div className="view" tier={item.tier}>
                      <img
                        style={{ width: '266px' }}
                        src={item.url}
                        onLoad={handleImageLoaded}
                      />
                      <div className='standin' style={{ width: '266px', height: '266px'}} ></div>
                    </div>
                    <h1 className={`name_${item.tier}`}>
                      {item.name}
                    </h1>
                    <h2 className={`name_${item.tier}`}>
                      {item.tier} {item.type}
                    </h2>
                    <hr className="half" />
                    <ul>
                      {item.main_stats.map((stat, index) => (
                        <React.Fragment key={index}>
                          <li className={item.category}>{stat}</li>
                          {item.stats.map((stat, statIndex) => (
                            <li key={statIndex}>{stat}</li>
                          ))}
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                ))}
                  { !loadingTreasure ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', right: '30px'}}>
                    <Button label='open wallet' onClick={() => setOpenWalletModal(true)}/>
                  </div> : null }
              </div> : null }
               {/* <div className='container'>
                <iframe src="http://localhost:5174" width={window.innerWidth} height={window.innerHeight*.93} ></iframe>
              </div> */}
            {/* <spline-viewer width={630} height={600} url="https://prod.spline.design/dDjLCxxNJzkswRyq/scene.splinecode"></spline-viewer> */}
            </div>
            <AnimatePresence>
            {
              isOpen 
                && 
                <Modal  onClose={() => toggleModal(false)}>
                    <Box
                      flexDirection="column"
                      justifyContent="space-between"
                      height="full"
                      padding="16"
                    >
                    <Box justifyContent={'center'}>
                    <p>You found a collectible!</p>
                    </Box>
                    <Box justifyContent={'center'}>
                    <p>{title}</p>
                    </Box>
                    <Box justifyContent={'center'}>
                    <img src={image!} width={300}/>
                    </Box>
                    <Box justifyContent={'center'}>
                      <a href={`https://testnet.bscscan.com/tx/${txHash}`}>Tx Hash: {txHash.slice(0,20)}...</a>
                    </Box>
                    </Box>
                </Modal>
            }
            </AnimatePresence>
            </>
          }
          </>
      }
  </>
  );
}

export default App;