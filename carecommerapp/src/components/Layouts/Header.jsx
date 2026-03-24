import { useContext, useState } from "react";
import { Navbar, Container, Nav, NavDropdown, Button, Badge } from "react-bootstrap";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaCamera, FaCarSide, FaTags, FaWrench, FaNewspaper, FaStar, FaCalendarCheck, FaBox, FaHistory, FaCommentDots, FaSignOutAlt, FaRegUserCircle } from "react-icons/fa";

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigate();
  const location = useLocation();

  const logout = () => {
    dispatch({ type: "logout" });
    nav("/login");
  };

  const isStaff = user?.result?.roles?.includes("STAFF");

  return (
    <>
      <style>
        {`
          .custom-dropdown-menu {
            border: 1px solid #e8f0fe !important;
            border-radius: 4px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
            padding: 8px 0 !important;
            margin-top: 15px !important;
            background-color: #ffffff !important;
          }
          .custom-dropdown-item {
            color: #191c1d !important;
            font-weight: 500 !important;
            padding: 10px 20px !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            transition: all 0.2s ease !important;
            font-size: 0.95rem;
          }
          .custom-dropdown-item:hover {
            background-color: #e8f0fe !important;
            color: #1a73e8 !important;
          }
          .custom-dropdown-item svg {
            color: #8c949c;
            transition: all 0.2s ease;
            font-size: 1.1rem;
          }
          .custom-dropdown-item:hover svg {
            color: #1a73e8 !important;
          }
          /* Hover behavior for desktop */
          @media (min-width: 992px) {
            .nav-item.dropdown:hover .dropdown-menu {
              display: block;
              margin-top: 0 !important;
            }
          }
          .icon-btn {
            cursor: pointer;
            color: #5d6571;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 50%;
            background: #f8f9fa;
            transition: 0.2s;
          }
          .icon-btn:hover {
            background: #e8f0fe;
            color: #1a73e8;
          }
          .nav-link.active {
            color: #1a73e8 !important;
            font-weight: 700 !important;
          }
        `}
      </style>

      <Navbar expand="lg" className="fixed-top" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e7e8e9", padding: "4px 0", fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
        <Container fluid className="px-lg-5">
          {/* 1. Logo */}
          <Navbar.Brand as={Link} to="/home" className="fw-bold fs-3" style={{ color: "#1a73e8", letterSpacing: "-1px", marginRight: "1.5rem" }}>
            CarShop
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbarScroll" className="border-0 shadow-none text-primary" />
          <Navbar.Collapse id="navbarScroll">
            {/* 2. Main Menu */}
            <Nav className="mx-auto" navbarScroll>
              {isStaff ? (
                <>
                  <NavLink to="/staff/home" end className="nav-link px-3 fs-6 fw-medium text-dark">Trang chủ Admin</NavLink>
                  <NavLink to="/staff/home/branch" className="nav-link px-3 fs-6 fw-medium text-dark">Hãng xe</NavLink>
                  <NavLink to="/staff/home/category" className="nav-link px-3 fs-6 fw-medium text-dark">Dòng xe</NavLink>
                  <NavLink to="/staff/home/model" className="nav-link px-3 fs-6 fw-medium text-dark">Mẫu xe</NavLink>
                  <NavLink to="/staff/home/cashier" className="nav-link px-3 fs-6 fw-medium text-dark">Thu ngân</NavLink>
                </>
              ) : (
                <>
                  {/* Sản phẩm Dropdown */}
                  <NavDropdown title={<span className="text-dark fs-6 fw-medium px-2">Sản phẩm</span>} id="product-dropdown" menuVariant="light" className="px-2" renderMenuOnMount={true}>
                    <div className="dropdown-menu custom-dropdown-menu">
                      <Link to="/car-new" className="dropdown-item custom-dropdown-item"><FaCarSide /> Xe ô tô mới</Link>
                      <Link to="/car-old" className="dropdown-item custom-dropdown-item"><FaCarSide /> Xe ô tô cũ (Lướt)</Link>
                      <Link to="/voucher" className="dropdown-item custom-dropdown-item"><FaTags /> Voucher ưu đãi</Link>
                      <Link to="/accessories" className="dropdown-item custom-dropdown-item"><FaWrench /> Phụ kiện & Phụ tùng</Link>
                    </div>
                  </NavDropdown>

                  {/* Dịch vụ & Tin tức Dropdown */}
                  <NavDropdown title={<span className="text-dark fs-6 fw-medium px-2">Dịch vụ & Tin tức</span>} id="services-dropdown" className="px-2" renderMenuOnMount={true}>
                    <div className="dropdown-menu custom-dropdown-menu">
                      <Link to="/news" className="dropdown-item custom-dropdown-item"><FaNewspaper /> Tin tức thị trường</Link>
                      <Link to="/reviews" className="dropdown-item custom-dropdown-item"><FaStar /> Đánh giá xe</Link>
                      <Link to="/service-booking" className="dropdown-item custom-dropdown-item"><FaCalendarCheck /> Đặt lịch bảo dưỡng</Link>
                    </div>
                  </NavDropdown>

                  {/* Cá nhân Dropdown */}
                  <NavDropdown title={<span className="text-dark fs-6 fw-medium px-2">Cá nhân</span>} id="personal-dropdown" className="px-2" renderMenuOnMount={true}>
                    <div className="dropdown-menu custom-dropdown-menu">
                      <Link to="/all-my-reserve" className="dropdown-item custom-dropdown-item"><FaBox /> Đơn hàng đã đặt</Link>
                      <Link to="/all-my-deposit" className="dropdown-item custom-dropdown-item"><FaHistory /> Lịch sử giao dịch</Link>
                      <Link to="/consulting" className="dropdown-item custom-dropdown-item"><FaCommentDots /> Yêu cầu tư vấn</Link>
                    </div>
                  </NavDropdown>

                  {/* Về chúng tôi */}
                  <NavLink to="/about" className="nav-link px-3 fs-6 fw-medium text-dark">Về chúng tôi</NavLink>
                </>
              )}
            </Nav>

            {/* 3. Utilities & Right Section */}
            <div className="d-flex align-items-center gap-3 ms-auto mt-3 mt-lg-0">
               
               {/* Cart Icon with Badge */}
               <div className="d-flex gap-2 me-2">
                 <div className="icon-btn position-relative" title="Giỏ hàng">
                   <FaShoppingCart size={18} />
                   <Badge bg="danger" pill style={{ position: "absolute", top: "-2px", right: "-6px", fontSize: "0.6rem", border: "2px solid white", padding: "3px 5px" }}>
                     2
                   </Badge>
                 </div>
               </div>

               {/* Auth Section */}
               {user === null ? (
                 <div className="d-flex gap-2 border-start ps-3 border-secondary-subtle">
                   <Link to="/login" className="btn px-3" style={{ color: "#1a73e8", background: "#e8f0fe", border: "none", fontWeight: 600, borderRadius: "4px", fontSize: "0.9rem" }}>Đăng nhập</Link>
                   <Link to="/register" className="btn px-3" style={{ color: "#ffffff", background: "#1a73e8", border: "none", fontWeight: 600, borderRadius: "4px", fontSize: "0.9rem" }}>Đăng ký</Link>
                 </div>
               ) : (
                 <div className="border-start ps-3 border-secondary-subtle">
                   <NavDropdown 
                     title={
                       <span className="text-dark fw-bold d-flex align-items-center gap-2">
                          <img src={user.result.avatar || "https://via.placeholder.com/30"} alt="avatar" className="rounded-circle" style={{ width: "32px", height: "32px", objectFit: "cover", border: "1px solid #e7e8e9" }} />
                       </span>
                     } 
                     id="user-profile-dropdown"
                     align="end"
                   >
                     <div className="dropdown-menu custom-dropdown-menu" style={{ display: "block", minWidth: "200px" }}>
                       <div className="px-3 py-2 border-bottom mb-2">
                         <div style={{ fontSize: "0.85rem", color: "#5d6571" }}>Xin chào,</div>
                         <div style={{ fontWeight: 700, color: "#191c1d" }}>{user.result.username}</div>
                       </div>
                       <Link to="/profile" className="dropdown-item custom-dropdown-item"><FaRegUserCircle /> Hồ sơ của tôi</Link>
                       <div className="dropdown-divider"></div>
                       <button onClick={logout} className="dropdown-item custom-dropdown-item text-danger w-100 text-start border-0 bg-transparent"><FaSignOutAlt className="text-danger" /> Đăng xuất</button>
                     </div>
                   </NavDropdown>
                 </div>
               )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;

