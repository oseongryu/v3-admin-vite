<script lang="ts" setup>
import { useWatermark } from "@@/composables/useWatermark"

const localRef = ref<HTMLElement | null>(null)
const { setWatermark, clearWatermark } = useWatermark(localRef)
const { setWatermark: setGlobalWatermark, clearWatermark: clearGlobalWatermark } = useWatermark()
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      该示例是演示：通过调用 composable 开启或关闭水印，
      로컬, 글로벌, 맞춤형 스타일 (색상, 투명성, 글꼴 크기, 글꼴, 틸트 각도 등)을 지원하고 방어 (방지, 방지 방지) 및 적응 형 기능과 함께 제공됩니다.
    </el-card>
    <el-card header="示例" shadow="never">
      <div ref="localRef" class="local" />
      <template #footer>
        <el-button-group>
          <el-button type="primary" @click="setWatermark('局部水印', { color: '#409eff' })">
            로컬 워터 마크를 만듭니다
          </el-button>
          <el-button type="warning" @click="setWatermark('没有防御功能的局部水印', { color: '#e6a23c', defense: false })">
            무방비 지역 워터 마크를 만듭니다
          </el-button>
          <el-button type="danger" @click="clearWatermark">
            현지 워터 마크를 깨끗하게하십시오
          </el-button>
        </el-button-group>
        <el-button-group>
          <el-button type="primary" @click="setGlobalWatermark('全局水印', { color: '#409eff' })">
            글로벌 워터 마크를 만듭니다
          </el-button>
          <el-button type="warning" @click="setGlobalWatermark('没有防御功能的全局水印', { color: '#e6a23c', defense: false })">
            무방비가없는 글로벌 워터 마크를 만듭니다
          </el-button>
          <el-button type="danger" @click="clearGlobalWatermark">
            명확한 글로벌 워터 마크
          </el-button>
        </el-button-group>
      </template>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.el-card {
  margin-bottom: 20px;
}

.local {
  height: 35vh;
  border: 2px dashed var(--el-color-primary);
}

.el-button-group {
  margin-right: 12px;
  margin-bottom: 5px;
}
</style>
