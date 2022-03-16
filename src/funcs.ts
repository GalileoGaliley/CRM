import axios, { AxiosError } from "axios"
import Account from "./models/Account";
import { StoreDispatch, StoreState } from "./store";
import router from './router'
import {strict} from "assert";

export function getActiveAccount(store: StoreState): Account | null {
  if(store.selectedAccount === null) return null
  return store.accounts[store.selectedAccount]
}

export async function signIn(email : string, password: string) {
  // login
  try {
    await httpClient.post('/login',{email, password}).then(({data})=>{
      data = JSON.parse(data);
      localStorage.setItem('token', data.token);
    })
  } catch(e) {

  }





  // Redirect to auth page
  router.navigate('auth')
}

export async function signOut(dispatcher: StoreDispatch) {
  dispatcher.setAccessToken(null)
  dispatcher.setAccounts([])
  dispatcher.setSelectedAccount(null)
  dispatcher.setUser(null)

  // Perform logout
  try {await httpClient.post('/logout')} catch(e) {}
  delete httpClient.defaults.headers['Authorization']

  // Redirect to auth page
  router.navigate('auth')
}

export function nError(error: Error | AxiosError | unknown): {

  error: Error | AxiosError | unknown,
  content: {
    code?: number,
    errorText: string
  }
} {

  // HTTP error (axios)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((<any>error).isAxiosError) {
    const _error = <AxiosError>error
    // eslint-disable-next-line no-console
    console.warn(_error.request, _error.response)

    if (!_error.response) return {
      content: {
        errorText: "Can`t connect to server"
      },
      error
    }

    const errorText = _error.response.data.message

    return {
      content: {
        errorText
      },
      error
    }
  }

  // Another error
  else {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  // Return error content
  return {
    content: {
      errorText: String(error)
    },
    error
  }
}

export const httpClient = axios.create({
  baseURL: 'http://crm56new.artemiudintsev.com/api'
})
//node - 'https://crm57api.artemiudintsev.com'  laravel - 'http://crm56new.artemiudintsev.com/api'
export function leadingZero(int: number) {
  return (int <= 9 ? '0' : '') + int
}

export function formatTime(seconds: number) {
  return (
    [
      0,
      Math.floor(seconds / 60),
      Math.floor(seconds % 60),
    ]
      .map(x => x.toString())
      .map(x => (x.length === 1 ? `0${x}` : x))
      .join(":")
  );
}

export function calculatePercent(min: number, max: number) {
  return min / max * 100
}

export function calculateFromPercent(value: number, min: number, max: number) {
  return max / 100 * value
}
