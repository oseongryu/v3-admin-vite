<script lang="ts" setup>
import type { ElScrollbar } from "element-plus"
import type { RouteRecordNameGeneric, RouteRecordRaw } from "vue-router"
import { usePermissionStore } from "@/pinia/stores/permission"
import { useDevice } from "@@/composables/useDevice"
import { isExternal } from "@@/utils/validate"
import { cloneDeep, debounce } from "lodash-es"
import Footer from "./Footer.vue"
import Result from "./Result.vue"

/** 控制 modal 显隐 */
const modelValue = defineModel<boolean>({ required: true })

const router = useRouter()
const { isMobile } = useDevice()

const inputRef = ref<HTMLInputElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)
const resultRef = ref<InstanceType<typeof Result> | null>(null)

const keyword = ref<string>("")
const result = shallowRef<RouteRecordRaw[]>([])
const activeRouteName = ref<RouteRecordNameGeneric | undefined>(undefined)
/** 상단 키 또는 하단 키가 누락되었는지 여부 (마우스 센터 이벤트와의 충돌을 해결하는 데 사용) */
const isPressUpOrDown = ref<boolean>(false)

/** 검색 대화의 너비를 제어 */
const modalWidth = computed(() => (isMobile.value ? "80vw" : "40vw"))
/** 트리 메뉴 */
const menus = computed(() => cloneDeep(usePermissionStore().routes))

/** 搜索（防抖） */
const handleSearch = debounce(() => {
  const flatMenus = flatTree(menus.value)
  const _keywords = keyword.value.toLocaleLowerCase().trim()
  result.value = flatMenus.filter(menu => keyword.value ? menu.meta?.title?.toLocaleLowerCase().includes(_keywords) : false)
  // 검색 결과의 첫 번째 항목은 기본적으로 선택됩니다.
  const length = result.value?.length
  activeRouteName.value = length > 0 ? result.value[0].name : undefined
}, 500)

/** 메뉴 검색을위한 1 차원 배열로 트리 메뉴를 평평하게하십시오 */
function flatTree(arr: RouteRecordRaw[], result: RouteRecordRaw[] = []) {
  arr.forEach((item) => {
    result.push(item)
    item.children && flatTree(item.children, result)
  })
  return result
}

/** 검색 대화 상자를 닫습니다 */
function handleClose() {
  modelValue.value = false
  // 처리 지연 사용자는 사용자가 재설정 데이터를 보지 못하도록합니다.
  setTimeout(() => {
    keyword.value = ""
    result.value = []
  }, 200)
}

/** 첨자 위치에 따라 스크롤 */
function scrollTo(index: number) {
  if (!resultRef.value) return
  const scrollTop = resultRef.value.getScrollTop(index)
  // 手动控制 el-scrollbar 滚动条滚动，设置滚动条到顶部的距离
  scrollbarRef.value?.setScrollTop(scrollTop)
}

/** 키보드 키 */
function handleUp() {
  isPressUpOrDown.value = true
  const { length } = result.value
  if (length === 0) return
  // 메뉴에 이름이 처음 나타나는 위치를 가져옵니다.
  const index = result.value.findIndex(item => item.name === activeRouteName.value)
  // 이미 맨 위에 있다면
  if (index === 0) {
    const bottomName = result.value[length - 1].name
    // 상단과 하단의 하단 이름이 동일하고 길이가 1보다 큰 경우 다른 위치로 점프합니다 (시작과 끝에서 두 개의 동일한 이름으로 인해 UP 키가 적용 할 수없는 문제를 해결할 수 있습니다).
    if (activeRouteName.value === bottomName && length > 1) {
      activeRouteName.value = result.value[length - 2].name
      scrollTo(length - 2)
    } else {
      // 하단으로 점프합니다
      activeRouteName.value = bottomName
      scrollTo(length - 1)
    }
  } else {
    activeRouteName.value = result.value[index - 1].name
    scrollTo(index - 1)
  }
}

/** 키보드 다운 키 */
function handleDown() {
  isPressUpOrDown.value = true
  const { length } = result.value
  if (length === 0) return
  // 메뉴에서 이름의 마지막 위치를 가져옵니다 (두 개의 연속 동일한 이름으로 인해 하단 키가 적용 할 수없는 문제를 해결할 수 있습니다).
  const index = result.value.map(item => item.name).lastIndexOf(activeRouteName.value)
  // 이미 맨 아래에있는 경우
  if (index === length - 1) {
    const topName = result.value[0].name
    // 하단과 상단의 상단 이름이 동일하고 길이가 1보다 큰 경우 다른 위치로 이동합니다 (시작과 끝에서 두 개의 동일한 이름으로 인해 하단 키가 적용 할 수없는 문제를 해결할 수 있습니다).
    if (activeRouteName.value === topName && length > 1) {
      activeRouteName.value = result.value[1].name
      scrollTo(1)
    } else {
      // 위로 점프합니다
      activeRouteName.value = topName
      scrollTo(0)
    }
  } else {
    activeRouteName.value = result.value[index + 1].name
    scrollTo(index + 1)
  }
}

/** 키보드 입력 */
function handleEnter() {
  const { length } = result.value
  if (length === 0) return
  const name = activeRouteName.value
  const path = result.value.find(item => item.name === name)?.path
  if (path && isExternal(path)) return window.open(path, "_blank", "noopener, noreferrer")
  if (!name) return ElMessage.warning("无法通过搜索进入该菜单，请为对应的路由设置唯一的 Name")
  try {
    router.push({ name })
  } catch {
    return ElMessage.warning("该菜单有必填的动态参数，无法通过搜索进入")
  }
  handleClose()
}

/** 상단 또는 하단 키를 해제 */
function handleReleaseUpOrDown() {
  isPressUpOrDown.value = false
}
</script>

<template>
  <el-dialog
    v-model="modelValue"
    :before-close="handleClose"
    :width="modalWidth"
    top="5vh"
    class="search-modal__private"
    append-to-body
    @opened="inputRef?.focus()"
    @closed="inputRef?.blur()"
    @keydown.up="handleUp"
    @keydown.down="handleDown"
    @keydown.enter="handleEnter"
    @keyup.up.down="handleReleaseUpOrDown"
  >
    <el-input ref="inputRef" v-model="keyword" placeholder="搜索菜单" size="large" clearable @input="handleSearch">
      <template #prefix>
        <SvgIcon name="search" class="svg-icon" />
      </template>
    </el-input>
    <el-empty v-if="result.length === 0" description="暂无搜索结果" :image-size="100" />
    <template v-else>
      <p> 검색 결과 </p>
      <el-scrollbar ref="scrollbarRef" max-height="40vh" always>
        <Result
          ref="resultRef"
          v-model="activeRouteName"
          :data="result"
          :is-press-up-or-down="isPressUpOrDown"
          @click="handleEnter"
        />
      </el-scrollbar>
    </template>
    <template #footer>
      <Footer :total="result.length" />
    </template>
  </el-dialog>
</template>

<style lang="scss">
.search-modal__private {
  .svg-icon {
    font-size: 18px;
  }
  .el-dialog__header {
    display: none;
  }
  .el-dialog__footer {
    border-top: 1px solid var(--el-border-color);
    padding-top: var(--el-dialog-padding-primary);
  }
}
</style>
