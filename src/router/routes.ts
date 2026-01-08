import SummonsesCounter from "@/components/SummonsesCounter.vue";
import Home from "@/components/Home.vue";
import PdfMerger from "@/components/PdfMerger.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      icon: "/star.png",
      title: "Simsim Tools",
    },
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
  {
    path: "/pdf-merger",
    name: "PdfMerger",
    component: PdfMerger,
    meta: {
      icon: "/pdf_merger.png",
      title: "PDF Merger",
    },
  },
];

export default routes;
