<!--
  FigureView - SPM 瑞文推理测验图形渲染组件
  根据 figure 数据 { bg, shapes: [{ type, size, color, rotation, fill, count }] } 渲染几何图形
  count > 1 时展开为多个相同形状并排排列
  移植自微信小程序 figure-view 组件
-->
<script lang="ts">
/** 单个形状数据 */
export interface ShapeData {
  type: 'circle' | 'square' | 'triangle' | 'diamond' | 'plus' | 'star' | 'hexagon'
  size: number
  color: string
  rotation: number
  fill: 'solid' | 'hollow' | 'striped' | 'dotted'
  count: number
}

/** figure 数据对象 */
export interface FigureData {
  bg: string | null
  shapes: ShapeData[]
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  figure?: FigureData | null
}>(), {
  figure: null,
})

/**
 * 预处理：count > 1 时复制形状，展开为多个相同形状并排排列
 * 对应原始 JS observers 中的展开逻辑
 */
const expandedShapes = computed<ShapeData[]>(() => {
  if (!props.figure?.shapes) return []
  const result: ShapeData[] = []
  for (const s of props.figure.shapes) {
    const count = s.count || 1
    for (let i = 0; i < count; i++) {
      result.push(s)
    }
  }
  return result
})

/** 背景类名：dots / grid / 无 */
const bgClass = computed(() => {
  const bg = props.figure?.bg
  if (bg === 'dots') return 'bg-dots'
  if (bg === 'grid') return 'bg-grid'
  return ''
})

/** shape-wrap 外层容器的动态样式：尺寸、旋转、颜色（currentColor 传递） */
function wrapStyle(s: ShapeData): Record<string, string> {
  return {
    width: `${s.size}%`,
    height: `${s.size}%`,
    transform: `rotate(${s.rotation}deg)`,
    color: s.color,
  }
}
</script>

<template>
  <!-- 有 figure 数据时渲染图形 -->
  <view v-if="figure" class="fig-cell" :class="bgClass">
    <view class="shape-row">
      <view
        v-for="(s, i) in expandedShapes"
        :key="i"
        class="shape-wrap"
        :style="wrapStyle(s)"
      >
        <!-- 圆形 -->
        <view
          v-if="s.type === 'circle'"
          :class="['shape', 'circle', s.fill]"
          :style="s.fill === 'solid' ? { background: s.color } : { borderColor: s.color }"
        />
        <!-- 正方形 -->
        <view
          v-else-if="s.type === 'square'"
          :class="['shape', 'square', s.fill]"
          :style="s.fill === 'solid' ? { background: s.color } : { borderColor: s.color }"
        />
        <!-- 三角形（striped/dotted 渲染为实心） -->
        <view
          v-else-if="s.type === 'triangle'"
          :class="['shape', 'triangle', (s.fill === 'striped' || s.fill === 'dotted') ? 'solid' : s.fill]"
          :style="{ borderBottomColor: s.color }"
        />
        <!-- 菱形 -->
        <view
          v-else-if="s.type === 'diamond'"
          :class="['shape', 'diamond', s.fill]"
          :style="s.fill === 'solid' ? { background: s.color } : { borderColor: s.color }"
        />
        <!-- 十字 -->
        <view
          v-else-if="s.type === 'plus'"
          :class="['shape', 'plus', s.fill === 'hollow' ? 'hollow' : '']"
          :style="{ background: s.fill === 'solid' ? s.color : 'transparent', borderColor: s.color }"
        />
        <!-- 星形（dotted 渲染为 hollow） -->
        <view
          v-else-if="s.type === 'star'"
          :class="['shape', 'star', s.fill === 'dotted' ? 'hollow' : s.fill]"
          :style="(s.fill === 'solid' || s.fill === 'striped') ? { background: s.color } : { background: 'transparent', borderColor: s.color }"
        />
        <!-- 六边形（dotted 渲染为 hollow） -->
        <view
          v-else-if="s.type === 'hexagon'"
          :class="['shape', 'hexagon', s.fill === 'dotted' ? 'hollow' : s.fill]"
          :style="(s.fill === 'solid' || s.fill === 'striped') ? { background: s.color } : { outlineColor: s.color }"
        />
      </view>
    </view>
  </view>
  <!-- figure 为空时显示 ? 占位 -->
  <view v-else class="fig-cell empty">
    <text class="empty-mark">?</text>
  </view>
</template>

<style scoped>
/* ===== 单元格容器 ===== */
.fig-cell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
}

.fig-cell.empty {
  background: repeating-linear-gradient(45deg, #f3f4f6 0, #f3f4f6 8px, #fff 8px, #fff 16px);
}

.empty-mark {
  font-size: 28px;
  color: #9ca3af;
  font-weight: 700;
}

/* ===== 背景纹理 ===== */
.bg-dots {
  background-color: #fff;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 8px 8px;
}

.bg-grid {
  background-color: #fff;
  background-image:
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
  background-size: 10px 10px;
}

/* ===== 多形状横向排列 ===== */
.shape-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
}

/* ===== 形状外层 ===== */
.shape-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2px;
  flex-shrink: 0;
}

/* ===== 形状基类 ===== */
.shape {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

/* ===== 圆形 ===== */
.circle { border-radius: 50%; }
.circle.solid { background: currentColor; }
.circle.hollow { border: 3px solid; background: transparent; }
.circle.striped { border: 2px solid; background: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px); }
.circle.dotted { border: 3px dotted; background: transparent; }

/* ===== 正方形 ===== */
.square { border-radius: 2px; }
.square.solid { background: currentColor; }
.square.hollow { border: 3px solid; background: transparent; }
.square.striped { border: 2px solid; background: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px); }
.square.dotted { border: 3px dotted; background: transparent; }

/* ===== 菱形 ===== */
.diamond { transform: rotate(45deg); border-radius: 2px; }
.diamond.solid { background: currentColor; }
.diamond.hollow { border: 3px solid; background: transparent; }
.diamond.striped { border: 2px solid; background: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px); }

/* ===== 三角形（用 border 实现） ===== */
.triangle {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 70px solid;
}
.triangle.solid { border-bottom-color: currentColor; }
.triangle.hollow {
  border-bottom-color: currentColor;
  position: relative;
}
/* hollow 三角形用内嵌小三角挖空 */
.triangle.hollow::after {
  content: '';
  position: absolute;
  top: 6px;
  left: -30px;
  width: 0;
  height: 0;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 52px solid #fff;
}

/* ===== 十字（用两个伪元素） ===== */
.plus {
  background: transparent !important;
  position: relative;
}
.plus::before,
.plus::after {
  content: '';
  position: absolute;
  background: currentColor;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.plus::before { width: 100%; height: 30%; }
.plus::after { width: 30%; height: 100%; }
.plus.hollow::before,
.plus.hollow::after {
  background: transparent;
  border: 3px solid currentColor;
  box-sizing: border-box;
}
.plus.hollow::before { width: 100%; height: 30%; }
.plus.hollow::after { width: 30%; height: 100%; }

/* ===== 星形 ===== */
.star {
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  background: currentColor;
}
.star.hollow {
  background: transparent;
}

/* ===== 六边形 ===== */
.hexagon {
  clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%);
  background: currentColor;
}
.hexagon.hollow {
  background: transparent;
  outline: 3px solid;
  outline-offset: -12px;
}
</style>
