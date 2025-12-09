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
    meta: {
      requiresGuest: true,
      icon: "/summonses_counter.png",
      title: "Summonses Counter",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.afterEach((to) => {
  const icon_link = () => {
    return `/simsim-tools${(to.meta.icon as string) || "/vite.svg"}`;
  };

  const link = document.querySelector("link[rel~='icon']");
  if (link) {
    // Use the icon from route meta, or fallback to default
    link.setAttribute("href", icon_link());
  }

  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
