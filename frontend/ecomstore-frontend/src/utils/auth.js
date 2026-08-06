import api from './api'



export const setTokens = (access, refresh) => {

    localStorage.setItem('access_token', access)

    localStorage.setItem('refresh_token', refresh)

}



export const getAccessToken = () => localStorage.getItem('access_token')

export const getRefreshToken = () => localStorage.getItem('refresh_token')



export const removeTokens = () => {

    localStorage.removeItem('access_token')

    localStorage.removeItem('refresh_token')

}



export const isAuthenticated = () => !!localStorage.getItem('access_token')



export const logoutUser = async () => {

    const refreshToken = getRefreshToken()

    try {
        if (refreshToken) {
            await api.post('accounts/logout/', { refresh_token: refreshToken })
        }
    } finally {
        removeTokens()
    }

}

