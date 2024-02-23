import Vue from 'vue'
import Router from 'vue-router'
import api from "@/apis/auth.js";

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      name: "Login",
      path: '/login',
      component: () => import('@/views/dashboard/pages/Login'),
    },
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      meta: {
          requiresAuth: true
      },
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('@/views/dashboard/Dashboard'),
        },
        // Pages
        {
          name: 'Client List',
          path: 'pages/client',
          component: () => import('@/views/dashboard/pages/ClientList'),
          meta: {
            menuId: 1
          },
        },
        {
          name: 'Country List',
          path: 'pages/country',
          component: () => import('@/views/dashboard/pages/CountryList'),
          meta: {
              menuId: 3
          },
        },
        {
          name: 'HR- Manpower Associate types',
          path: 'pages/designation',
          component: () => import('@/views/dashboard/pages/Designation'),
          meta: {
              menuId: 4
          },
        },
        {
          name: 'Organization Wide Roles',
          path: 'pages/role',
          component: () => import('@/views/dashboard/pages/RoleList'),
          meta: {
              menuId: 5
          },
        },
        {
          name: 'People',
          path: 'pages/people',
          component: () => import('@/views/dashboard/pages/People'),
          meta: {
              menuId: 6
          },
        },
        {
          name: 'Associate',
          path: 'pages/associate_person',
          component: () => import('@/views/dashboard/pages/Associate'),
          meta: {
              menuId: 7
          },
        },
        {
          name: 'Task List',
          path: 'pages/task',
          component: () => import('@/views/dashboard/pages/TaskList'),
          meta: {
              menuId: 10
          },
        },
        {
          name: 'Project Summary',
          path: 'pages/project_summary',
          component: () => import('@/views/dashboard/pages/ProjectSummary'),
          meta: {
              menuId: 11
          },
        },
        {
          name: 'Project Detail',
          path: 'pages/project_detail',
          component: () => import('@/views/dashboard/pages/PDetail'),
        },
        {
          name: 'Project Original',
          path: 'pages/project_original',
          component: () => import('@/views/dashboard/pages/ProjectOriginal'),
        },
        {
          name: 'User Profile',
          path: 'pages/user',
          component: () => import('@/views/dashboard/pages/UserProfile'),
        },
        {
          name: 'Notifications',
          path: 'components/notifications',
          component: () => import('@/views/dashboard/component/Notifications'),
        },
        {
          name: 'Icons',
          path: 'components/icons',
          component: () => import('@/views/dashboard/component/Icons'),
        },
        {
          name: 'Typography',
          path: 'components/typography',
          component: () => import('@/views/dashboard/component/Typography'),
        },
        {
          name: 'Daily Update',
          path: 'pages/daily',
          component: () => import('@/views/dashboard/pages/Daily'),
          meta: {
              menuId: 12
          },
        },
        {
          name: 'Progress',
          path: 'pages/progress',
          component: () => import('@/views/dashboard/pages/CheckProgress'),
          meta: {
              menuId: 13
          },
        },
        {
          name: 'ManPower utilization',
          path: 'pages/manpower',
          component: () => import('@/views/dashboard/pages/Manpower'),
          meta: {
              menuId: 14
          },
        },
        {
          name: 'Leave Individual',
          path: 'pages/leave_i',
          component: () => import('@/views/dashboard/pages/LeaveI'),
          meta: {
              menuId: 15
          },
        },
        {
          name: 'Leave Manager',
          path: 'pages/leave_m',
          component: () => import('@/views/dashboard/pages/LeaveM'),
          meta: {
              menuId: 8
          },
        },
        {
          name: 'Leave Balance',
          path: 'pages/leave_b',
          component: () => import('@/views/dashboard/pages/LeaveB'),
          meta: {
            menuId: 9
          },
        },
        {
          name: 'Holiday Calendar',
          path: 'pages/holiday',
          component: () => import('@/views/dashboard/pages/Holiday'),
          meta: {
              menuId: 2
          },
        }
      ],
    }
  ],
})

const getToken = () => {
  const value = localStorage.getItem('pmFE001')
  const now = new Date()
  if (!value)
    return null
  if (now.getTime() > localStorage.getItem('time')) {
    localStorage.clear()
    return null
  }
  return value
}

let previlage = api.getLocalprevilage()
router.beforeEach((to, from, next) => {
  // check login
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (getToken() == null) {
      next({name: "Login"})
    }
  }

  // role menu id
  if (to.matched.some(record => record.meta.menuId)) {
    const menuId = to.matched[1].meta.menuId
    if (!previlage)
      previlage = api.getLocalprevilage()
    
    let found = null
    previlage && previlage.length > 0 && (found = previlage.find(p => {
      if (p.menuid == menuId) {
        const allowYes = p.privileges.find(a => a.allowed == 'yes')
        if (!allowYes)
          return true
      }
      return false
    }))
    if (found) {
      next('/')
    } else {
      localStorage.setItem('menuId', menuId)
    }
  }
  
  if (from && from.meta.menuId && from.meta.menuId == 10) {
    const dataChange = localStorage.getItem('dataChange') 
    if (dataChange) {
      if (confirm("Some data is changed. \nPlease click save button. \nAre you sure?")) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  } else {
    next()
  }

})

export default router
