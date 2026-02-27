import { createRouter, createWebHashHistory } from 'vue-router'
import NoteView from '../components/NoteView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: NoteView,
      props: (route) =>
        ({ path: ([] as string[]).concat(route.params.pathMatch as string | string[]).filter(Boolean).join('/') }),
    },
  ],
})
