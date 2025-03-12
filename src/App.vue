<script lang="ts" setup>
import { useGreyAndColorWeakness } from "@@/composables/useGreyAndColorWeakness"
import { usePany } from "@@/composables/usePany"
import { useTheme } from "@@/composables/useTheme"
import zhCn from "element-plus/es/locale/lang/zh-cn" // Element Plus 中文包

const { initTheme } = useTheme()
const { initGreyAndColorWeakness } = useGreyAndColorWeakness()
const { initStarNotification, initStoreNotification } = usePany()

// 주제를 초기화합니다
initTheme()
// 회색 모드 및 색상 약점을 초기화합니다
initGreyAndColorWeakness()
// 초기화 알림
initStarNotification()
initStoreNotification()
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
