import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://localhost:8888/api/v1";
export const CHAT_URL = "http://localhost:8099";
// console.log("CHAT_URL initialized as:", CHAT_URL);


export const endpoints = {
    //Identity service
    "login": "/identity/api/login",
    "register": "/identity/api/register",
    "refresh": "/identity/api/refresh",
    "logout": "/identity/api/logout",
    "create-staff": "/identity/api/create-staff",
    "my-profile": "/identity/api/profile/my-profile",
    "all-profiles": "/identity/api/profile/all-profiles",

    //Catalog service
    "get-all-branch": "/catalog/api/car-branch/get-all-car-branch",
    "get-branch-by-id": id => `/catalog/api/car-branch/get-branch-by-id/${id}`,
    "create-branch": "/catalog/api/staff/car-branch/create-branch",
    "delete-branch": id => `/catalog/api/staff/delete-branch/${id}`,
    "update-branch": id => `/catalog/api/staff/update-branch/${id}`,

    "get-all-category": "/catalog/api/car-category/get-all-car-category",
    "get-category-by-id": id => `/catalog/api/car-category/get-car-category-by-id/${id}`,
    "create-category": "/catalog/api/staff/car-category/create-category",
    "delete-category": id => `/catalog/api/staff/car-category/delete-category/${id}`,
    "update-category": id => `/catalog/api/staff/car-category/update-category/${id}`,

    "get-all-model": "/catalog/api/car-model/get-all-car-model",
    "get-model-by-id": id => `/catalog/api/car-model/get-car-model-by-id/${id}`,
    "create-model": "/catalog/api/staff/car-model/create-car-model",
    "delete-model": id => `/catalog/api/staff/car-model/delete-car-model/${id}`,
    "update-model": id => `/catalog/api/staff/car-model/update-car-model/${id}`,

    "get-cars": (page = 1, size = 12, extraParams = {}) => {
        const base = `/catalog/api/car/get-cars?page=${page}&size=${size}`;
        const extra = new URLSearchParams(extraParams).toString();
        return extra ? `${base}&${extra}` : base;
    },
    "get-staff-cars": (page = 1, size = 12) => `/catalog/api/staff/car/get-cars?page=${page}&size=${size}`,
    "get-staff-management-cars": (page = 1, size = 10) => `/catalog/api/staff/management/cars?page=${page}&size=${size}`,
    "get-price": id => `/catalog/api/get-price/${id}`,
    "get-car-by-id": id => `/catalog/api/car/get-car-by-id/${id}`,
    "filter-car": params => `/catalog/api/car/filter-car?${new URLSearchParams(params).toString()}`,

    "create-car": "/catalog/api/staff/car/create-car",
    "update-car": id => `/catalog/api/staff/car/update-car/${id}`,
    "upload-3d-model": id => `/catalog/api/staff/car/upload-3d-model/${id}`,
    "delete-car": id => `/catalog/api/staff/car/delete-car/${id}`,

    "get-inventory": id => `/catalog/api/inventory/get-inventory/${id}`,
    "get-inventory-by-car-id": carId => `/catalog/api/inventory/get-inventory-by-car-id/${carId}`,
    "get-all-inventory": (page = 1, size = 12) => `/catalog/api/inventory/get-all-inventory?page=${page}&size=${size}`,
    "check-inventory": (carId, quantity) => `/catalog/api/cars/check-inventory/${carId}/${quantity}`,

    "create-inventory": "/catalog/api/staff/inventory/create-inventory",
    "update-inventory": id => `/catalog/api/staff/inventory/update-inventory/${id}`,
    "delete-inventory": id => `/catalog/api/staff/inventory/delete-inventory/${id}`,

    "get-info-showroom": "/catalog/api/showroom/get-info-showroom",

    "create-showroom": "/catalog/api/admin/create-showroom",
    "update-showroom": id => `/catalog/api/admin/update-showroom/${id}`,
    "delete-showroom": id => `/catalog/api/admin/delete-showroom/${id}`,


    // Ordering Service
    "check-order-by-id": id => `/ordering/orders/check-order-by-id/${id}`,
    "create-order": "/ordering/orders/create",
    "get-my-orders": "/ordering/orders/my-orders",
    "get-order-by-id": id => `/ordering/orders/get-order-by-id/${id}`,
    "cancel-order": (id, reason) => `/ordering/orders/cancel-order-id/${id}?reason=${encodeURIComponent(reason)}`,

    "confirm-delivery": id => `/ordering/orders/confirm-delivery/${id}`,

    "download-order-pdf": id => `/ordering/orders/export/${id}/pdf`,
    "send-order-email": (id, email) => `/ordering/orders/export/${id}/send-email?email=${encodeURIComponent(email)}`,

    "get-order-timeline": id => `/ordering/orders/history/${id}/timeline`,

    "get-all-orders-management": (page = 1, size = 10, status = "") => `/ordering/staff/orders/all-orders?page=${page}&size=${size}${status ? `&status=${status}` : ""}`,
    "admin-cancel-order": (id, note = "") => `/ordering/staff/orders/cancel-order/${id}${note ? `?note=${encodeURIComponent(note)}` : ""}`,
    "get-revenue": (start, end) => `/ordering/staff/orders/revenue?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    "get-status-count": "/ordering/staff/orders/stats/status-count",
    "get-monthly-revenue": (year = 2026) => `/ordering/staff/orders/revenue/monthly?year=${year}`,
    "get-stats-revenue": (year = 2026, month = "") => {
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        return `/ordering/staff/orders/stats/revenue${params.length ? `?${params.join("&")}` : ""}`;
    },
    "get-stats-brands": (year = 2026, month = "") => {
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        return `/ordering/staff/orders/stats/brands${params.length ? `?${params.join("&")}` : ""}`;
    },

    // Payment Service
    "create-vnpay-url": "/payment/payments/create-vnpay-url",
    "confirm-offline": "/payment/payments/staff/confirm-offline",
    "create-offline-payment": "/payment/payments/staff/create-payment",
    "get-payment-status": orderId => `/payment/payments/status/${orderId}`,
    "get-all-payments-management": (page = 1, size = 10, status = "PARTIALLY_PAID") => `/payment/payments/staff/all-payments?page=${page}&size=${size}&status=${status}`,

    // Chat Service
    "create-message": "/chat/api/messages/create",
    "get-message": "/chat/api/messages/get-all-message",
    "create-or-get-conversation": "/chat/api/conversations/create-or-get",
    "get-or-create-conversation": "/chat/api/conversations/create-or-get",
    "customer-get-conversation": "/chat/api/conversations/customer-get-conversation",
    "staff-join-conversation": id => `/chat/api/conversations/join/${id}`,
    "get-all-conversation": "/chat/api/conversations/get-all-conversation",
    "get-all-conversations": "/chat/api/conversations/get-all-conversation",

    //AI Service
    "chat": "/ai/chat",
    "clear-chat-history": "/ai/clear-history",
    "identify-car": "/ai/identify-car-pro",
    "predict-car-price": "/ai/predict-price",
    "get-car-hierarchy": "/ai/car-hierarchy",
    "ai-health": "/ai/health",
    "ai-root": "/ai/",

    // Appraisal Service
    "create-appraisal": "/catalog/api/appraisals/create",
    "my-appraisals": "/catalog/api/appraisals/my-requests",
    "respond-to-offer": (id, accepted) => `/catalog/api/appraisals/${id}/respond-to-offer?accepted=${accepted}`,
    "get-all-appraisals": (page = 1, size = 10, status = "") =>
        `/catalog/api/appraisals/get-all-appraisals?page=${page}&size=${size}${status ? `&status=${status}` : ""}`,
    "offer-price": (id) => `/catalog/api/appraisals/${id}/offer-price`,
    "update-appraisal-status": (id) => `/catalog/api/appraisals/${id}/status`,
    "convert-to-inventory": (id) => `/catalog/api/appraisals/convert-to-inventory/${id}`,

}

export const authApis = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${cookie.load('token')}`,
            'ngrok-skip-browser-warning': 'true'
        }
    });
}

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
})