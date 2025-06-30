import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Product from './pages/Product';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import User from './pages/User';
import Store from './pages/Store';
import SaleItems from './pages/SaleItems';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/product" element={<Product />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/user" element={<User />} />
          <Route path="/store" element={<Store />} />
          <Route path="/sale_items" element={<SaleItems />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;