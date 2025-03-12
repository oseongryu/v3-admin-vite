<script lang="ts" setup>
import { useSettingsStore } from "@/pinia/stores/settings"
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { removeLayoutsConfig } from "@@/utils/cache/local-storage"
import { Refresh } from "@element-plus/icons-vue"
import SelectLayoutMode from "./SelectLayoutMode.vue"

const { isLeft } = useLayoutMode()

const settingsStore = useSettingsStore()

// storeToRefs를 사용하여 추출된 속성의 반응성을 유지합니다.
const {
  showTagsView,
  showLogo,
  fixedHeader,
  showFooter,
  showNotify,
  showThemeSwitch,
  showScreenfull,
  showSearchMenu,
  cacheTagsView,
  showWatermark,
  showGreyMode,
  showColorWeakness
} = storeToRefs(settingsStore)

/** 스위치 설정 정의 */
const switchSettings = {
  "태그 보기": showTagsView,
  "로고 보기": showLogo,
  "고정 헤더": fixedHeader,
  "바닥글 보기": showFooter,
  "알림 보기": showNotify,
  "테마 전환 버튼 보기": showThemeSwitch,
  "전체 화면 버튼 보기": showScreenfull,
  "검색 버튼 보기": showSearchMenu,
  "태그 보기 캐시": cacheTagsView,
  "시스템 워터마크 켜기": showWatermark,
  "회색 모드 보기": showGreyMode,
  "색약 모드 보기": showColorWeakness
}

// 왼쪽 모드가 아닐 때, 헤더는 모두 고정 레이아웃입니다.
watchEffect(() => {
  !isLeft.value && (fixedHeader.value = true)
})

/** 프로젝트 구성 재설정 */
function resetLayoutsConfig() {
  removeLayoutsConfig()
  location.reload()
}
</script>

<template>
  <div class="setting-container">
    <H4> 레이아웃 구성 </h4>
    <SelectLayoutMode />
    <el-divider />
    <H4> 기능 구성 </h4>
    <div v-for="(settingValue, settingName, index) in switchSettings" :key="index" class="setting-item">
      <span class="setting-name">{{ settingName }}</span>
      <el-switch v-model="settingValue.value" :disabled="!isLeft && settingName === '고정 헤더'" />
    </div>
    <el-button type="danger" :icon="Refresh" @click="resetLayoutsConfig">
      다시 놓기
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.setting-container {
  padding: 20px;
  .setting-item {
    font-size: 14px;
    color: var(--el-text-color-regular);
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .setting-name {
      @extend %ellipsis;
    }
  }
  .el-button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>
