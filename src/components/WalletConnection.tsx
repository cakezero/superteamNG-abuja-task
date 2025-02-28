import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Spinner } from "../icons";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnection = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [submit, setSubmit] = useState<boolean>(false);
  const [tx, setTx] = useState<string>();
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    if (publicKey) {
      const fetchBalance = async () => {
        const walletBalance = await connection.getBalance(publicKey!);
        if (walletBalance === 0) { 
          const airdropSignature = await connection.requestAirdrop(
            publicKey!,
            LAMPORTS_PER_SOL
          );

          const latestBlockHash = await connection.getLatestBlockhash();

          const tx = await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
          });
          console.log({ tx });
          const newBalance = await connection.getBalance(publicKey!);
          setBalance((newBalance / LAMPORTS_PER_SOL).toFixed(3));
        }
        setBalance((walletBalance / LAMPORTS_PER_SOL).toFixed(3));
      }
      fetchBalance();
    }
  }, [publicKey, connection]);


  const sendSol = async () => {
    try {
      if (!publicKey) {
        toast.error("Connect wallet");
        return;
      }
      if (!receiver || !amount) { 
        toast.error("Fill in all fields");
        return;
      }
      setSubmit(true);
      const senderAmount = parseInt(amount!) * LAMPORTS_PER_SOL;
      const recipient = new PublicKey(receiver!);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: senderAmount,
        })
      );
      
      const latestBlockHash = await connection.getLatestBlockhash();
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });
      toast.success("Sol sent successfully!");
      setTx(signature);
      setSubmit(false);
    } catch(error) {
      setSubmit(false);
      toast.error("Error sending SOL");
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Solana Wallet Connection</h1>
      {connected ? (
        <>
          <p className="font-bold">Balance: {balance}</p>
          <div className="p-4 bg-gray-800 rounded-lg mr-2 w-1/3">
            <h2 className="text-xl mb-2">Send SOL</h2>
            <input
              type="text"
              placeholder="Recipient Address"
              className="w-full p-2 rounded bg-gray-700 text-white"
              onChange={(e) => setReceiver(e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount (SOL)"
              className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={sendSol}
              type="button"
              className="mt-4 bg-green-500 hover:bg-green-700 px-4 py-2 rounded w-full"
            >
              {submit ? (
                <>
                  <Spinner />
                  <span className="ml-2">Sending SOL...</span>
                </>
              ) : (
                "Send SOL"
              )}
            </button>
            {tx ? (
              <p>
                View transaction here:{" "}
                <a target="_blank" rel="noopener noreferrer"
                  href={`https://solscan.io/tx/${tx}?cluster=devnet`}>
                  Click me
                </a>
              </p>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-2xl font-bold mt-20">
            Connect wallet to send transactions 😉
          </p>

          <div
            className="flex flex-col items-center justify-center mt-10"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <WalletMultiButton
              style={{
                backgroundColor: hovered ? "#2980b9" : "#3498db",
                display: "flex",
                alignItems: "center",
                marginTop: "1rem",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
              }}
            >
              <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
                Connect Solana Wallet
              </span>
            </WalletMultiButton>
          </div>
        </>
      )}
    </div>
  );
}

export default WalletConnection;