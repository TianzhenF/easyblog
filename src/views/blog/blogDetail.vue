<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" :showCancel="false" @close="windowConfig.show = false"
           >
            <div class="my_title"> {{ blog.title }}</div>
            <div v-html="blog.content"> </div>
        </Window>
    </div>
</template>

<script setup>
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";//样式
import { getCurrentInstance, ref, reactive, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const api = {
    "getBlogDetail": "/blog/getBlogById"
}
const windowConfig = reactive({
    show: false,
    buttons: [{
        type: "danger",
        text: "确定",
        click: (e) => {
            windowConfig.show=false;
        }
    }]
})


const blog = ref({});

const showDetail = async (blogId) => {
    windowConfig.show = true;
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
            blogId: blogId
        }
    })
    if (!result) {
        return;
    }
    blog.value = result.data;
    nextTick(()=>{
        let blocks = document.querySelectorAll("pre code");
        blocks.forEach((blocks)=>{
            hljs.highlightBlock(blocks);
        })
    })
}
defineExpose({ showDetail })
</script>

<style lang="scss">
//代码块背景
.hljs{
    padding:10px;
    background: rgb(143, 143, 143);
}
.blog-detail{
    blockquote{
        padding: 0 1em;
        color: rgb(161, 161, 161);
        border-left: 0.25em solid #ddd;
    }
}
.my_title{
    font-size: 18px;
}

img{
    max-width: 80%;
}
</style>