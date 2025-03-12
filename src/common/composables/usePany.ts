function initStarNotification() {
  setTimeout(() => {
    ElNotification({
      title: "사랑을 위한 전력!",
      type: "success",
      message: h(
        "div",
        null,
        [
          h("div", null, "모든 소스 코드는 무료로 오픈 소스입니다. 도움이 되셨다면 Star를 눌러주세요!"),
          h("a", { style: "color: teal", target: "_blank", href: "https://github.com/un-pany/v3-admin-vite" }, "클릭하여 이동")
        ]
      ),
      duration: 0,
      position: "bottom-right"
    })
  }, 0)
}

function initStoreNotification() {
  setTimeout(() => {
    ElNotification({
      title: "게으른 사람을 위한 서비스?",
      type: "warning",
      message: h(
        "div",
        null,
        [
          h("div", null, "직접 작업하기 싫지만 TS 또는 다른 모듈을 제거하고 싶으신가요? 게으른 사람을 위한 패키지도 있습니다!"),
          h("a", { style: "color: teal", target: "_blank", href: "https://github.com/un-pany/v3-admin-vite/issues/225" }, "클릭하여 보기")
        ]
      ),
      duration: 0,
      position: "bottom-right"
    })
  }, 500)
}

/** 저자의 작은 생각 */
export function usePany() {
  return { initStarNotification, initStoreNotification }
}
