import React, { useState, useEffect } from 'react'
import { Button, Box, Spinner, useTheme } from '@0xsequence/design-system'
import { useOpenConnectModal, signEthAuthProof } from '@0xsequence/kit'
import { useDisconnect, useAccount, useWalletClient } from 'wagmi'
import { ethers } from "ethers";
import {contractABI as abi} from './abi.ts'
import maze from './assets/maze.png'
import socketIOClient from "socket.io-client";
import { useOpenWalletModal } from '@0xsequence/kit-wallet'

import './lootExpanse/styles.css'

// const ENDPOINT = "http://localhost:3000"; 
const ENDPOINT = "https://nodejs-production-9249.up.railway.app"; 
// const ENDPOINT = "https://lootbox.ngrok.dev";
const contractAddress = "0xdc85610fd15b64d1b48db4ebaabc61ee2f62fb6d";

let init = false
let count = 0
let socket: any = null
let live = false;
let proofVar: any = null
let txHash: any = ''

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { data: walletClient }: any = useWalletClient({chainId: 56})
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const {setTheme} = useTheme()
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [inDungeon, setInDungeon] = useState(true)
  const { setOpenWalletModal } = useOpenWalletModal()
  const [_, setShowElement] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  
  setTheme('dark')

  const [items, setItems] = useState<any>([])
  const [loaded, setLoaded] = useState(false);
  const [space, setSpace] = useState(false);
  const [proof, __] = useState<any>(null);

  useEffect(() =>{

  }, [items, loaded, inDungeon, socket, loadingTreasure, mintLoading, proof, txHash])

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

    elements.forEach((el: any) => {
      el?.parentNode?.removeChild(el);
    });
    }
  }, [loadCount, items.length, space]);

  useEffect(() => {
    window.addEventListener('message', (event) => {

      if (event.origin !== 'http://155.138.156.102:8002') {
          // Security check: Ensure that the message is from a trusted source
          return;
      }
    
      // Handle the message
      console.log('Message received from iframe:', event.data);
      if(event.data.portal == 'loot' && count == 0 && isConnected){
        setInDungeon(false)
        generate()
        count++
      }
    });
  }, [isConnected])

  
  useEffect(() => {
    setTimeout(async () => {
      const proof0 = await signEthAuthProof(walletClient)

      if(proofVar == null || proofVar.toLowerCase() != proof0.proofString.split('.')[1].toLowerCase()){

      if(isConnected && !init && inDungeon){
          console.log(init)
          init = true
          console.log(init)
          const socketRaw = await socketIOClient(ENDPOINT, {
              query: {
                address: address,
                token: proof0?.proofString  // Replace with your actual token
              }
          })
          proofVar = proof0.proofString.split('.')[1]
          // console.log(socketRaw)
          socket = socketRaw
          console.log(socketRaw)
          // setSocket(socketRaw)
          socket.on('disconnected', ()=> {
            console.log('disconnected')
          })
      }
    } else {

      if(!inDungeon && count == 1){
        setInDungeon(true);
        setLoaded(false)
        setMintLoading(false)
        count = 0
        init = false
        setItems([])
      }
    }

    }, 0)
    setInterval(() => {
      try{
        const withTimeout = (onSuccess: any, onTimeout: any, timeout: any) => {
          let called = false;
        
          const timer = setTimeout(() => {
            if (called) return;
            called = true;
            onTimeout();
          }, timeout);
        
          return (...args: any) => {
            //@ts-ignore
            let self: any = this
            if (called) return;
            called = true;
            clearTimeout(timer);
            onSuccess.apply(self, args);
          }
        }
        
        socket.emit("ping", {}, withTimeout(() => {
          console.log("socket ✅");
        }, () => {
          alert('you have 1 too many connections, or, server is down')
        }, 1000));
      }catch(err){
        console.log(err)
      }
    }, 4000) 
  },[address, isConnected, socket])

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate if the scroll is below 90% of the page
    if ((scrollPosition + windowHeight) / documentHeight > 0.9) {
      setShowElement(false);
    } else {
      setShowElement(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const onClick = () => {
    setOpenConnectModal(true)
  }

  const mint = async () => {
    setMintLoading(true)

    socket.emit('mint', {address: address})

    const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/arbitrum-nova');

    const contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on("Transfer", async (_, to, __, event) => {

      if(to.toLowerCase() == proofVar.toLowerCase()){
        txHash = event.transactionHash
        setMintLoading(false)
      }
    });
  }
  
  const generate = async () => {
    console.log(socket)
    setLoadingTreasure(true)

    const proof1 = await signEthAuthProof(walletClient)
    
    socket.emit('collect', {proof: proof1, address: address})
    console.log(socket.id)

    socket.on('disconnected', ()=> {
      console.log('disconnected')
      alert('error, duplicate session')
      init =false
    })

    socket.on('pong', async (_: any) => {
      console.log('true')
    })

    socket.on('loot', async (data: any) => {
      let interval = setInterval(async () => {
        const res = await fetch(data[1].data.url)
        console.log(res.status)
        if(res.status == 200){
          setLoaded(true)
          clearInterval(interval)
          setLoadingTreasure(false)
          setItems([data[1].data])
          txHash=''
        }
      }, 5000)
    })
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
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => {setInDungeon(true);
        setInDungeon(false)
        setLoaded(false)
        setMintLoading(false)
        setLoadingTreasure(false)
        count = 0
        init = false
        setItems([]);
        socket = null;
        txHash = '';

        disconnect()}}>
              sign out
              </div>

              <div className='container'>
                <iframe id='maze' src={`http://155.138.156.102:8002/${ live ? '?refresh=true' : ''}`} width={window.innerWidth} height={window.innerHeight*.76} ></iframe>
                {/* <iframe id='maze' src={`https://maze.ngrok.app/${ live ? '?refresh=true' : ''}`} width={window.innerWidth} height={window.innerHeight*.76} ></iframe> */}
              </div>
            </div>
            :
            <>
            <br/>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => disconnect()}>
              sign out
            </div>
            { 
            !loadingTreasure
            // true 
            ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', left: '30px'}} onClick={() => {txHash = '';socket.emit('cancel', {address: address});live=true;setInDungeon(true);count=0;setItems([])}}>
              <Button label='back to maze?'/>
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
                  {/* @ts-ignore */}
                  <div className="frame" tier={'Rare'} style={{textAlign: 'center'}}>
                    <h1 className="name_Rare devils-note">
                    <br/>
                      loot that combines elements from diablo
                      <br/>
                      <br/>
                      it might tell you about your past and what you might need for the future
                      <br/>
                      <br/>

                      take a pass <br/>on items
                      <br/>
                      <br/>

                      or unlock what you want in this world
                    </h1>
                    <br/>
                    <br/>
                    <Box justifyContent={'center'}>
                      <Spinner/>
                    </Box>
                    <br/>
                    <br/>
                  </div>
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
               >
                <br/>
                <br/>
                {loaded ? <div className={`items-container fade-in`} style={{width: '100vw', marginTop: '20px', overflow: 'auto'}}>
                { !loadingTreasure ? <div style={{zIndex: 10, color: 'white', cursor: 'pointer', position:'fixed', top: '30px', right: txHash != '' ? '45vw': '46vw'}}>
                { mintLoading ? <div style={{
                  position: 'fixed', 
                  left: '50%',      
                  zIndex: 1000,
                }}
                >
                  <Spinner/>
                </div> : txHash != '' ? <div style={{
                  paddingLeft: '20px',
                  zIndex: 1000,
                }}
                ><p style={{color: 'orange'}}><a href={`https://nova.arbiscan.io/tx/${txHash}`} target='_blank'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tx Hash: {txHash.slice(0, 4)}...</a></p></div>: <Button label='mint' onClick={() => mint()}/> }
                </div> : null }
                {items.map((item: any, index: any) => (
                  //@ts-ignore
                  <div key={index} className="frame" tier={item.tier}>
                    {/*@ts-ignore*/}
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
                      {item.main_stats.map((stat: any, index: any) => (
                        <React.Fragment key={index}>
                          <li className={item.category}>{stat}</li>
                          {item.stats.map((stat: any, statIndex: any) => (
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

            </div>
            </>
          }
          </>
      }
  </>
  );
}

export default App;