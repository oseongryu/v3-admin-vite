<script lang="ts" setup>
import type { ElScrollbar } from "element-plus"
import type { RouterLink } from "vue-router"
import { useSettingsStore } from "@/pinia/stores/settings"
import Screenfull from "@@/components/Screenfull/index.vue"
import { useRouteListener } from "@@/composables/useRouteListener"
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue"

interface Props {
  tagRefs: InstanceType<typeof RouterLink>[]
}

const props = defineProps<Props>()

const route = useRoute()

const settingsStore = useSettingsStore()

const { listenerRouteChange } = useRouteListener()

/** 스크롤 바 구성 요소 요소에 대한 참조 */
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

/** 滚动条内容元素的引用 */
const scrollbarContentRef = ref<HTMLDivElement>()

/** 현재 스크롤 막대에서 왼쪽까지의 거리 */
let currentScrollLeft = 0

/** 스크롤 당 거리 */
const translateDistance = 200

/** 스크롤 할 때 트리거 */
function scroll({ scrollLeft }: { scrollLeft: number }) {
  currentScrollLeft = scrollLeft
}

/** 마우스 휠이 스크롤 될 때 트리거 됨 */
function wheelScroll({ deltaY }: WheelEvent) {
  if (deltaY.toString().startsWith("-")) {
    scrollTo("left")
  } else {
    scrollTo("right")
  }
}

/** 获取可能需要的宽度 */
function getWidth() {
  // 스크롤 가능한 컨텐츠의 길이
  const scrollbarContentRefWidth = scrollbarContentRef.value!.clientWidth
  // 滚动可视区宽度
  const scrollbarRefWidth = scrollbarRef.value!.wrapRef!.clientWidth
  // 마지막으로 남은 스크롤 가능 너비
  const lastDistance = scrollbarContentRefWidth - scrollbarRefWidth - currentScrollLeft

  return { scrollbarContentRefWidth, scrollbarRefWidth, lastDistance }
}

/** 왼쪽과 오른쪽 스크롤 */
function scrollTo(direction: "left" | "right", distance: number = translateDistance) {
  let scrollLeft = 0
  const { scrollbarContentRefWidth, scrollbarRefWidth, lastDistance } = getWidth()
  // 수평 스크롤 막대가없고 직접 끝납니다.
  if (scrollbarRefWidth > scrollbarContentRefWidth) return
  if (direction === "left") {
    scrollLeft = Math.max(0, currentScrollLeft - distance)
  } else {
    scrollLeft = Math.min(currentScrollLeft + distance, currentScrollLeft + lastDistance)
  }
  scrollbarRef.value!.setScrollLeft(scrollLeft)
}

/** 대상 위치로 이동 */
function moveTo() {
  const tagRefs = props.tagRefs
  for (let i = 0; i < tagRefs.length; i++) {
    // @ts-expect-error ignore
    if (route.path === tagRefs[i].$props.to.path) {
      // @ts-expect-error ignore
      const el: HTMLElement = tagRefs[i].$el
      const offsetWidth = el.offsetWidth
      const offsetLeft = el.offsetLeft
      const { scrollbarRefWidth } = getWidth()
      // 当前 tag 在可视区域左边时
      if (offsetLeft < currentScrollLeft) {
        const distance = currentScrollLeft - offsetLeft
        scrollTo("left", distance)
        return
      }
      // 현재 태그가 시각 영역의 오른쪽에있을 때
      const width = scrollbarRefWidth + currentScrollLeft - offsetWidth
      if (offsetLeft > width) {
        const distance = offsetLeft - width
        scrollTo("right", distance)
        return
      }
    }
  }
}

// 경로가 변경되고 대상 위치로 이동합니다.
listenerRouteChange(() => {
  nextTick(moveTo)
})
</script>

<template>
  <div class="scroll-container">
    <el-tooltip content="向左滚动标签（超出最大宽度可点击）">
      <el-icon class="arrow left" @click="scrollTo('left')">
        <ArrowLeft />
      </el-icon>
    </el-tooltip>
    <el-scrollbar ref="scrollbarRef" @wheel.passive="wheelScroll" @scroll="scroll">
      <div ref="scrollbarContentRef" class="scrollbar-content">
        <slot />
      </div>
    </el-scrollbar>
    <el-tooltip content="向右滚动标签（超出最大宽度可点击）">
      <el-icon class="arrow right" @click="scrollTo('right')">
        <ArrowRight />
      </el-icon>
    </el-tooltip>
    <Screenfull v-if="settingsStore.showScreenfull" :content="true" class="screenfull" />
  </div>
</template>

<style lang="scss" scoped>
.scroll-container {
  height: 100%;
  user-select: none;
  display: flex;
  justify-content: space-between;
  .arrow {
    width: 40px;
    height: 100%;
    font-size: 18px;
    cursor: pointer;
    &.left {
      box-shadow: 5px 0 5px -6px var(--el-border-color-darker);
    }
    &.right {
      box-shadow: -5px 0 5px -6px var(--el-border-color-darker);
    }
  }
  .el-scrollbar {
    flex: 1;
    // 라인 파손 방지 (너비를 초과하면 스크롤 막대)
    white-space: nowrap;
    .scrollbar-content {
      display: inline-block;
    }
  }
  .screenfull {
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>
