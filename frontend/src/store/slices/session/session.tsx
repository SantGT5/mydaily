import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitState = {
  session: string
  isUser: boolean
  isAdmin: boolean
  user: Partial<Record<string, string | boolean>>
}

const initialState: InitState = {
  user: {},
  session: "",
  isUser: false,
  isAdmin: false,
}

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    reset: () => initialState,

    sessionMutation: (state, action: PayloadAction<Partial<InitState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { actions: sessionActions, reducer: sessionReducer } = sessionSlice
