import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Scan from './pages/Scan';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path='/' element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
