<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" :showCancel="false"
            @close="windowConfig.show = false">
            <el-row :gutter="10">
                <el-col :span="10">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>专题文章</span>
                            </div>
                        </template>
                        <div :style="{ 'margin-bottom': '5px' }">
                            <el-alert title="红色代表草稿,绿色代表已发布/拖动文章修改排序" type="info" show-icon
                                :closable="false"></el-alert>
                        </div>
                        <div class="organization_configuration">
                        <el-tree class="tree-panel" ref="refTree" :data="blogList" defaultExpandAll node-key="blogId"
                            :expand-on-click-node="false" :props="treeProps" :highlight-current="true" @node-click="treeNodeClick">
                            <template #default="{ data }">
                                <span class="custom-node-style">
                                    <span class="node-title">
                                        <span v-if="data.status == 0" :style="{ 'color': 'red', 'font-size': '13px' }"> {{
        data.title
}}</span>
                                        <span v-else :style="{ 'color': 'green', 'font-size': '13px' }"> {{ data.title
}}</span>
                                    </span>
                                    
                                </span>
                            </template>
                        </el-tree>
                    </div>
                    </el-card>
                </el-col>
                <el-col :span="14">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>文章详情</span>
                            </div>
                        </template>
                        <div v-if="blog.title"><div class="my-title">{{ blog.title }}</div>
                        <div v-html="blog.content" class="blog-detail"></div></div>
                        <div v-else class="no-data">
                            请选择专题文章,查看详情
                        </div>
                    </el-card>
                </el-col>
            </el-row>
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
    "getBlogDetail": "/blog/getBlogById",
    "getSpecialInfo": "/blog/getSpecialInfo",
}
const windowConfig = reactive({
    show: false,
    buttons: [{
        type: "danger",
        text: "确定",
        click: (e) => {
            windowConfig.show = false;
        }
    }]
})

const currentBlogId = ref(null)
const blog = ref({});

const showDetail = async (data) => {
    windowConfig.show = true;
    currentBlogId.value=data.blogId;
    //获取所有文章数
    getSpecialInfo(data.categoryId);
   //获取详情
    showBlogDetail(data.blogId);
    
}

const showBlogDetail =async(blogId)=>{
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
    nextTick(() => {
        let blocks = document.querySelectorAll("pre code");
        blocks.forEach((block) => {
            hljs.highlightBlock(block);
        })
    })
}

const treeNodeClick=(data)=>{
    if(data.blogId=="0"){
        blog.value={};
        return;
    }
    showBlogDetail(data.blogId)
}   

//属性展示专题
const treeProps = {
  children: "children",
  label: "title",
  value: "blogId",
};

const blogList = ref({})
const refTree = ref(null)
const getSpecialInfo = async (categoryId) => {
    let result = await proxy.Request({
        url: api.getSpecialInfo,
        params: {
            categoryId: categoryId,
            showType: "1"
        }
    })
    if(!result){
        return;
    }
    blogList.value = result.data;
    // if (result.data[0].children != null && result.data[0].children.length > 0) {
    //     nextTick(() => {
    //         refTree.value.setCurrentKey(result.data[0].children[0].blogId);
    //     });
    // }
    nextTick(() => {
    refTree.value.setCurrentKey(currentBlogId.value);
  });
}
defineExpose({ showDetail })




</script>

<style lang="scss">
//代码块背景
.hljs {
    padding: 10px;
    background: rgb(143, 143, 143);
}

.blog-detail {
    blockquote {
        padding: 0 1em;
        color: rgb(161, 161, 161);
        border-left: 0.25em solid #ddd;
    }
}

.my_title {
    font-size: 18px;
}

img {
    max-width: 80%;
}
.el-tree {
    --el-tree-node-hover-bg-color: rgba(135, 207, 235, 0.281);
}

// .el-tree-node:focus > .el-tree-node__content {
//       background-color: rgb(112, 150, 255) !important;
//     }
.organization_configuration {

.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    // 设置颜色
    background-color: rgba(135, 206, 235, 0.281); // 透明度为0.2的skyblue
    color: #409eff; // 节点的字体颜色
    font-weight: bold; // 字体加粗
}
}
</style>