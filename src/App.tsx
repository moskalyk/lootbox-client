import { useState } from 'react'
import { Button, Modal, Box, Spinner } from '@0xsequence/design-system'
import { AnimatePresence } from 'framer-motion'
import { useOpenConnectModal, signEthAuthProof } from '@0xsequence/kit'
import { useDisconnect, useAccount, useWalletClient } from 'wagmi'
import { SequenceIndexer } from '@0xsequence/indexer'

function App() {
  const { setOpenConnectModal } = useOpenConnectModal()
  const { data: walletClient }: any = useWalletClient({chainId: 137})
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  const [minted, _] = useState(false)
  const [isOpen, toggleModal] = useState(false)
  const [treasureIsOpen, setTtreasureIsOpen] = useState(false)
  const [image, setImage] = useState<any>(null)
  const [loadingTreasure, setLoadingTreasure] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [title, setTitle] = useState('')

  const onClick = () => {
    setOpenConnectModal(true)
  }

  const mint = async () => {
    setLoadingTreasure(true)
    setTtreasureIsOpen(true)
    
    const proof = await signEthAuthProof(walletClient)
    const response = await fetch('https://cloudflare-worker-sequence-relayer.yellow-shadow-d7ff.workers.dev', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ proof: proof.proofString, address: address })
    });

    if(response.status == 200){


    // artifical delay for indexer
    setTimeout(async () => {
      console.log(await response.text())
      setLoadingTreasure(false)
      const indexer = new SequenceIndexer('https://arbitrum-indexer.sequence.app', 'c3bgcU3LkFR9Bp9jFssLenPAAAAAAAAAA')
      
      const filter = { accountAddress: address }

      const transactionHistory: any = await indexer.getTransactionHistory({
        filter: filter,
        includeMetadata: true,
        metadataOptions: {
          verifiedOnly: false,
          includeContracts: ["0x68680bc16af8f0b29471bc3196d7cbb7248810a2"]
        }
      })
      setTxHash(transactionHistory.transactions[0].txnHash)
      const res = await fetch(`https://metadata.sequence.app/tokens/arbitrum/${transactionHistory!.transactions[0]!.transfers[0].contractAddress}/${transactionHistory!.transactions[0]!.transfers[0].tokenIds[0]}`)
      const json = await res.json()
      setImage(json[0].image)
      setTitle(json[0].name)
      toggleModal(true)
    }, 1000)
  } else {
    alert('Something went wrong with the request, check the console.')
  }
  }
  return (
    <>
      {
        ! 
          minted 
        ? 
          <>
            <br/>
            <br/>
              <p style={{
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                width: '100vw', // Full
                marginBottom: '-130px'
              }}>lootbox</p>
          </> 
        : 
          null
      }
      {
        !
          isConnected 
        ? 
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh', // Full height of the viewport
              width: '100vw', // Full
              }}
            >
              <Button label="connect" onClick={() => onClick()}/>
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
                    <p>you found a collectible</p>
                    <br/>
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