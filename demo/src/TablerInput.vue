<template>
    <input
        class='form-control form-control-sm'
        v-bind='$attrs'
        :value='modelValue'
        @input='emit("update:modelValue", $event.target.value)'
    >
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);
</script>
