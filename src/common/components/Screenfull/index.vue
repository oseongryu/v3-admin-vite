<script lang="ts" setup>
import screenfull from "screenfull"

interface Props {
  /** 전체 화면 요소, 기본값은 html */
  element?: string
  /** 전체 화면 프롬프트 열기 */
  openTips?: string
  /** 전체 화면 프롬프트 닫기 */
  exitTips?: string
  /** 컨텐츠 영역에만 해당됩니다 */
  content?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  element: "html",
  openTips: "全屏",
  exitTips: "退出全屏",
  content: false
})

const CONTENT_LARGE = "content-large"

const CONTENT_FULL = "content-full"

const classList = document.body.classList

// #region 全屏
const isEnabled = screenfull.isEnabled
const isFullscreen = ref<boolean>(false)
const fullscreenTips = computed(() => (isFullscreen.value ? props.exitTips : props.openTips))
const fullscreenSvgName = computed(() => (isFullscreen.value ? "fullscreen-exit" : "fullscreen"))

function handleFullscreenClick() {
  const dom = document.querySelector(props.element) || undefined
  isEnabled ? screenfull.toggle(dom) : ElMessage.warning("您的浏览器无法工作")
}

function handleFullscreenChange() {
  isFullscreen.value = screenfull.isFullscreen
  // 전체 화면을 종료 할 때 관련 클래스를 지우십시오
  isFullscreen.value || classList.remove(CONTENT_LARGE, CONTENT_FULL)
}

watchEffect((onCleanup) => {
  if (isEnabled) {
    // 구성 요소를 장착 할 때 자동으로 실행됩니다
    screenfull.on("change", handleFullscreenChange)
    // 구성 요소를 제거 할 때 자동으로 실행됩니다
    onCleanup(() => {
      screenfull.off("change", handleFullscreenChange)
    })
  }
})
// #endregion

// #region 内容区
const isContentLarge = ref<boolean>(false)
const contentLargeTips = computed(() => (isContentLarge.value ? "内容区复原" : "内容区放大"))
const contentLargeSvgName = computed(() => (isContentLarge.value ? "fullscreen-exit" : "fullscreen"))

function handleContentLargeClick() {
  isContentLarge.value = !isContentLarge.value
  // 컨텐츠 영역이 확대되면 원치 않는 구성 요소가 숨겨져 있습니다.
  classList.toggle(CONTENT_LARGE, isContentLarge.value)
}

function handleContentFullClick() {
  // 컨텐츠 영역 확대를 취소합니다
  isContentLarge.value && handleContentLargeClick()
  // 컨텐츠 영역이 전체 화면 인 경우 원치 않는 구성 요소가 숨겨져 있습니다.
  classList.add(CONTENT_FULL)
  // 전체 화면을 켭니다
  handleFullscreenClick()
}
// #endregion
</script>

<template>
  <div>
    <!-- 전체 화면 -->
    <el-tooltip v-if="!props.content" effect="dark" :content="fullscreenTips" placement="bottom">
      <SvgIcon :name="fullscreenSvgName" @click="handleFullscreenClick" class="svg-icon" />
    </el-tooltip>
    <!-- 콘텐츠 영역 -->
    <el-dropdown v-else :disabled="isFullscreen">
      <SvgIcon :name="contentLargeSvgName" class="svg-icon" />
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 内容区放大 -->
          <el-dropdown-item @click="handleContentLargeClick">
            {{ contentLargeTips }}
          </el-dropdown-item>
          <!--컨텐츠 영역의 전체 화면 -->
          <el-dropdown-item @click="handleContentFullClick">
            컨텐츠 영역 전체 화면
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style lang="scss" scoped>
.svg-icon {
  font-size: 20px;
  &:focus {
    outline: none;
  }
}
</style>
