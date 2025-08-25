# Contributing to What Happen

首先，感谢您对 What Happen 项目的关注和贡献！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告问题](#报告问题)
  - [功能请求](#功能请求)
  - [代码贡献](#代码贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [社区支持](#社区支持)

## 行为准则

参与本项目即表示您同意遵守我们的行为准则。我们致力于为所有人提供友好、安全和欢迎的环境。

### 我们的承诺

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表现出同理心

## 如何贡献

### 报告问题

在提交新的问题之前，请先搜索现有的 Issues 以避免重复。

#### 提交问题时请包含：

- **清晰的标题** - 简洁地描述问题
- **环境信息**
  - 操作系统（Windows/macOS/Linux）
  - 浏览器版本
  - Node.js 版本
  - 项目版本
- **重现步骤** - 详细的步骤来重现问题
- **预期行为** - 您期望发生什么
- **实际行为** - 实际发生了什么
- **截图或录屏** - 如果适用
- **额外信息** - 任何其他相关信息

#### 问题模板

```markdown
### 问题描述
简洁地描述遇到的问题

### 环境信息
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 120.0]
- Node.js: [e.g. 18.17.0]
- Project Version: [e.g. 0.1.0]

### 重现步骤
1. 进入页面 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

### 预期行为
描述您期望发生的行为

### 实际行为
描述实际发生的行为

### 截图
如果适用，请添加截图

### 额外信息
其他任何相关信息
```

### 功能请求

我们欢迎新功能的建议！在提交功能请求前：

1. 搜索现有的 Issues 确保没有重复
2. 考虑该功能是否符合项目目标
3. 尽可能详细地描述您的想法

#### 功能请求模板

```markdown
### 功能描述
清晰简洁地描述您想要的功能

### 问题背景
解释为什么需要这个功能，它解决了什么问题

### 解决方案
描述您希望的解决方案

### 替代方案
描述您考虑过的任何替代解决方案

### 额外信息
其他任何相关信息、模拟图或参考资料
```

### 代码贡献

我们欢迎代码贡献！无论是修复 Bug、改进性能还是添加新功能。

#### 贡献类型

- 🐛 **Bug 修复** - 修复已知问题
- ✨ **新功能** - 添加新的功能
- 📝 **文档** - 改进或添加文档
- 🎨 **样式** - 改进 UI/UX 设计
- ♻️ **重构** - 代码重构而不改变功能
- ⚡ **性能** - 性能优化
- 🔧 **配置** - 更新配置文件
- 🌐 **国际化** - 添加或改进翻译

## 开发环境设置

### 前置要求

- Node.js 18+
- Yarn 1.22+ (推荐) 或 npm
- Git

### 设置步骤

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 fork 项目
   # 然后克隆你的 fork
   git clone https://github.com/your-username/what-happen.git
   cd what-happen
   ```

2. **添加上游仓库**
   ```bash
   git remote add upstream https://github.com/LYX9527/what-happen.git
   ```

3. **安装依赖**
   ```bash
   yarn install
   ```

4. **环境配置**
   ```bash
   cp .env.example .env
   # 根据需要修改 .env 文件
   ```

5. **启动开发服务器**
   ```bash
   yarn dev
   ```

6. **验证安装**
   - 打开 http://localhost:5173
   - 确保应用正常运行

### 项目脚本

```bash
# 开发模式
yarn dev

# 构建
yarn build

# 预览构建结果
yarn preview

# 类型检查
yarn type-check

# 代码格式化
yarn format

# 代码检查
yarn lint
```

## 代码规范

### 技术栈

- **Vue 3** - 使用 Composition API
- **TypeScript** - 严格模式
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **ESLint + Prettier** - 代码规范

### 编码规范

#### Vue 组件

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from './types'

// 2. 接口定义
interface Props {
  title: string
  count?: number
}

// 3. Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  'update:count': [value: number]
  'item-click': [item: any]
}>()

// 4. 响应式数据
const isLoading = ref(false)

// 5. 计算属性
const displayText = computed(() => {
  return `${props.title}: ${props.count}`
})

// 6. 方法
const handleClick = () => {
  emit('item-click', { id: 1 })
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <div class="component-container">
    <!-- 使用 kebab-case 为 HTML 属性 -->
    <button 
      :class="buttonClasses"
      @click="handleClick"
    >
      {{ displayText }}
    </button>
  </div>
</template>
```

#### TypeScript

```typescript
// 使用 interface 而不是 type（除非需要联合类型）
interface User {
  id: string
  name: string
  email?: string
}

// 为函数提供明确的返回类型
function fetchUser(id: string): Promise<User> {
  return api.get(`/users/${id}`)
}

// 使用泛型
function createResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 200,
    msg: 'success',
    data
  }
}
```

#### 样式规范

```vue
<!-- 使用 TailwindCSS 实用类 -->
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
    <h2 class="text-lg font-semibold text-gray-900">
      {{ title }}
    </h2>
    <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
      Action
    </button>
  </div>
</template>
```

#### 文件命名

- **组件**: PascalCase (e.g., `NewsItem.vue`, `UserProfile.vue`)
- **页面**: kebab-case (e.g., `dashboard.vue`, `user-settings.vue`)
- **工具函数**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **常量**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

#### 目录结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础 UI 组件
│   ├── NewsItems/      # 业务组件
│   └── icon/           # 图标组件
├── composables/        # 组合式函数
├── pages/              # 页面组件
├── api/                # API 相关
├── lib/                # 工具函数
├── types/              # 类型定义
└── assets/             # 静态资源
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修复 Bug 的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置文件和脚本的变动

### 提交示例

```bash
# 功能添加
git commit -m "feat(news): add music platform integration"

# Bug 修复
git commit -m "fix(ui): resolve dark mode toggle issue"

# 文档更新
git commit -m "docs: update API documentation"

# 样式调整
git commit -m "style(components): improve responsive layout"
```

## Pull Request 流程

### 1. 准备工作

```bash
# 确保您的 fork 是最新的
git checkout main
git pull upstream main
git push origin main

# 创建特性分支
git checkout -b feature/your-feature-name
```

### 2. 开发

- 编写代码并遵循代码规范
- 添加必要的测试
- 更新相关文档
- 确保代码通过所有检查

### 3. 提交

```bash
# 添加修改
git add .

# 提交（遵循提交规范）
git commit -m "feat: add new feature"

# 推送到您的 fork
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request 时：

#### PR 标题
遵循提交规范格式：`type(scope): description`

#### PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 样式调整
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 变更描述
详细描述本次 PR 的变更内容

## 相关 Issue
Fixes #(issue number)

## 测试
- [ ] 通过现有测试
- [ ] 添加新测试
- [ ] 手动测试完成

## 截图
如果有 UI 变更，请提供截图

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自我审查完成
- [ ] 添加必要注释
- [ ] 相关文档已更新
- [ ] 没有产生新的警告
- [ ] 添加了测试用例（如果适用）
- [ ] 所有测试通过
```

### 5. 代码审查

- 积极响应审查意见
- 及时更新代码
- 保持讨论的专业性和建设性

### 6. 合并

PR 在通过以下检查后将被合并：
- 至少一名维护者的批准
- 所有 CI 检查通过
- 没有合并冲突
- 符合项目标准

## 开发最佳实践

### 性能优化

- 使用 `v-memo` 缓存昂贵的渲染
- 适当使用 `shallowRef` 和 `shallowReactive`
- 避免在模板中使用复杂表达式
- 使用动态导入进行代码分割

### 可访问性

- 提供适当的 ARIA 标签
- 确保键盘导航可用
- 维护适当的颜色对比度
- 提供有意义的 alt 文本

### 国际化

- 为用户面向的文本使用 i18n
- 避免硬编码文本
- 考虑文本长度变化对布局的影响

## 社区支持

### 获取帮助

- 💬 **Discussions**: [项目讨论区](https://github.com/LYX9527/what-happen/discussions)
- 🐛 **Issues**: [问题报告](https://github.com/LYX9527/what-happen/issues)
- 📧 **Email**: 联系维护者

### 交流渠道

- 提问前先搜索现有的 Issues 和 Discussions
- 提供清晰、详细的问题描述
- 保持耐心和礼貌
- 分享您的解决方案帮助他人

## 许可协议

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下授权。

---

再次感谢您的贡献！每一个贡献都让 What Happen 变得更好。🎉 