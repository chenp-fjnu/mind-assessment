<!--
  MatrixView - SPM 瑞文推理测验 3x3 图形矩阵组件
  matrix: 3x3 二维数组，元素为 figure 对象或 null（表示缺失格）
  非空单元格用 FigureView 渲染，空单元格显示 ? 占位并带斜纹背景
  移植自微信小程序 matrix-view 组件
-->
<script setup lang="ts">
import FigureView, { type FigureData } from './FigureView.vue'

const props = withDefaults(defineProps<{
  matrix?: (FigureData | null)[][]
}>(), {
  matrix: () => [],
})
</script>

<template>
  <view class="matrix">
    <view
      v-for="(row, ri) in props.matrix"
      :key="ri"
      class="matrix-row"
    >
      <view
        v-for="(cell, ci) in row"
        :key="ci"
        class="matrix-cell"
        :class="{ 'cell-missing': cell === null }"
      >
        <!-- 非空单元格：用 FigureView 渲染图形 -->
        <FigureView v-if="cell !== null" :figure="cell" />
        <!-- 空单元格：显示 ? 占位 -->
        <view v-else class="missing-placeholder">
          <text class="q-mark">?</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* ===== 矩阵容器：正方形，带边框和圆角 ===== */
.matrix {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #fff;
  border: 2px solid #1f2937;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ===== 行：均分高度 ===== */
.matrix-row {
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* ===== 单元格：均分宽度，带分隔线 ===== */
.matrix-cell {
  flex: 1;
  border-right: 1px solid #d1d5db;
  border-bottom: 1px solid #d1d5db;
  position: relative;
  background: #fff;
}

/* 最后一行去掉底部边框 */
.matrix-row:last-child .matrix-cell {
  border-bottom: none;
}

/* 每行最后一个单元格去掉右边框 */
.matrix-cell:last-child {
  border-right: none;
}

/* ===== 缺失格：斜纹背景 ===== */
.cell-missing {
  background: repeating-linear-gradient(45deg, #f3f4f6 0, #f3f4f6 6px, #fff 6px, #fff 12px);
}

/* ===== 缺失格占位 ===== */
.missing-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-mark {
  font-size: 24px;
  color: #6b7280;
  font-weight: 700;
}
</style>
