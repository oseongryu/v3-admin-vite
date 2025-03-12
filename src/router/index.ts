import type { RouteRecordRaw } from "vue-router"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name 상주 라우트
 * @description redirect/403/404/login 등의 숨겨진 페이지를 제외하고, 다른 페이지는 고유한 Name 속성을 설정하는 것이 좋습니다.
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "홈",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  {
    path: "/demo",
    component: Layouts,
    redirect: "/demo/unocss",
    name: "Demo",
    meta: {
      title: "예제 모음",
      elIcon: "DataBoard"
    },
    children: [
      {
        path: "unocss",
        component: () => import("@/pages/demo/unocss/index.vue"),
        name: "UnoCSS",
        meta: {
          title: "UnoCSS"
        }
      },
      {
        path: "element-plus",
        component: () => import("@/pages/demo/element-plus/index.vue"),
        name: "ElementPlus",
        meta: {
          title: "Element Plus",
          keepAlive: true
        }
      },
      {
        path: "vxe-table",
        component: () => import("@/pages/demo/vxe-table/index.vue"),
        name: "VxeTable",
        meta: {
          title: "Vxe Table",
          keepAlive: true
        }
      },
      {
        path: "level2",
        component: () => import("@/pages/demo/level2/index.vue"),
        redirect: "/demo/level2/level3",
        name: "Level2",
        meta: {
          title: "2단계 라우트",
          alwaysShow: true
        },
        children: [
          {
            path: "level3",
            component: () => import("@/pages/demo/level2/level3/index.vue"),
            name: "Level3",
            meta: {
              title: "3단계 라우트",
              keepAlive: true
            }
          }
        ]
      },
      {
        path: "composable-demo",
        redirect: "/demo/composable-demo/use-fetch-select",
        name: "ComposableDemo",
        meta: {
          title: "조합 함수"
        },
        children: [
          {
            path: "use-fetch-select",
            component: () => import("@/pages/demo/composable-demo/use-fetch-select.vue"),
            name: "UseFetchSelect",
            meta: {
              title: "useFetchSelect"
            }
          },
          {
            path: "use-fullscreen-loading",
            component: () => import("@/pages/demo/composable-demo/use-fullscreen-loading.vue"),
            name: "UseFullscreenLoading",
            meta: {
              title: "useFullscreenLoading"
            }
          },
          {
            path: "use-watermark",
            component: () => import("@/pages/demo/composable-demo/use-watermark.vue"),
            name: "UseWatermark",
            meta: {
              title: "useWatermark"
            }
          }
        ]
      }
    ]
  },
  {
    path: "/link",
    meta: {
      title: "문서 링크",
      elIcon: "Link"
    },
    children: [
      {
        path: "https://juejin.cn/post/7445151895121543209",
        component: () => { },
        name: "Link1",
        meta: {
          title: "중국어 문서"
        }
      },
      {
        path: "https://juejin.cn/column/7207659644487139387",
        component: () => { },
        name: "Link2",
        meta: {
          title: "초보자 튜토리얼"
        }
      }
    ]
  }
]

/**
 * @name 동적 라우트
 * @description 권한 (Roles 속성)이 있는 라우트를 배치하는 곳
 * @description 고유한 Name 속성을 반드시 가져야 합니다.
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/page-level",
    name: "Permission",
    meta: {
      title: "권한 데모",
      elIcon: "Lock",
      // 루트 라우트에서 역할을 설정할 수 있습니다.
      roles: ["admin", "editor"],
      alwaysShow: true
    },
    children: [
      {
        path: "page-level",
        component: () => import("@/pages/demo/permission/page-level.vue"),
        name: "PermissionPageLevel",
        meta: {
          title: "페이지 수준",
          // 또는 자식 라우트에서 역할을 설정할 수 있습니다.
          roles: ["admin"]
        }
      },
      {
        path: "button-level",
        component: () => import("@/pages/demo/permission/button-level.vue"),
        name: "PermissionButtonLevel",
        meta: {
          title: "버튼 수준",
          // 역할이 설정되지 않은 경우: 이 페이지는 권한이 필요하지 않지만 루트 라우트의 역할을 상속받습니다.
          roles: undefined
        }
      }
    ]
  }
]

/** 路由实例 */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    location.reload()
  }
}

// 注册路由导航守卫
registerNavigationGuard(router)
