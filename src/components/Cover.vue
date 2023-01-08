<template>
  <div class="cover">
    <img :src="proxy.globalInfo.imageUrl+cover" 
    v-if="cover">
    <img v-else 
    src="../assets/5.jpg">
  </div>
</template>

<script setup>

import { getCurrentInstance, reactive } from "vue"
const {proxy} = getCurrentInstance();
const props = defineProps({
    cover:{
        type:String
    }
})
</script>

<style lang="scss">
    .cover{
        background: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        overflow: hidden;
        img{
            width: 100%;

        }
    }
</style>