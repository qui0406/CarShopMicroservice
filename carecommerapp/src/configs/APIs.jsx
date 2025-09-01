import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://localhost:8888/api/v1";

export const endpoints = {
    "login": "/ecommer-car-web/profile/login",
    "my-profile": "/ecommer-car-web/profile/my-profile",
    "car-branch": "/ecommer-car-web/car-branch/get-all-car-branch",
    "car-model": "/ecommer-car-web/car-model/get-all-car-model",
    "car-category": "/ecommer-car-web/car-category/get-all-car-category",
    "get-cars": "/ecommer-car-web/car/get-products",
    "filter-cars": "/ecommer-car-web/car/filter-car",
    "get-car-by-id": id => `/ecommer-car-web/car/get-product-by-id/${id}`,

    "get-order": orderId => `/ecommer-car-web/orders/orders-car/${orderId}`,
    "create-orders": "/ecommer-car-web/orders/create-order",

    
    "checkout-vnpay": "/payment/checkout/url",
    "vnpay": "/payment/checkout/vnpay_ipn",
    "payment-response": orderId => `/payment/installment/${orderId}`
};

export const authApis = () => {

    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${cookie.load('token')}`
        }

    });

}
export default axios.create({
    baseURL: BASE_URL,
})