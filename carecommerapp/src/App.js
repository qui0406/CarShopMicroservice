import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Footer from "./components/Layouts/Footer";
import Header from "./components/Layouts/Header";
import Hero from "./components/Layouts/Hero";

import Home from "./components/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Profile from "./components/Auth/Profile";
import CarDetails from "./components/CarDetails";


import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import { authApis, endpoints } from "./configs/APIs";
import cookie from "react-cookies";
import { useEffect } from "react";
import { useReducer } from "react";
import MyUserReducer from "./reducer/MyUserReducer";

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  useEffect(() => {
    const loadUser = async () => {
      const token = cookie.load("token");
      if (token !== undefined) {
        try {
          const res = await authApis().get(endpoints['my-profile']);
          dispatch({ type: "login", payload: res.data });
        } catch (err) {
          console.error("Không thể lấy thông tin user từ token", err);
          cookie.remove("token");
          dispatch({ type: "logout" });
        }
      }
    };
    loadUser();
  }, []);
  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/get-car-by-id/:id" element={<CarDetails />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider >
  );
}

export default App;
