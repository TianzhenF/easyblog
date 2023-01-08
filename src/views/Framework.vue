<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">EasyBlog</div>
        <div class="user_info">
          <span>欢迎回来,</span>
          <el-dropdown trigger="click">
            <span class="nick_name">
              {{ userInfo.nickName }}
              <span class="iconfont icon-close"></span>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goUserInfo">
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar"><img :src="userInfo.avatar"></div>
        </div>
      </el-header>
      <el-container class="container">
        <el-aside width="200px" class="left_Aside">
          <div>
            <el-button class="post_btn" @click="createHtml">发布</el-button>
          </div>
          <ul class="menu_panel">
            <li v-for="(menu, index) in menuList" :key="index">
              <span class="menu_title_p" @click="openClose(index)">
                <span :class="['iconfont', menu.icon]"></span>
                <span class="menu_title">{{ menu.title }}</span>
                <span :class="['iconfont', 'open-close', menu.open ? 'icon-close' : 'icon-open']"></span>
              </span>
              <ul class="sub_menu" v-if="menu.open">
                <li v-for="subMenu in menu.children" :key="subMenu">
                  <span></span>
                  <router-link :to="subMenu.path" :class="['sub_menu_item', activePath == subMenu.path ? 'active' : '']"
                    v-if="subMenu.roleType == null||subMenu.roleType==userInfo.roleType">{{subMenu.title}}</router-link>
                </li>
              </ul>
            </li>
          </ul>
        </el-aside>
        <el-main class="right_main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

    <Dialog :show="progressDialog.show" :title="progressDialog.title" :buttons="progressDialog.buttons"
      @close="progressDialog.show = false" :show-close="false" :showCancel="false" width="400px">
      <div class="progress-container">
        <div class="progress-panel">
          <el-progress type="circle" :percentage="progressInfo.progress" :status="progressInfo.status"
            :color="colors" />

        </div>
        <div class="error" v-if="progressInfo.result == 0">
          <div>生成页面出错了:{{ progressInfo.errorMsg }}</div>
          <div class="info">具体错误,请查看服务日志</div>
        </div>
        <div class="success" v-if="progressInfo.progress == 100 && progressInfo.result == 1">
          发布成功
        </div>
        <div class="btn-panel" v-if="progressInfo.progress == 100 || progressInfo.result == 0">
          <el-button class="btn" type="primary" @click="progressDialog.show = false">关闭</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, watch, reactive, ref } from "vue";
// import VueCookies from 'vue-cookies';
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const router = useRouter();
const store = useStore();
const { proxy } = getCurrentInstance();

const api = {
  "getUserInfo": "/getUserInfo",
  "logout": "/logout",
  "createHtml": "/createHtml",
  "checkProgress": "/checkProgress"
}

const menuList = ref([
  {
    title: "博客",
    icon: "icon-blog",
    open: true,
    children: [
      {
        title: "博客管理",
        path: "/blog/list",
      },
      {
        title: "分类管理",
        path: "/blog/category",
      },
    ],
  }, {
    title: "专题",
    icon: "icon-zhuanti",
    open: true,
    children: [
      {
        title: "专题管理",
        path: "/special/list",
      },
    ],
  }, {
    title: "设置",
    icon: "icon-settings",
    open: true,
    children: [
      {
        title: "个人信息设置",
        path: "/settings/my",
      },
      {
        title: "博客成员",
        path: "/settings/user",
      },
      {
        title: "系统管理",
        path: "/settings/sysInfo",
        roleType: 1
      },

    ],
  },
  {
    title: "回收站",
    icon: "icon-delete",
    open: true,
    children: [
      {
        title: "回收站",
        path: "/recovery/list",
      },
    ],
  },
]);
const openClose = (index) => {
  const open = menuList.value[index].open;
  menuList.value[index].open = !open;
}
const userInfo = ref({});
const init = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,

  })
  if (!result) {
    return;
  }
  userInfo.value = result.data;
  userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data.avatar
  // userInfo.value = VueCookies.get("userInfo");
  // userInfo.value.avatar = proxy.globalInfo.imageUrl + userInfo.value.avatar;
  // console.log(userInfo.value);
}
init();

const activePath = ref(null);

watch(route, (newVal, oldVal) => {
  console.log(newVal.path);
  activePath.value = newVal.path;
}, { immediate: true, deep: true });


const goUserInfo = () => {
  router.push("../settings/my")
}

//退出
const logout = () => {
  proxy.Confirm(`你确定要退出吗`, async () => {
    let result = await proxy.Request({
      url: api.logout,

    })
    if (!result) {
      return;
    }
    router.push("../login")
  })
}

watch(() => store.state.userInfo, (newVal, oldVal) => {
  const avatar = proxy.globalInfo.imageUrl + newVal.avatar;
  const nickName = newVal.nickName;
  userInfo.value = { avatar, nickName };
}, { immediate: true, deep: true })

//发布
const colors = [
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
];

const progressDialog = reactive({
  title: "发布",
  buttons: [],
  show: false,
})

const progressInfo = reactive({
  progress: 0,
  status: undefined
})

let checkTimer = null;
const createHtml = async () => {
  progressDialog.show = true;
  progressInfo.progress = 0;
  progressInfo.status = undefined;
  let result = await proxy.Request({
    url: api.createHtml,
  });
  if (!result) {
    return;
  }
  checkProgress();
  checkTimer = setInterval(() => {
    checkProgress();
  }, 1000);
};
const checkProgress = async () => {
  let result = await proxy.Request({
    url: api.checkProgress,
    showLoading: false,
  });
  if (!result) {
    return;
  }
  if (result.data.result == 0) {
    progressInfo.status = "exception";
    progressInfo.errorMsg = result.data.errorMsg;
  } else {
    progressInfo.progress = result.data.progress;
  }
  progressInfo.result = result.data.result;
  if ((result.data.progress == 100 || result.data.result == 0) && checkTimer != null) {
    clearInterval(checkTimer)
  }
}
</script>

<style lang="scss">
.layout {
  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      font-size: 30px;
    }

    .user_info {
      display: flex;
      align-items: center;

      .nick_name {
        cursor: pointer;
        color: rgba(6, 143, 234);
      }

      .icon-close {
        font-size: 14px;
      }

      .icon-open {
        font-size: 14px;
      }
    }

    .avatar {
      width: 50px;
      margin-left: 10px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 25px;
      background: #ddd;

      img {
        width: 50px;
        border-radius: 25px;
      }
    }
  }
}

.container {
  background: #f5f6f7;
  height: calc(100vh - 60px);
  padding-top: 10px;

  .left_Aside {
    width: 280px;
    padding: 0px 15px;

    .post_btn {
      background: green;
      color: #fff;
      height: 40px;
      width: 100%;
    }

    .menu_panel {
      padding: 0px;
      margin: 0px;
      margin-top: 5px;

      ul,
      li {
        padding: 0px;
        margin: 0px;
        list-style: none;
      }

      .menu_title_p {
        padding: 0px 5px;
        line-height: 45px;
        display: flex;
        cursor: pointer;

        .iconfont {
          font-size: 18px;
          color: rgb(155, 151, 151);
        }
      }

      .menu_title {
        flex: 1;
        color: rgb(75, 74, 74);
        margin-left: 10px;
      }

      .open-close {
        width: 20px;
        font-size: 16px;
      }
    }

    .sub_menu {
      font-size: 14px;

      .sub_menu_item {
        padding: 0px 10px 0px 33px;
        cursor: pointer;
        display: block;
        line-height: 40px;
        text-decoration: none;
        color: #3f4042;
      }

      .sub_menu_item:hover {
        background: #ddd;
      }

      .active {
        background: #ddd;
        color: rgb(214, 103, 103);
      }
    }

    .menu_title_p:hover {
      background: #ddd;
    }
  }

  .right_main {
    position: relative;
    background: #fff;
    padding: 20px 10px 10px 10px;

  }
}

.progress-container {
  .progress-panel {
    display: flex;
    justify-content: center;
  }

  .error {
    color: red;
    margin-top: 20px;

    .info {
      font-size: 13px;
    }
  }

  .success {
    margin-top: 20px;
    text-align: center;
    font-size: 16px;
    color: green;
  }

  .btn-panel {
    text-align: center;
    margin-top: 20px;

    .btn {
      max-width: 0px auto;
    }
  }
}
</style>