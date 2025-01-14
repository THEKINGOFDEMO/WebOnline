import { createStore } from 'vuex'
import user from './modules/user'

const store = createStore({
  modules: {
    user
  },
  getters: {
    token: state => state.user.token,
    userInfo: state => state.user.userInfo,
    roles: state => state.user.roles,
    role: state => state.user.roles[0],
    isAuthenticated: state => !!state.user.token
  }
})

export default store 