import { useState } from "react";
import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction
} from "@solana/web3.js";
import toast from "react-hot-toast";
import { decodeUTF8 } from "tweetnacl-util";
import nacl from "tweetnacl";
import { Spinner } from "../icons";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const KeyPair = () => {
  const [keypair, setKeypair] = useState<Keypair>();
  const [balance, setBalance] = useState<string>();
  const [receiver, setReceiver] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [message, setMessage] = useState<string>("");
  const [submit, setSubmit] = useState<boolean>(false)

  const generateKeyPair = async () => { 
    setSubmit(true)
    const keypair = Keypair.generate();
    setKeypair(keypair);
    fetchBalance(keypair.publicKey);
    const airdropSignature = await connection.requestAirdrop(
      keypair.publicKey,
      LAMPORTS_PER_SOL
    );

    const tx = await connection.confirmTransaction(airdropSignature);
    console.log({ tx })
    toast.success("Keypair created and wallet funded successfully!")
    setSubmit(false)
  }

  const signMessage = () => {
    try {
      setSubmit(true)
      const encodedMessage = decodeUTF8(message);
      const signature = nacl.sign.detached(encodedMessage, keypair!.secretKey)
      const result = nacl.sign.detached.verify(
        encodedMessage,
        signature,
        keypair!.publicKey.toBytes()
      );

      console.log({ result });
      toast.success("Message signed successfully!");
      setSubmit(false)
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign message");
      setSubmit(false)
    }
  }

  const fetchBalance = async (pubKey: PublicKey) => {
    const balance = await connection.getBalance(new PublicKey(pubKey));
    setBalance((balance / LAMPORTS_PER_SOL).toFixed(3));
  }

  const sendSOL = async () => {
    if (!keypair) {
      toast.error("Create a key pair first to transfer sol");
      return;
    }
    try {
      setSubmit(true)
      const senderAmount = parseInt(amount!) * LAMPORTS_PER_SOL
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(receiver!),
          lamports: senderAmount,
        }),
      );

      const transferTx = await sendAndConfirmTransaction(connection, transferTransaction, [
        keypair,
      ]);
        
      console.log({ transferTx });
      toast.success("Sol sent successfully!");
      setSubmit(false)
    } catch (error) {
      console.error(error);
      toast.error("Failed to transfer sol");
      setSubmit(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Solana Key Pair Connection</h1>
      <div className="flex justify-around w-full max-w-4xl mt-8">
        {/* Form 1: Generate Keypair */}
        <div className="p-4 bg-gray-800 rounded-lg mr-2 w-1/3">
          <h2 className="text-xl mb-2">Generate Keypair</h2>
          <button
            onClick={generateKeyPair}
            type="button"
            className="mt-4 hover:bg-blue-700 bg-blue-500 px-4 py-2 rounded w-full"
          >
            {submit ? (
              <>
                <Spinner />
                <span className="ml-2">Generating Key Pair...</span>
              </>
            ) : (
              "Generate Key Pair"
            )}
          </button>
          {keypair && (
            <div className="mt-4">
              <p>
                <strong>Public Key:</strong> {keypair.publicKey.toBase58()}
              </p>
              <p>
                <strong>Balance:</strong> {balance} SOL
              </p>
            </div>
          )}
        </div>

        {/* Form 2: Send SOL */}
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
            onClick={sendSOL}
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
        </div>

        {/* Form 3: Sign Message */}
        <div className="p-4 bg-gray-800 rounded-lg w-1/3">
          <h2 className="text-xl mb-2">Sign Message</h2>
          <input
            type="text"
            placeholder="Enter Message to be signed"
            className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={signMessage}
            type="button"
            className="mt-4 bg-yellow-500 hover:bg-yellow-700 px-4 py-2 rounded w-full"
          >
            {submit ? (
              <>
                <Spinner />
                <span className="ml-2">Signing message...</span>
              </>
            ) : (
              "Sign Message"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyPair;
