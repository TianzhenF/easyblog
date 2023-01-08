<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" @close="closeWindow">

            <el-form :model="blogFormData" :rules="rules" ref="blogFormRef">
                <el-form-item prop="title">
                    <div class="title_input"> <el-input placeholder="请输入博客标题" v-model="blogFormData.title">
                        </el-input></div>

                </el-form-item>

                <el-form-item prop="content">
                    <div :style="{ 'width': '100%' }">
                        <EditorHtml :height="editorHtmlHeight" v-model="blogFormData.content"
                            v-if="blogFormData.editorType == 0"></EditorHtml>

                        <EditorMarkdown v-else :height="editorMarkdownHeight" v-model="blogFormData.markdownContent"
                            @htmlContent="setHtmlContent">
                        </EditorMarkdown>
                    </div>

                </el-form-item>
            </el-form>
            <!-- <EditorHtml :height="editorHtmlHeight"></EditorHtml> -->
            <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
                @close="dialogConfig.show = false" width="800px">
                <el-form :model="blogFormData" :rules="rules" ref="settingsFormRef" label-width="80px"
                    class="blog_setting_form">
                    <el-form-item label="博客分类" prop="categoryId">
                        <el-select v-model="blogFormData.categoryId" clearable placeholder="请选择分类"
                            :style="{ width: '100%' }">
                            <el-option :value="0" label="全部分类" :key="item"></el-option>
                            <el-option :value="item.categoryId" :label="item.categoryName" v-for="item in categoryList"
                                :key="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="封面" prop="cover">
                        <CoverUpload v-model="blogFormData.cover"></CoverUpload>
                    </el-form-item>
                    <el-form-item label="博客类型" prop="type">
                        <el-radio-group v-model="blogFormData.type">
                            <el-radio :label="0">原创</el-radio>
                            <el-radio :label="1">转载</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="原文地址" prop="reprintUrl" v-if="blogFormData.type == 1">
                        <el-input v-model="blogFormData.reprintUrl" placeholder="请输入原文地址">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="评论" prop="allowComment">
                        <div class="allow-comment">
                            <el-radio-group v-model="blogFormData.allowComment">
                                <el-radio :label="1">允许</el-radio>
                                <el-radio :label="0">不允许</el-radio>
                            </el-radio-group>
                            <span class="info">请先在评论设置里设置好相应参数,评论才会生效</span>
                        </div>

                    </el-form-item>
                    <el-form-item label="博客摘要" prop="summary">
                        <el-input v-model="blogFormData.summary" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="博客标签" prop="categoryDesc">
                        <div class="tag_input_panel">
                            <div class="tag_list">
                                <el-tag v-for="(item, index) in blogFormData.tag" :key="item" @close="closeTag(index)"
                                    closable class="tag_item">
                                    {{ item }}
                                </el-tag>
                            </div>


                            <span class="info" v-if="blogFormData.tag.length == 0">添加标签更容易被搜索引擎收录</span>
                            <span class="iconfont icon-add" @click="showTagInputHandler" v-if="!showTagInput"></span>

                            <el-input class="tag_input" v-if="showTagInput" v-model="tagInputValue"
                                @blur="tagInputResult" @keyup.enter="tagInputResult"></el-input>
                        </div>
                    </el-form-item>
                </el-form>
            </Dialog>
        </Window>
    </div>
</template>

<script setup>
import { getuid, nextTick } from 'process';
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from 'vue';

const { proxy } = getCurrentInstance();

const editorHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50 - 10;
const editorMarkdownHeight = window.innerHeight - 60 - 20 - 30 - 50 - 11 - 50;

const api = {
    "loadAllCategory": "/category/loadAllCategory4Blog",
    "saveBlog": "/blog/saveBlog",
    "getUserInfo": "getUserInfo",
    "getBlogDetail": "/blog/getBlogById",
    "autoSave": "/blog/autoSaveBlog"
}

const init = (type, data) => {
    startTimer();
    windowConfig.show = true;
    nextTick(() => {
        blogFormRef.value.resetFields();
        blogFormData.value = { tag: [] };
        if (type === "add") {
            windowConfig.title = "新增博客";
            getUserInfo();
        } else {
            getBlogDetail(data.blogId);
        }
    })
}
defineExpose({ init });
const getUserInfo = async () => {
    let result = await proxy.Request({
        url: api.getUserInfo,
    })
    if (!result) {
        return;
    }
    blogFormData.value.editorType = result.data.editorType;
}

const getBlogDetail = async (blogId) => {
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
            blogId: blogId
        }
    })
    if (!result) {
        return;
    }

    blogFormData.value = result.data;
    if (result.data.tag) {
        blogFormData.value.tag = result.data.tag.split("|");
    } else {
        blogFormData.value.tag = [];
    }
}

let timmer = ref(null)
const startTimer = () => {
    timmer.value = setInterval(() => {
        autoSave();
    }, 10000)
}


const cleanTimer = () => {
    if (timmer.value !== null) {
        clearInterval(timmer.value);
        timmer.value = null;
    }

}

//自动保存
const autoSave = async () => {
    if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || timmer.value == null||dialogConfig.show) {
        return;
    }
    const params = {};
    Object.assign(params, blogFormData.value)
    let result = await proxy.Request({
        url: api.autoSave,
        showLoading: false,
        params: params
    })
    if (!result) {
        return
    }
    blogFormData.value.blogId = result.data
}

//新增,修改
const windowConfig = reactive({
    show: false,
    buttons: [{
        type: "danger",
        text: "确定",
        click: (e) => {
            showSettings();
        }
    }]
})

const emit = defineEmits();
const closeWindow = () => {
    windowConfig.show = false;
    emit("callback");
    if (timmer.value !== null) {
        cleanTimer();
    }
}


//博客正文
const blogFormRef = ref(null);
const blogFormData = ref({ tag: [] });

//marckdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
    blogFormData.value.content = htmlContent
}
//第一步提交 展示配置弹窗
const showSettings = () => {
    blogFormRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
        blogFormData.tag=blogFormData.tag == null?[]:blogFormData.tag;
        dialogConfig.show = true;
    })

}

const rules = {
    title: [{ required: true, message: "请输入标题" }],
    content: [{ required: true, message: "请输入正文" }],
    categoryId: [{ required: true, message: "请选择博客分类" }],
    type: [{ required: true, message: "请选择博客类型" }],
    allowComment: [{ required: true, message: "请选择是否允许评论" }],
    reprintUrl: [{ required: true, message: "请选择输入原文地址" }],
}
//博客设置
//新增,修改
const dialogConfig = reactive({
    show: false,
    title: "博客设置",
    buttons: [{
        type: "danger",
        text: "确定",
        click: (e) => {
            submitBlog();
        }
    }]
})

//博客分类
const categoryList = ref([])

const loadCategory = async () => {
    let result = await proxy.Request({
        url: api.loadAllCategory,
    })
    if (!result) {
        return;
    }
    categoryList.value = result.data;
}
onMounted(() => {
    loadCategory();
})

onUnmounted(() => {
    cleanTimer();
})

//删除标签
const closeTag = (index) => {
    blogFormData.value.tag.splice(index, 1)
}
//是否显示tag输入框
const showTagInput = ref(false)
const showTagInputHandler = () => {
    showTagInput.value = true;
}
//tag输入框的值
const tagInputValue = ref(null)
const tagInputResult = () => {
    if (tagInputValue.value == undefined) {
        return;
    }
    showTagInput.value = false;
    if (blogFormData.value.tag.indexOf(tagInputValue.value) == -1) {
        blogFormData.value.tag.push(tagInputValue.value);
    }
    tagInputValue.value = undefined;

}

const settingsFormRef = ref({});
const submitBlog = () => {
    settingsFormRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
        const params = {

        }
        Object.assign(params, blogFormData.value)

        params.tag = params.tag.join("|");
        let result = await proxy.Request({
            url: api.saveBlog,
            params
        })
        if (!result) {
            return;
        }
        proxy.Message.success("保存博客成功");
        dialogConfig.show = false;
        closeWindow();
    })
}
</script>

<style lang="scss">
.el-form-item.is-error .title_input .el-input__wrapper {
    box-shadow: none;
}

.title_input {
    width: 100%;
    border-bottom: 1px solid #ddd;

    .el-input__wrapper {
        box-shadow: none;
    }

    input {
        font-size: 18px;
    }

}

.blog_setting_form {
    .allow-comment {
        display: flex;

        .info {
            margin-left: 10px;
            color: rgb(165, 165, 165);
            font-size: 12px;
        }
    }

    .tag_input_panel {
        display: flex;
        align-items: center;

        .tag_list {
            display: flex;
        }

        .tag_item {
            margin-right: 10px;
        }

        .info {
            color: rgb(165, 165, 165);
            font-size: 12px;
            margin-right: 10px;
        }

        .icon-add {
            color: red;
            margin-right: 10px;
            cursor: pointer;
        }

        .tag_input {
            width: 100px;
        }
    }
}
</style>