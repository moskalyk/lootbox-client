import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@0xsequence/design-system'
import { KitProvider, getKitConnectWallets } from '@0xsequence/kit'
import { google, apple, metamask, email } from '@0xsequence/kit-connectors'
import { KitWalletProvider } from '@0xsequence/kit-wallet'

import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { arbitrumNova } from 'wagmi/chains'

function Dapp() {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[arbitrumNova],
		[publicProvider()],
	)
  
	const connectors = getKitConnectWallets([
		google({
			chains,
			options: {
				defaultNetwork: 42170
			}
		}),
		apple({
			chains,
			options: {
				defaultNetwork: 42170
			}
		}),
		metamask({
			chains,
		}),
		email({
			chains,
			options: {
				defaultNetwork: 42170
			}
		})
	])  
    
	const config = createConfig({
		autoConnect: true,
		publicClient,
		webSocketPublicClient,
		connectors
	})

  const kitConfig: any = {
		projectAccessKey: 'qXo22RTxznHmanNpf1ftKeQBAAAAAAAAA',
		position: 'center',
		defaultTheme: 'dark',
		displayedAssets: [
			{
				contractAddress: '0xdc85610fd15b64d1b48db4ebaabc61ee2f62fb6d',
				chainId: 42170
			}
		],
		signIn: {
			projectName: 'lootbox',
			showEmailInput: true,
			socialAuthOptions: ['google', 'apple'],
			walletAuthOptions: []
		}
	}

  return (
    <WagmiConfig config={config}>
      <KitProvider config={kitConfig}>
		<KitWalletProvider>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</KitWalletProvider>
      </KitProvider>
    </WagmiConfig>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
)