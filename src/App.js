import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Product from './pages/Product';
import Suppliers from './pages/Suppliers';
import User from './pages/User';
import Store from './pages/Store';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import POSSystem from './pages/POSSystem';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import AIDashboard from './pages/AIDashboard';
import AIRecommendations from './pages/AIRecommendations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // Get user from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const role = user?.role;

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    {role === 'cashier' ? (
                      <Route path="/stock-out" element={<POSSystem />} />
                    ) : role === 'manager' ? (
                      <>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/stock-out" element={<POSSystem />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/ai-dashboard" element={<AIDashboard />} />
                        <Route path="/ai-recommendations" element={<AIRecommendations />} />
                      </>
                    ) : role === 'inventory' ? (
                      <>
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/store" element={<Store />} />
                      </>
                    ) : (
                      <>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/user" element={<User />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/stock-out" element={<POSSystem />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/ai-dashboard" element={<AIDashboard />} />
                        <Route path="/ai-recommendations" element={<AIRecommendations />} />
                      </>
                    )}
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;