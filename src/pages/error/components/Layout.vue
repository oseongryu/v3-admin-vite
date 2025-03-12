<template>
  <div class="error">
    <div class="error-svg">
      <slot />
    </div>
    <router-link to="/">
      <el-button type="primary">
        홈페이지로 돌아갑니다
      </el-button>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }
}
</style>
