import { useContext } from "react";
import { Navbar, Container, Nav, NavDropdown, Form, Button } from "react-bootstrap";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { type } from "@testing-library/user-event/dist/type";
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import Hero from "./Hero";
import { useLocation } from "react-router-dom";

const Header = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigate();
    const location = useLocation();
    const logout = () => {
        dispatch({type:"logout"});
        nav("/login");
    }

    const isHome = location.pathname === "/home";


    return (
    <Navbar
      expand="lg"
      className={`shadow-sm fixed-top ${
        isHome ? "bg-transparent" : "bg-dark"
      } ${!isHome && "navbar-dark"}`}
    >
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand
          as={Link}
          to="/home"
          className={`fw-bold fs-4 ${isHome ? "text-white" : "text-light"}`}
        >
          CarShop
        </Navbar.Brand>

        {/* Toggle menu mobile */}
        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll" className="w-100">
          <Nav className="me-auto my-2 my-lg-0 flex-grow-1" navbarScroll>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Trang chủ
            </NavLink>

            <NavLink
              to= "/car"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Xe ô tô
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Blog
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Giới thiệu
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Liên hệ
            </NavLink>

            <NavLink
              to="/ordered"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Đã đặt
            </NavLink>
            
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active fw-bold text-warning" : "text-white"}`
              }
            >
              Lịch sử
            </NavLink>

          </Nav>
          <div className="d-flex align-items-center gap-2 ms-auto">
            {user === null ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `btn ${isActive ? "btn-warning fw-bold" : "btn-outline-light"}`
                  }
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn btn-light text-dark fw-semibold"
                >
                  Đăng ký
                </NavLink>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <Link
                  to="/profile"
                  className="nav-link text-info d-flex align-items-center"
                >
                  <img
                    src={user.result.avatar}
                    alt="avatar"
                    style={{ borderRadius: "100%", height: "35px", width: "35px" }}
                  />
                  <span className="ms-2">{user.result.username}</span>
                </Link>
                <Button className="btn btn-danger ms-3" onClick={logout}>
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>

  );
}
export default Header;