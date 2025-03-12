<script lang="ts" setup>
import type { TagView } from "@/pinia/stores/tags-view"
import type { RouteLocationNormalizedGeneric, RouteRecordRaw, RouterLink } from "vue-router"
import { usePermissionStore } from "@/pinia/stores/permission"
import { useTagsViewStore } from "@/pinia/stores/tags-view"
import { useRouteListener } from "@@/composables/useRouteListener"
import { Close } from "@element-plus/icons-vue"
import path from "path-browserify"
import ScrollPane from "./ScrollPane.vue"

const router = useRouter()

const route = useRoute()

const tagsViewStore = useTagsViewStore()

const permissionStore = usePermissionStore()

const { listenerRouteChange } = useRouteListener()

/** 탭 구성 요소 요소의 참조 배열 */
const tagRefs = ref<InstanceType<typeof RouterLink>[]>([])

/** 마우스 오른쪽 버튼 클릭 메뉴의 상태 */
const visible = ref(false)

/** 마우스 오른쪽 버튼 클릭 메뉴의 상단 위치 */
const top = ref(0)

/** 右键菜单的 left 位置 */
const left = ref(0)

/** 탭 페이지는 현재 오른쪽 클릭하여 작동 중입니다 */
const selectedTag = ref<TagView>({})

/** 고정 탭 페이지 */
let affixTags: TagView[] = []

/** 탭 페이지가 활성화되어 있는지 확인 */
function isActive(tag: TagView) {
  return tag.path === route.path
}

/** 탭 페이지가 고정되어 있는지 확인 */
function isAffix(tag: TagView) {
  return tag.meta?.affix
}

/** 고정 탭 페이지를 필터링 */
function filterAffixTags(routes: RouteRecordRaw[], basePath = "/") {
  const tags: TagView[] = []
  routes.forEach((route) => {
    if (isAffix(route)) {
      const tagPath = path.resolve(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const childTags = filterAffixTags(route.children, route.path)
      tags.push(...childTags)
    }
  })
  return tags
}

/** 탭 페이지 초기화 */
function initTags() {
  affixTags = filterAffixTags(permissionStore.routes)
  for (const tag of affixTags) {
    // 이름 속성을 포함해야합니다
    tag.name && tagsViewStore.addVisitedView(tag)
  }
}

/** 태그 추가 페이지 */
function addTags(route: RouteLocationNormalizedGeneric) {
  if (route.name) {
    tagsViewStore.addVisitedView(route)
    tagsViewStore.addCachedView(route)
  }
}

/** 현재 마우스 오른쪽 버튼을 클릭하는 탭 페이지를 새로 고침 */
function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view)
  router.replace({ path: `/redirect${view.path}`, query: view.query })
}

/** 현재 마우스 오른쪽 버튼을 클릭하는 탭 페이지를 닫습니다 */
function closeSelectedTag(view: TagView) {
  tagsViewStore.delVisitedView(view)
  tagsViewStore.delCachedView(view)
  isActive(view) && toLastView(tagsViewStore.visitedViews, view)
}

/** 다른 탭 닫기 */
function closeOthersTags() {
  const fullPath = selectedTag.value.fullPath
  if (fullPath !== route.path && fullPath !== undefined) {
    router.push(fullPath)
  }
  tagsViewStore.delOthersVisitedViews(selectedTag.value)
  tagsViewStore.delOthersCachedViews(selectedTag.value)
}

/** 모든 탭을 닫습니다 */
function closeAllTags(view: TagView) {
  tagsViewStore.delAllVisitedViews()
  tagsViewStore.delAllCachedViews()
  if (affixTags.some(tag => tag.path === route.path)) return
  toLastView(tagsViewStore.visitedViews, view)
}

/** 마지막 탭으로 점프 */
function toLastView(visitedViews: TagView[], view: TagView) {
  const latestView = visitedViews.slice(-1)[0]
  const fullPath = latestView?.fullPath
  if (fullPath !== undefined) {
    router.push(fullPath)
  } else {
    // tagsview가 모두 닫히면 기본적으로 홈페이지로 리디렉션됩니다.
    if (view.name === "Dashboard") {
      // 홈페이지를 다시로드합니다
      router.push({ path: `/redirect${view.path}`, query: view.query })
    } else {
      router.push("/")
    }
  }
}

/** 마우스 오른쪽 버튼 클릭 메뉴 패널 열기 */
function openMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 100
  // 현재 페이지 너비
  const offsetWidth = document.body.offsetWidth
  // 面板的最大左边距
  const maxLeft = offsetWidth - menuMinWidth
  // 面板距离鼠标指针的距离
  const left15 = e.clientX + 10
  left.value = left15 > maxLeft ? maxLeft : left15
  top.value = e.clientY
  // 显示面板
  visible.value = true
  // 마우스 오른쪽 버튼으로 현재 작동중인 탭 페이지를 업데이트합니다.
  selectedTag.value = tag
}

/** 마우스 오른쪽 버튼 클릭 메뉴 패널을 닫습니다 */
function closeMenu() {
  visible.value = false
}

watch(visible, (value) => {
  value ? document.body.addEventListener("click", closeMenu) : document.body.removeEventListener("click", closeMenu)
})

initTags()

// 라우팅 변경을 듣습니다
listenerRouteChange((route) => {
  addTags(route)
}, true)
</script>

<template>
  <div class="tags-view-container">
    <ScrollPane class="tags-view-wrapper" :tag-refs="tagRefs">
      <router-link
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        ref="tagRefs"
        :class="{ active: isActive(tag) }"
        class="tags-view-item"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) && closeSelectedTag(tag)"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.title }}
        <el-icon v-if="!isAffix(tag)" :size="12" @click.prevent.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </router-link>
    </ScrollPane>
    <ul v-show="visible" class="contextmenu" :style="{ left: `${left}px`, top: `${top}px` }">
      <li @click="refreshSelectedTag(selectedTag)">
        새로 고치다
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        关闭
      </li>
      <li @click="closeOthersTags">
        다른 사람들을 닫습니다
      </li>
      <li @click="closeAllTags(selectedTag)">
        모두 닫으십시오
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
  height: var(--v3-tagsview-height);
  width: 100%;
  color: var(--v3-tagsview-text-color);
  overflow: hidden;
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid var(--v3-tagsview-tag-border-color);
      border-radius: var(--v3-tagsview-tag-border-radius);
      background-color: var(--v3-tagsview-tag-bg-color);
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &.active {
        background-color: var(--v3-tagsview-tag-active-bg-color);
        color: var(--v3-tagsview-tag-active-text-color);
        border-color: var(--v3-tagsview-tag-active-border-color);
      }
      .el-icon {
        margin-left: 5px;
        margin-right: 1px;
        border-radius: 50%;
        &:hover {
          background-color: var(--v3-tagsview-tag-icon-hover-bg-color);
          color: var(--v3-tagsview-tag-icon-hover-color);
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    z-index: 3000;
    position: fixed;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    color: var(--v3-tagsview-contextmenu-text-color);
    background-color: var(--v3-tagsview-contextmenu-bg-color);
    box-shadow: var(--v3-tagsview-contextmenu-box-shadow);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        color: var(--v3-tagsview-contextmenu-hover-text-color);
        background-color: var(--v3-tagsview-contextmenu-hover-bg-color);
      }
    }
  }
}
</style>
