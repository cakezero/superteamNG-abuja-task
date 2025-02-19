import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-center text-3xl font-bold text-black-500 mt-20">
        Select what you'd like to do 🫡
      </h1>

      <div className="flex flex-row items-center justify-center mt-10">
        <button onClick={() => navigate("/keypair")} className="bg-blue-500 flex items-center mt-4 mr-4 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          KeyPair Connection
        </button>
        <button onClick={() => navigate("/wallet") } className="bg-blue-500 flex items-center mt-4 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          Wallet Connection
        </button>
      </div>
    </>
  );
}

export default Home;