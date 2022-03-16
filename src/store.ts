import { Dispatch, createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import Account from "./models/Account";
import Menus from "./models/Menus"
import User from "./models/User"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['accessToken', 'navActive', 'reportsMaxRows']
};

export type NavMode = 'main' | 'settings'

export type NavActive = {
  is: boolean,
  floating: boolean
}

export interface RedirectRoute {
  name: string,
  params: {
    [key: string]: string
  }
}

export interface StoreState {
  accessToken: string | null,
  accounts: Account[],
  selectedAccount: number | null,
  user: User | null,
  menus: Menus | null
  navMode: NavMode,
  redirectRoute: RedirectRoute | null,
  navActive: NavActive,
  reportsMaxRows: number
}

export interface StoreDispatch {
  setAccessToken(accessToken: string | null): void,
  setSelectedAccount(i: number | null): void,
  setAccounts(accounts: Account[]): void,
  setNavMode(mode: NavMode): void,
  setUser(user: User | null): void
  setMenus(menus: Menus | null): void
  setRedirectRoute(redirectRoute: RedirectRoute | null): void
  setNavActive(navActive: NavActive): void
  setReportsMaxRows(rows: number): void
}

export interface StoreDispatchAction {
  type: string,
  payload: any
}

export const mapStateToProps = (state: StoreState): {store: StoreState} => ({ store: state });
export const mapDispatchToProps = (dispatch: Dispatch): { dispatcher: StoreDispatch} => ({
  dispatcher: {
    setAccessToken: (accessToken) => dispatch({ payload: accessToken, type: "SET_ACCESS_TOKEN" }),
    setAccounts: (accounts) => dispatch({ payload: accounts, type: "SET_ACCOUNTS" }),
    setSelectedAccount: (i) => dispatch({ payload: i, type: "SET_SELECTED_ACCOUNT" }),
    setNavMode: (mode) => dispatch({ payload: mode, type: "SET_NAV_MODE" }),
    setUser: (user) => dispatch({ payload: user, type: "SET_USER" }),
    setMenus: (menus) => dispatch({ payload: menus, type: "SET_MENUS" }),
    setRedirectRoute: (redirectRoute) => dispatch({ payload: redirectRoute, type: "SET_REDIRECT_ROUTE" }),
    setNavActive: (navActive) => dispatch({ payload: navActive, type: "SET_NAV_ACTIVE" }),
    setReportsMaxRows: (navActive) => dispatch({ payload: navActive, type: "SET_REPORTS_MAX_ROWS" }),
  }
});

const initialState: StoreState = {
  accessToken: null,
  accounts: [],
  selectedAccount: null,
  navMode: 'main',
  user: null,
  menus: null,
  redirectRoute: null,
  navActive: {
    is: false,
    floating: false
  },
  reportsMaxRows: 100
}

function rootReducer(state = initialState, action: StoreDispatchAction) {

  // Set access token case
  if (action.type === "SET_ACCESS_TOKEN") {
    state.accessToken = action.payload as string | null;
    return {
      ...state,
      accessToken: action.payload as string | null
    };
  }

  // Set selected account case
  if (action.type === "SET_SELECTED_ACCOUNT") {
    state.selectedAccount = action.payload as number | null;
    return {
      ...state,
      selectedAccount: action.payload as number | null
    };
  }

  // Set accounts case
  if (action.type === "SET_ACCOUNTS") {
    state.accounts = action.payload as Account[];
    return {
      ...state,
      accounts: action.payload as Account[]
    };
  }

  // Set nav mode
  if (action.type === "SET_NAV_MODE") {
    state.navMode = action.payload as NavMode;
    return {
      ...state,
      navMode: action.payload as NavMode
    };
  }

  // Set user
  if (action.type === "SET_USER") {
    state.user = action.payload as User | null;
    return {
      ...state,
      user: action.payload as User | null
    };
  }

  // Set menus
  if (action.type === "SET_MENUS") {
    state.menus = action.payload as Menus | null;
    return {
      ...state,
      menus: action.payload as Menus | null
    };
  }

  // Set redirect route
  if (action.type === "SET_REDIRECT_ROUTE") {
    state.redirectRoute = action.payload as RedirectRoute | null;
    return {
      ...state,
      redirectRoute: action.payload as RedirectRoute | null
    };
  }

  // Set nav active
  if (action.type === "SET_NAV_ACTIVE") {
    state.navActive = action.payload as NavActive;
    return {
      ...state,
      navActive: action.payload as NavActive
    };
  }

  // Set nav active
  if (action.type === "SET_REPORTS_MAX_ROWS") {
    state.reportsMaxRows = action.payload as number;
    return {
      ...state,
      reportsMaxRows: action.payload as number
    };
  }

  return state;
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer)
export const persistor = persistStore(store as any)
