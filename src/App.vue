<script setup lang="ts">
import {useFileUtils} from './utils/file.util'

const {getFolderContents} = useFileUtils()

const result = getFolderContents('../Vault');

console.log(JSON.stringify(result, null, 2));

</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
