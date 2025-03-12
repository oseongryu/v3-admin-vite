<script lang="ts" setup>
import type { RouteLocationMatched } from "vue-router"
import { useRouteListener } from "@@/composables/useRouteListener"
import { compile } from "path-to-regexp"

const route = useRoute()

const router = useRouter()

const { listenerRouteChange } = useRouteListener()

/** 반응 형 데이터 정의 빵 부스러기를 빵 부스러기 내비게이션 정보를 저장합니다 */
const breadcrumbs = ref<RouteLocationMatched[]>([])

/** Breadcrumb Navigation 정보 받기 */
function getBreadcrumb() {
  breadcrumbs.value = route.matched.filter(item => item.meta?.title && item.meta?.breadcrumb !== false)
}

/** 라우팅 경로 컴파일 */
function pathCompile(path: string) {
  const toPath = compile(path)
  return toPath(route.params)
}

/** 빵 부스러기 내비게이션 클릭 클릭 이벤트 */
function handleLink(item: RouteLocationMatched) {
  const { redirect, path } = item
  if (redirect) return router.push(redirect as string)
  router.push(pathCompile(path))
}

// 라우팅 변경을 듣고 빵 부스러기 탐색 정보를 업데이트합니다.
listenerRouteChange((route) => {
  if (route.path.startsWith("/redirect/")) return
  getBreadcrumb()
}, true)
</script>

<template>
  <el-breadcrumb>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span v-if="item.redirect === 'noRedirect' || index === breadcrumbs.length - 1" class="no-redirect">
        {{ item.meta.title }}
      </span>
      <a v-else @click.prevent="handleLink(item)">
        {{ item.meta.title }}
      </a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style lang="scss" scoped>
.el-breadcrumb {
  line-height: var(--v3-navigationbar-height);
  .no-redirect {
    color: var(--el-text-color-placeholder);
  }
  a {
    font-weight: normal;
  }
}
</style>
