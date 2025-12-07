import { createRouter, createWebHistory } from "vue-router";
import SummonsesCounter from "@/components/SummonsesCounter.vue";

const routes = [
  {
    path: "/",
    redirect: "/summonses-counter",
  },
  {
    path: "/summonses-counter",
    name: "SummonsesCounter",
    component: SummonsesCounter,
    meta: { requiresGuest: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
