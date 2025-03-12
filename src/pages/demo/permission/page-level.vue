<script lang="ts" setup>
import SwitchRoles from "./components/SwitchRoles.vue"
</script>

<template>
  <div class="app-container">
    <SwitchRoles />
    <el-card shadow="never" class="content">
      현재 페이지에서 "관리자"역할 만 볼 수 있습니다.
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.content {
  margin-top: 20px;
}
</style>
