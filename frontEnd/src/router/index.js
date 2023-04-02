/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Signup from '../views/Signup.vue'
import Signin from '../views/Signin.vue'
import Forgot from '../views/Forgot.vue'
import Administrator from '../views/Administrator.vue'
import Resources from '../views/Resources.vue'
import BookComputers from '../views/BookComputers.vue'
import HourTracking from '../views/HourTracking.vue'
import NotAdmin from '../views/NotAdmin';
import MissingPage from '../views/MissingPage';
import firebaseApp from '../firebaseConfig';
import { getUserByEmailLocally } from '../services/apiServices';

//import firebase
/*
import * as firebase from 'firebase';
import 'firebase/auth'
*/
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: HourTracking,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/signin',
    component: Signin
  },
  {
    path: '/resources',
    component: Resources,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/signup',
    component: Signup
  },
  {
    path: '/forgot',
    component: Forgot
  },
  {
    path: '/bookcomputers',
    component: BookComputers,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/admin/home',
    component: Administrator,
    meta: {
      requiresAuth: true,
      requiresAdminPerm: true,
    }
  },
  {
    path: '/notadmin',
    component: NotAdmin,
  },
  {
    path: '*',
    component: MissingPage
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdminPerm = to.matched.some(record => record.meta.requiresAdminPerm);

  const currentUser = await firebaseApp.getCurrentUser();
  if (requiresAuth && !currentUser){
    next('signin');
  } else if (requiresAdminPerm) {
      const currentUserEmail = currentUser.email;
      const currentUserObj = await getUserByEmailLocally(currentUserEmail);
      if (!currentUserObj.isAdmin) {
        next('notadmin');
      } else {
        next();
      }
  } else {
    next();
  }
});

export default router;