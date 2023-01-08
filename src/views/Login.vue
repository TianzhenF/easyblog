<template>
  <div class="login_body">
    <div class="login_panel">
      <div class="login_title">用户登录</div>
      <el-form :model="formData" 
      :rules="rules" ref="formDataRef">
        <el-form-item prop="account">
          <el-input placeholder="请输入账号" 
                    v-model="formData.account" size="large">
                    <template #prefix>
                      <span class="iconfont icon-account"></span>
                    </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="请输入密码" 
                    v-model="formData.password" size="large">
                    <template #prefix>
                      <span class="iconfont icon-password"></span>
                    </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check_code_panel">
            <el-input placeholder="请输入验证码" 
                    v-model="formData.checkCode"
                    class="input_panel" size="large" 
                     @keyup.enter="login"/>
                    <img :src="checkCodeUrl"
                      class="check_code"
                      @click="changeCheckCode" >
          </div>        
        </el-form-item>
        <el-form-item label="">
          <el-checkbox placeholder="" 
                    v-model="formData.rememberMe" :label="true">请记住我
          </el-checkbox>
        </el-form-item>
          <el-form-item label="">
            <el-button type="primary" :style="{width:'100%'}" 
            @click="login">登录</el-button>
          </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {getCurrentInstance, reactive, ref} from "vue"
import md5 from 'js-md5';
import VueCookies from 'vue-cookies';
import {useRouter} from 'vue-router'
const {proxy} = getCurrentInstance();
const router = useRouter();
const api = {
  checkCode:"api/checkCode",
  login:"login"
}


const checkCodeUrl = ref(api.checkCode);
// export default {

// }
const changeCheckCode = ()=>{
  checkCodeUrl.value = api.checkCode + "?" + new Date().getTime();
}


//表单相关
const formDataRef = ref();
const formData = reactive({});

const rules={
  account:[{
    required:true,
    message:"请输入用户名"
  }],
  password:[{
    required:true,
    message:"请输入密码"
  }],
  checkCode:[{
    required:true,
    message:"请输入验证码"
  }]
}

const init = () =>{
  const loginInfo = proxy.VueCookies.get("loginInfo");
  if(!loginInfo){
    return;
  }
  Object.assign(formData,loginInfo);
  
}
init();
const login = ()=>{
  formDataRef.value.validate(async(valid)=>{
    if(!valid){
      return;
    }
    let cookieloginInfo = proxy.VueCookies.get("loginInfo");
    let cookiePassword=cookieloginInfo==null?null:cookieloginInfo.password;
    if(formData.password!==cookiePassword){
      formData.password = md5(formData.password)
    }
    let params = {
      account:formData.account,
        password:formData.password,
        checkCode:formData.checkCode,
        rememberMe:formData.rememberMe
    }
    let result = await proxy.Request({
      url:api.login,
      params:params
      ,errorCallback:()=>{
        changeCheckCode();
      }
    })
    if(!result){
      return;
    }
    proxy.Message.success("登录成功")

    setTimeout(() => {
      router.push("/")
    }, 1500);
    const loginInfo = {
      account:params.account,
      password:params.password,
      rememberMe:params.rememberMe
    }
    proxy.VueCookies.set("userInfo",result.data,0);
    if(formData.rememberMe){
      proxy.VueCookies.set("loginInfo",loginInfo,"7d");
    }
  })
}
</script>

<style lang="scss">
  .login_body{//整个壁纸
    width:100%;
    height:calc(100vh);
    background-size: cover;
    background-position: center;
    background-image: url(../assets/ChukchiSea_ZH-CN7218471261_1920x1080.jpg);
      .login_panel{//登录外框
      width:350px;
      float: right;
      margin-right: 100px;
      margin-top: 150px;
      padding: 20px;
      background: rgba(253, 253, 253, 0.699);
      border-radius: 5px;
      box-shadow: 2px 2px 10px #5a5959;
    .login_title{//"用户登录"
      font-size:18px;
      text-align: center;
      margin-bottom: 10px;
    }
    .check_code_panel{
      width: 100%;
      display: flex;
      align-items: center;
      .input_panel{
        flex: 1;
        margin-right: 5px;
      }
      .check_code{
          cursor: pointer;
      }
    }
  }
}
</style>