<template>
  <div class="app-container">
    <h4>
      <span>
        레벨 3 이상의 라우팅 캐시 기능이 기본적으로 꺼져 있습니다.
      </span>
      <el-link
        type="primary"
        href="https://github.com/un-pany/v3-admin-vite/blob/main/src/router/config.ts"
        target="_blank"
      >
        src/router/config.ts
      </el-link>
    </h4>
    <el-card header="二级路由">
      <router-view />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
h4 {
  display: flex;
  align-items: center;
}

.el-link {
  font-size: 18px;
}
</style>
