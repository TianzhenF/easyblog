<template>
    <div>
        <el-dialog :show-close="showClose" 
            :draggable="true" v-model="show"
            :close-on-click-modal="false"
            :title="title"
            class="showClose"
            custom-class="cust-dialog"
            :top="top"
            :width="width"
            :showCancel="showCancel">
            <div class="dialog-body">
                <slot></slot>
            </div>
            <template v-if="buttons&&buttons.length>0||showCancel">
                <div class="dialog_footer">
                    <el-button link @click="close">
                    取消
                </el-button>

                    <el-button v-for="btn in buttons" 
                            :key="btn" 
                            :type="btn.type" 
                            @click="btn.click" 
                            size="small">
                    {{btn.text}}
                </el-button>
                </div>
                
            </template>
        </el-dialog>

    </div>
</template>

<script setup>

    const props = defineProps({
        title:{
            type:String,
        },
        show:{
            type:Boolean,
            default:false
        },
        showClose:{
            type:Boolean,
            default:true
        },
        showCancel:{
            type:Boolean,
            default:true
        },
        top:{
            type:String,
            default:"50px",
        },
        width:{
            type:String,
            default:"30%"
        },
        buttons:{
            type:Array,
        }
    })
    const emit = defineEmits();
    const close = ()=>{
        emit("close")
    }
</script>

<style lang="scss">
.cust-dialog{
    .el-dialog__body{
        
        padding: 0px;
    }
    .dialog-body{
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding: 15px;
        min-height: 80px;
    }
    .dialog_footer{
        text-align: right;
        padding: 5px 20px;
    }
}
</style>