import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bovines from './pages/Bovines';
import AddBovine from './pages/AddBovine';
import BovineDetails from './pages/BovineDetails';
import EditBovine from './pages/EditBovine';
import Stables from './pages/Stables';
import AddStable from './pages/AddStable';
import StableDetails from './pages/StableDetails';
import EditStable from './pages/EditStable';
import Settings from './pages/Settings';
import ProductionAnalytics from './pages/ProductionAnalytics';
import Vaccines from './pages/Vaccines';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bovines" 
              element={
                <ProtectedRoute>
                  <Bovines />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bovines/add" 
              element={
                <ProtectedRoute>
                  <AddBovine />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bovines/:id" 
              element={
                <ProtectedRoute>
                  <BovineDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bovines/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditBovine />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stables" 
              element={
                <ProtectedRoute>
                  <Stables />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stables/add" 
              element={
                <ProtectedRoute>
                  <AddStable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stables/:id" 
              element={
                <ProtectedRoute>
                  <StableDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stables/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditStable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/production-analytics" 
              element={
                <ProtectedRoute>
                  <ProductionAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vaccines" 
              element={
                <ProtectedRoute>
                  <Vaccines />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
