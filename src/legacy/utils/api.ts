import axios from 'axios'

export const INTERNAL_API = axios.create({
  baseURL: '/api/'
})
