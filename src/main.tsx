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
import { bsc } from 'wagmi/chains'

function Dapp() {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[bsc],
		[publicProvider()],
	)
  
	const connectors = getKitConnectWallets([
		google({
			chains,
			options: {
				defaultNetwork: 56
			}
		}),
		apple({
			chains,
			options: {
				defaultNetwork: 56
			}
		}),
		metamask({
			chains,
		}),
		email({
			chains,
			options: {
				defaultNetwork: 56
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
		signIn: {
			projectName: 'lootbox',
			showEmailInput: true,
			socialAuthOptions: ['google', 'apple'],
			walletAuthOptions: ['metamask']
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