<template>
   <el-upload name="flie" :show-file-list="false" 
   accept=".png,.Png,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
   :multiple="false"
   :http-request="uploadImage">
    <!-- <el-button type="primary">Click to upload</el-button> -->
    <div class="cover-upload-btn">
        <template v-if="modelValue">
            <img :src="proxy.globalInfo.imageUrl + modelValue"/>
        </template>
        <span class="iconfont icon-add"
        v-else>

        </span>
    </div> 
  </el-upload>
</template>

<script setup>
import { getCurrentInstance } from "vue"

const {proxy} = getCurrentInstance();
const props = defineProps({
    modelValue:{
        type:String,
        default:null

    }
})
const api ={
    uploadUrl:"file/uploadImage"
}

const emit = defineEmits();
const uploadImage = async(file)=>{
    console.log(file);
   
    let result = await proxy.Request({
        url:api.uploadUrl,
        dataType:"file",
        params:{
            file:file.file,
            type:0,

        }
    })
    const fileName = result.data.fileName;
    console.log(result)
    emit("update:modelValue",fileName);
    emit("callback",fileName);
}
</script>

<style lang="scss">
.cover-upload-btn{
    width:150px;
    height: 150px;
    background: #ddd;
    display: flex;
    align-items: center;//上下水平居中
    justify-content: center;//左右水平居中
    cursor: pointer;
    .iconfont{
        font-size: 30px;
        color: rgb(177, 175, 175);
    }
    img{
        width: 100%;
    }
}
</style>