import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Footer from "./components/Layouts/Footer";
import Header from "./components/Layouts/Header";
import Hero from "./components/Layouts/Hero";

import Home from "./components/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Profile from "./components/Auth/Profile";
import CarDetails from "./components/CarDetails";
import CarNew from "./components/CarNew"
import CarOld from "./components/CarOld"
import Reserve from './components/Reserve';
import PaymentCompleted from './components/PaymentCompleted';
import About from "./components/About";
import Chat from "./components/Chat";
import Chatbot from "./components/Chatbot";
import Voucher from "./components/Voucher"
import News from "./components/News"
import ScrollToTop from "./components/ScrollToTop"
import Quotation from "./components/Quotation"
import AIValuation from "./components/AIValuation"

import HomeStaff from "./components/Staff/HomeStaff"
import CarListManagement from "./components/Staff/CarListManagement"
import Media from "./components/Staff/Media"
import StaffPage from "./components/Staff/StaffPage"
import CreateCar from "./components/Staff/CreateCar"
import AdminDashboard from "./components/Admin/AdminDashboard"
import MasterData from "./components/Admin/MasterData"
import AdminUsers from "./components/Admin/AdminUsers"
import DirectPayment from "./components/Staff/DirectPayment"
import SellCar from "./components/SellCar"
import AppraisalManagement from "./components/Staff/AppraisalManagement"


import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import { authApis, endpoints } from "./configs/APIs";
import cookie from "react-cookies";
import { useEffect, useReducer, useContext } from "react";
import MyUserReducer from "./reducer/MyUserReducer";
import Branch from './components/Staff/Branch';
import Category from './components/Staff/Category';
import Model from './components/Staff/Model';
import ChatStaff from "./components/Staff/StaffChat"
import Cashier from "./components/Staff/Cashier"
import DepositConfirm from "./components/DepositConfirm"
import OrderHistory from "./components/OrderHistory";
import PaymentSuccess from "./components/Staff/PaymentSuccess";

// Dùng chung Layout để ẩn hiện Header/Footer/Chatbot cho đúng chuẩn trang Dashboard hiện đại
const AppLayout = ({ children }) => {
  const location = useLocation();
  const user = useContext(MyUserContext);

  const roles = user?.result?.roles || [];
  const isStaffOrAdmin = roles.includes("STAFF") || roles.includes("ADMIN");

  const hideLayout =
    location.pathname.includes("/payment-result") ||
    location.pathname.includes("/staff") ||
    location.pathname.includes("/admin") ||
    roles.includes("ADMIN");

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <ScrollToTop />}
      {children}
      {!hideLayout && !isStaffOrAdmin && <Chatbot />}
      {!hideLayout && <Footer />}
    </>
  );
};

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, undefined);
  useEffect(() => {
    const loadUser = async () => {
      const token = cookie.load("token");
      if (token !== undefined && token !== null) {
        try {
          const res = await authApis().get(endpoints['my-profile']);
          dispatch({ type: "login", payload: res.data });
        } catch (err) {
          console.error("Không thể lấy thông tin user từ token", err);
          cookie.remove("token");
          dispatch({ type: "logout" });
        }
      } else {
        dispatch({ type: "logout" });
      }
    };
    loadUser();
  }, []);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/get-car-by-id/:id" element={<CarDetails />} />
              <Route path="/car-new" element={<CarNew />} />
              <Route path="/car-old" element={<CarOld />} />
              <Route path="/reserve/:id" element={<Reserve />} />
              <Route path="/payment-result" element={<PaymentCompleted />} />
              <Route path="/all-my-deposit" element={<OrderHistory />} />
              <Route path="/voucher" element={<Voucher />} />
              <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />

              <Route path="/staff/home" element={<HomeStaff />} />
              <Route path="/staff/car-list" element={<CarListManagement />} />
              <Route path="/staff/media" element={<Media />} />
              <Route path="/staff/directory" element={<StaffPage />} />
              <Route path="/staff/create-car" element={<CreateCar />} />
              <Route path="/staff/edit-car/:id" element={<CreateCar />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/master-data" element={<MasterData />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/staff/direct-payment" element={<DirectPayment />} />
              <Route path="/staff/home/model" element={<Model />} />
              <Route path="/staff/home/chat" element={<ChatStaff />} />
              <Route path="/staff/home/cashier" element={<Cashier />} />
              <Route path="/staff/payment-success" element={<PaymentSuccess />} />
              <Route path="/quotation/:id" element={<Quotation />} />
              <Route path="/valuation" element={<AIValuation />} />
              <Route path="/sell-car" element={<SellCar />} />
              <Route path="/deposit-confirm" element={<DepositConfirm />} />
              <Route path="/staff/appraisals" element={<AppraisalManagement />} />

            </Routes>
          </AppLayout>
        </BrowserRouter>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider >
  );
}

export default App;
