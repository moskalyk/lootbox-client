import React, { useState } from 'react'
import { Button, Modal, Box, Spinner, useTheme } from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'
import { useOpenConnectModal, signEthAuthProof } from '@0xsequence/kit'
import { useDisconnect, useAccount, useWalletClient } from 'wagmi'
import { ethers } from "ethers";
import {contractABI as abi} from './abi.ts'
import maze from './assets/maze.png'

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { data: walletClient }: any = useWalletClient({chainId: 137})
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const {setTheme} = useTheme()

  const [isOpen, toggleModal] = useState(false)
  const [treasureIsOpen, setTtreasureIsOpen] = useState(false)
  const [image, setImage] = useState<any>(null)
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [title, setTitle] = useState('')

  setTheme('dark')

  const onClick = () => {
    setOpenConnectModal(true)
  }

  const mint = async () => {
    setLoadingTreasure(true)
    setTtreasureIsOpen(true)

    // ERC-1155 contract ABI and address
    const contractAddress = "0x68680bc16af8f0b29471bc3196d7cbb7248810a2";

    // Create a contract instance
    const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/arbitrum');

    const contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on("TransferSingle", async (operator, from, to, id, value, event) => {
        if(to == address){
          const res = await fetch(`https://metadata.sequence.app/tokens/arbitrum/${`0x68680bc16af8f0b29471bc3196d7cbb7248810a2`}/${id.toString()}`)
              const json = await res.json()
              setImage(json[0].image)
              setTitle(json[0].name)
              toggleModal(true)
              setLoadingTreasure(false)
        }
    });
    
    const proof = await signEthAuthProof(walletClient)
    
    let response = await fetch('https://cloudflare-worker-sequence-relayer.yellow-shadow-d7ff.workers.dev', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ proof: proof.proofString, address: address })
    });

    if(response.status == 200){
      const hash = await response.text()
      console.log(hash)
      setTxHash(hash)
  } else {
    alert('Something went wrong with the request, check the console and try again.')
  }
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
              width: '100vw', // Full
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
              <p>... you've made your way through the internet, and you've found yourself here</p>
            </Box>
            <br/>
            <Box justifyContent={'center'}>
              <p>connect for reward</p>
            </Box>
            <br/>
            <Box justifyContent={'center'}>
              <Button label="connect" onClick={() => onClick()}/>
            </Box>
            </div>
          </>
        :
          <>
            <br/>
            <div style={{color: 'white', position:'fixed', cursor: 'pointer', top: '30px', right: '30px'}} onClick={() => disconnect()}>
              sign out
            </div>
            { treasureIsOpen ? <div style={{color: 'white', cursor: 'pointer', position:'fixed', bottom: '30px', left: '30px'}} onClick={() => location.reload()}>
              play again?
            </div> : null }
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
                height: '100vh', // Full height of the viewport
                width: '100vw', // Full
              }}
              onClick={() => {if(!treasureIsOpen) {mint()}}}
              >
            <spline-viewer width={630} height={600} url="https://prod.spline.design/bjapO7rl4GcdpcI3/scene.splinecode"></spline-viewer>
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
                      <a href={`https://arbiscan.io/tx/${txHash}`}>Tx Hash: {txHash.slice(0,20)}...</a>
                    </Box>
                    </Box>
                </Modal>
            }
            </AnimatePresence>
          </>
      }
  </>
  );
}

export default App;