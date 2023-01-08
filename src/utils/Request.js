import axios from 'axios'
import {ElLoading,ElMessage} from 'element-plus';
import message from '@/utils/Message'
import router from '@/router';
const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json";
const contentTypeFile = "multipart/form-data";

const request = (config) =>{
     let {url,params,dataType='form',showLoading='true'} = config;
    // let url = config.url;
    // let params = config.params || {};
    // let dataType = config.dataType;
    // dataType = dataType ? "form" : dataType;
    // let showLoading = config.showLoading;
    // showLoading = showLoading ? true : showLoading;
    let contentType = contentTypeForm;
    if(dataType==="json"){
        contentType = contentTypeJson;
    }else if(dataType==="file"){
        contentType=contentTypeFile;
        let param = new FormData();
        for(let key in params){
            param.append(key,params[key]);
        }
        params=param;
    }
    const instantsce = axios.create({
        baseURL:'/api',
        timeout:10*1000,
        headers:{
            'Content-Type':contentType,
            'X-Requested-With':'XMLHttpRequset',
        }
    })
    let loading=null;
    instantsce.interceptors.request.use(
        (config) =>{
            if(showLoading){
                loading=ElLoading.service({
                    lock: true,
                    text: '加载中.......',
                    background: 'rgba(0, 0, 0, 0.7)',
                  })
            }
            return config;
        },(error) =>{
            if(showLoading&&loading){
                loading.close();
            }
              message.error("发送请求失败")
              return Promise.reject("发送请求失败");

        }
    )
    //请求后拦截
    instantsce.interceptors.response.use(
        (response) =>{
            if(showLoading&&loading){
                loading.close();
            }
            const responseData = response.data;
            if(responseData.status == "error"){
                if(config.errorCallback){
                    config.errorCallback();
                }
                return Promise.reject(responseData.info);
            }else{
                if(responseData.code == 200){
                    return responseData;
                }else if(responseData.code == 901){
                    setTimeout(() => {
                        router.push("/login")
                    }, 2000);
                    return Promise.reject("登录超时");
                }
                
            }
        },
        (error) =>{
            if(showLoading&&loading){
                loading.close();
            }
            return Promise.reject("网络错误");
        }
    )
    return instantsce.post(url,params).catch(error=>{
        message.error(error)
          return null;
    })
    // let result = new Promise((resolve,reject)=>{
    //     instantsce.post(url,params).then(res =>{
    //         resolve(res);
    //     }).catch(error =>{
    //         message.error(error)
    //     })
    // })
    // return result;
}
export default request;