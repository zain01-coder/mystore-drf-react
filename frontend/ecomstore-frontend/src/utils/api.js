import axios from "axios";
import { getAccessToken, getRefreshToken, removeTokens, setTokens } from "./auth";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

/*
Request interceptors are functions that Axios executes before sending every HTTP request.

They receive the request configuration (config), allowing us to modify the request
before it reaches the server.

In this project, we use a request interceptor to automatically add the JWT access
token to the Authorization header of every protected request.
In react there are two interceptors one is the request and the other one is the response
both of them have a function called the use function
This function will add the access token to every http request that will be sent
Use function takes two functions one is the successful one and the other is the one that will be called when an error occurs
*/

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken()

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error) => Promise.reject(error)
)


/* 
This interceptor will be called before every response
The flow will be like this
React
   │
   ▼
Request goes to Django
   │
   ▼
Django processes request
   │
   ▼
Django sends response
   │
   ▼
Response Interceptor
   │
   ▼
React receives response
*/

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        /*
        If the server returns an error (such as 401 Unauthorized),
        Axios creates an error object.
        error = {

            response: {
                status: 401
            },

            config: {
                method: "GET",
                url: "cart/",
                headers: {
                    Authorization: "Bearer oldAccessToken"
                }
            }

        }
        */
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = getRefreshToken()

                if (!refreshToken) {
                    removeTokens()
                    return Promise.reject(error)
                }

                const response = await axios.post(`${API_BASE_URL}accounts/token/refresh/`, {
                    refresh: refreshToken,
                })

                const newAccessToken = response.data.access
                const newRefreshToken = response.data.refresh || refreshToken

                setTokens(newAccessToken, newRefreshToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return api(originalRequest)
            } catch (refreshError) {
                removeTokens()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
