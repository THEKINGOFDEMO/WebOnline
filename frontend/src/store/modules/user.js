import { login, logout, getInfo } from '@/api/auth'
import { getToken, setToken, /* removeToken, */ setUserInfo, /* removeUserInfo, */ clearAuth } from '@/utils/auth'

const state = {
  token: getToken(),
  userInfo: null,
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { token, user } = response
          commit('SET_TOKEN', token)
          commit('SET_USER_INFO', user)
          setToken(token)
          setUserInfo(user)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户信息
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then(response => {
          const { user } = response
          if (!user) {
            reject('验证失败，请重新登录。')
          }

          const { role } = user

          // 验证角色是否存在
          if (!role) {
            reject('用户角色不能为空!')
          }

          commit('SET_ROLES', [role])
          commit('SET_USER_INFO', user)
          setUserInfo(user)
          resolve(user)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 用户登出
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_USER_INFO', null)
          clearAuth()
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 前端登出
  fedLogout({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_USER_INFO', null)
      clearAuth()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 