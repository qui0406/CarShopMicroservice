import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://localhost:8888/api/v1";

export const endpoints = {

    // USER
    "showroom-info": "/ecommer-car-web/api/showroom/get-info-showroom",

    "login": "/ecommer-car-web/api/profile/login",
    "register": "/ecommer-car-web/api/profile/register",

    "my-profile": "/ecommer-car-web/api/profile/my-profile",
    "car-branch": "/ecommer-car-web/api/car-branch/get-all-car-branch",
    "car-model": "/ecommer-car-web/api/car-model/get-all-car-model",
    "car-category": "/ecommer-car-web/api/car-category/get-all-car-category",
    "get-cars": "/ecommer-car-web/api/car/get-products",
    "filter-cars": "/ecommer-car-web/api/car/filter-car",
    "get-car-by-id": id => `/ecommer-car-web/api/car/get-product-by-id/${id}`,

    "get-order": orderId => `/ecommer-car-web/api/orders/orders-car/${orderId}`,
    "get-reserves": "/ecommer-car-web/api/orders/get-history-order",
    "get-deposits": "/ecommer-car-web/api/orders/get-order-deposit",
    "create-orders": "/ecommer-car-web/api/orders/create-order",

    "checkout-vnpay": "/payment/api/checkout/url",
    "vnpay": "/payment/api/checkout/vnpay_ipn",
    "payment-response": orderId => `/payment/api/installment/${orderId}`,

    "get-or-create-conversation": "/chat/api/conversations/create-or-get",
    "my-conversation": "/chat/api/conversations/my-coversation",
    "get-all-conversation": "/chat/api/conversations/get-all-conversation",
    "create-message": "/chat/api/messages/create",
    "get-message": "/chat/api/messages/get-all-message",

    "my-payment": "payment/api/get-my-payment",

    "create-car": "/ecommer-car-web/api/staff/car/create-product",
    "delete-car": carId => `/ecommer-car-web/api/staff/car/delete-product/${carId}`,

    "get-all-model": "/ecommer-car-web/api/car-model/get-all-car-model",
    "create-model": "/ecommer-car-web/api/staff/car-model/create-car-model",
    "delete-model": carModelId => `/ecommer-car-web/api/staff/car-model/delete-car-model/${carModelId}`,

    "create-branch": "/ecommer-car-web/api/staff/car-branch/create-branch",
    "delete-branch": branchId => `/ecommer-car-web/api/staff/delete-branch/${branchId}`,

    "create-category": "/ecommer-car-web/api/staff/car-category/create-category",
    "delete-category": carCategoryId => `/ecommer-car-web/api/staff/car-category/delete-caterory/${carCategoryId}`,

    "get-inventory-by-car-id":  carId => `/ecommer-car-web/api/inventory/get-inventory-by-carId/${carId}`,
    "create-inventory": "/ecommer-car-web/api/inventory/create-inventory",
    "update-inventory": inventoryId => `/ecommer-car-web/api/inventory/update-inventory/${inventoryId}`,
    "delete-inventory": inventoryId => `/ecommer-car-web/api/inventory/delete-inventory/${inventoryId}`,

    "get-bill": id => `/payment/api/staff/get-bill/${id}`,
    "get-bill-by-order-id": orderId => `/payment/api/staff/get-bill-deposit/${orderId}`,
    "payment-cashier": "/payment/api/staff/payment",
    "get-all-deposit": "/payment/api/staff/get-all-deposit",

    "payment-not-deposit": "/payment/api/staff/payment-order-not-deposit",
    
    "search-by-image": "localhost:5000/predict"
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