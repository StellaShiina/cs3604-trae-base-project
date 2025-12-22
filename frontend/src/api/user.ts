import axios from 'axios'

const API_BASE_URL = '/api/v1'

export const getUserInfo = async () => {
  return axios.get(`${API_BASE_URL}/users/info`)
}
