// app/context/Web3Context.jsx (or wherever you place it)
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WalletConnectModal,
  useWalletConnectModal,
} from "@walletconnect/modal-react-native";
import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import contractABI from "../utils/ABI.json";

const projectId = "24003109fb535f130269883329f85b1b";
const contractAddress = "0xade143fE7367F07BcF3dFfe39F7bf75c2D6dB970";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [contractInstance, setContractInstance] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [shouldInit, setShouldInit] = useState(false);

  const {
    open,
    provider: wcProvider,
    isConnected,
    address: wcAddress,
  } = useWalletConnectModal();

  useEffect(() => {
    if (shouldInit && isConnected && wcProvider && wcAddress) {
      initialize();
      setShouldInit(false); // prevent re-trigger
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldInit, isConnected, wcProvider, wcAddress]);

  const initialize = async () => {
    try {
      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      const msg =
        "Please sign this message to verify ownership of your wallet.";
      const signature = await signer.signMessage(msg);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        "https://medlink-bh5c.onrender.com/api/auth/metamask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address, signature }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSigner(signer);
        setAddress(address);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContractInstance(contract);
        console.log("✅ Wallet connected:", address);
      } else {
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Initialization error:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setShouldInit(true);
      await open();
    } catch (error) {
      console.error("Connection failed:", error);
      setShouldInit(false);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        contractInstance,
        connectWallet,
        signer,
        address,
      }}
    >
      {children}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={{
          name: "WalletConnect Expo App",
          description: "Expo app with WalletConnect integration",
          url: "https://your-app-url.com",
          icons: ["https://your-app-url.com/icon.png"],
          redirect: {
            native: "yourapp://",
            universal: "https://your-app-url.com",
          },
        }}
      />
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
