import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../components/Icon"
import { httpClient, nError } from "../funcs"
import businessAccountIconImg from "../images/business-account_icon.svg"

import logoImg from "../images/logo.svg"

import Account from "../models/Account"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/pages/auth.sass"
import { validateMany } from "../validate"

import qs from "qs"
import { useRoute } from "react-router5"
import User from "../models/User"
import Menus from "../models/Menus"


interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const AuthPage = connect(mapStateToProps, mapDispatchToProps)(function AuthPage(props: Props) {

  const $router = useRoute()

  const [mode, setMode] = useState<"auth" | "password-reset" | "account-select">($router.route.params.mode)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [authData, setAuthData] = useState<Partial<StoreState>>({
    accessToken: null,
    accounts: [],
    selectedAccount: null,
    user: null
  })
  const [authForm, setAuthForm] = useState({
    $disabled: false,

    email: "",
    password: ""
  })

  // Auth function
  async function auth() {

    // Reset error text
    setErrorText(null)

    // Prevent from sending form again
    setAuthForm({ ...authForm, $disabled: false })

    // Fetch form data
    const { email, password } = authForm

    try {

      // Validate input data
      const validationErrors = ([
        { displayFieldText: "E-Mail", entity: email, rule: "email" },
        { displayFieldText: "Password", entity: password, rule: "password" }
      ])
      // if (validationErrors.length)
      //   throw new Error(validationErrors.join("\n"))

      // Perform autorization
      const { data: { token: accessToken } } = await httpClient.post('/login', qs.stringify({ email, password }), {
        headers: {
          'Accept': 'application/jsons',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      httpClient.defaults.headers['Authorization'] = `Bearer ${accessToken}`

      // Get accounts list

      const { data: { accounts }} = await httpClient.get('/accounts',{
        headers: {
          'Accept': 'application/jsons',
          'Token':`Bearer ${accessToken}`
        }
      })


      // Save info
      setAuthData({
        accessToken: accessToken,
        accounts
      })

      // Show select account menu
      $router.router.navigate('auth', {
        mode: "account-select"
      }, {reload: true})
    }
    catch (error) {

      setErrorText(nError(error).content.errorText)
    }
    finally {
      setAuthForm({ ...authForm, $disabled: false })
    }
  }

  // Select account function
  async function selectAccount(i: number) {
    props.dispatcher.setAccessToken(authData.accessToken as string | null);
    props.dispatcher.setAccounts(authData.accounts as Account[])
    props.dispatcher.setSelectedAccount(i)
    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`;
  }

  // Handle mode
  useEffect(() => {
    setMode($router.route.params.mode)
  }, [$router.route.params.mode])

  // Handle account select on page mount
  useEffect(() => {
    
    if (props.store.accessToken) {
      httpClient.get('/accounts').then(({ data: { accounts }}) => {
        setAuthData({
          ...authData,
          accessToken: props.store.accessToken,
          accounts
        })
      })
    }
  }, [])

  // Render function
  return (
    <div className="AuthPage">
      
      { /* Project about */ }
      <div className="ProjectHeaders" onClick={ () => mode != 'account-select' && $router.router.navigate('auth', {mode: 'auth'}, {reload: true}) }>
        <img src={ logoImg } alt="" />

        <div className="headers">
          <h1>Expert @ FS</h1>
          <h2>Manage your business!</h2>
        </div>
      </div>

      { /* Auth wrapper */ }
      <div className="auth-wrapper">

        { /* Auth form */ }
        { mode === "auth" ? (
          <form onSubmit={ (e) => {e.preventDefault(); auth()} }>
            <h2>Sign In</h2>

            <div className="__form-field">
              <div className="label">E-Mail:</div>
              <input type="text" onChange={ ({ target: { value } }) => setAuthForm({ ...authForm, email: value }) } />
            </div>
            <div className="__form-field">
              <div className="label">Password:</div>
              <input
                type="password"
                onChange={ ({ target: { value } }) => setAuthForm({ ...authForm, password: value }) }
              />
            </div>

            { errorText ? (
              <div className="errorText">{ errorText }</div>
            ) : null }

            <button
              type="button"
              className="_zeroed password-reset-link"
              onClick={ () => $router.router.navigate('auth', {mode: 'password-reset'}, {reload: true}) }
            >
              Forgot password?
            </button>

            <button className="_wa __submit" >
              Sign In
            </button>
          </form>
        ) : null }
        
        { /* Password reset form */ }
        { mode === "password-reset" ? (
          <form onSubmit={ (e) => e.preventDefault() }>
            <h2>Reset Password</h2>

            <p>
              Enter your E-Mail and we will send the link:
            </p>

            <div className="__form-field">
              <input type="text" placeholder="Your E-Mail..." />
            </div>

            <button className="_wa __submit">
              Submit
            </button>
          </form>
        ) : null }
        
        { /* Select account form */ }
        { mode === "account-select" ? (
          <form onSubmit={ (e) => e.preventDefault() }>

            <div className="account-select">

              { authData.accounts?.map((account, i) => (
                <div className="account" key={ i } onClick={ () => selectAccount(i) } aria-hidden="true">
                  <img src={ businessAccountIconImg } alt="" />
                  <span>{ account.name }</span>

                  <div className="stats-signs">
                    <Icon icon="bell-1"/>
                    <Icon icon="help-1"/>
                  </div>
                </div>
              )) }
            </div>
          </form>
        ) : null }
      </div>
    </div>
  )
})
export default AuthPage
