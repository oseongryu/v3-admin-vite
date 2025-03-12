<script lang="ts" setup>
import { useSettingsStore } from "@/pinia/stores/settings"
import { useDevice } from "@@/composables/useDevice"
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { useWatermark } from "@@/composables/useWatermark"
import { getCssVar, setCssVar } from "@@/utils/css"
import { RightPanel, Settings } from "./components"
import { useResize } from "./composables/useResize"
import LeftMode from "./modes/LeftMode.vue"
import LeftTopMode from "./modes/LeftTopMode.vue"
import TopMode from "./modes/TopMode.vue"

// 레이아웃 레이아웃 응답
useResize()

const { setWatermark, clearWatermark } = useWatermark()
const { isMobile } = useDevice()
const { isLeft, isTop, isLeftTop } = useLayoutMode()
const settingsStore = useSettingsStore()
const { showSettings, showTagsView, showWatermark } = storeToRefs(settingsStore)

// #region 隐藏标签栏时删除其高度，是为了让 Logo 组件高度和 Header 区域高度始终一致
const cssVarName = "--v3-tagsview-height"
const v3TagsviewHeight = getCssVar(cssVarName)
watchEffect(() => {
  showTagsView.value ? setCssVar(cssVarName, v3TagsviewHeight) : setCssVar(cssVarName, "0px")
})
// #endregion

// 시스템 워터 마크를 켜거나 끕니다
watchEffect(() => {
  showWatermark.value ? setWatermark(import.meta.env.VITE_APP_TITLE) : clearWatermark()
})
</script>

<template>
  <div>
    <!-- 왼쪽 모드 -->
    <LeftMode v-if="isLeft || isMobile" />
    <!-- 상단 모드 -->
    <TopMode v-else-if="isTop" />
    <!-- 혼합 모드 -->
    <LeftTopMode v-else-if="isLeftTop" />
    <!-- 오른쪽의 설정 패널 -->
    <RightPanel v-if="showSettings">
      <Settings />
    </RightPanel>
  </div>
</template>
