import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://localhost:8888/api/v1";

export const endpoints = {
    "login": "/ecommer-car-web/profile/login",
    "my-profile": "/ecommer-car-web/profile/my-profile",
    "car-branch": "/ecommer-car-web/car-branch/get-all-car-branch",
    "get-cars": "/ecommer-car-web/car/get-products",
    "get-car-by-id": id => `/ecommer-car-web/car/get-product-by-id/${id}`
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