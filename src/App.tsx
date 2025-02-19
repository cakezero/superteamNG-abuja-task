import KeyPair from './components/KeyPairConnection'
import WalletConnection from './components/WalletConnection';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/WalletProvider';

function App() {
  return (
    <AppProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Home /> } />
            <Route path="/keypair" element={<KeyPair />} />
            <Route path="/wallet" element={<WalletConnection />} />
          </Routes>
          <Toaster />
        </Router>
    </AppProvider>
  );
}

export default App;
