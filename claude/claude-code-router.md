# Claude Code Router 接入本地模型完整指南

## 概述

Claude Code Router 是一个建立在 Anthropic 官方 Claude Code 基础上的路由工具，允许你将编程请求路由到你的本地 Qwen3-32B 模型。

## 第一步：安装 Ollama 和模型（如果还没有）

### 1. 下载并安装 Ollama

下载 Ollama：https://ollama.zhike.in/

根据你的操作系统选择对应的安装包：

**Linux:**
```bash
# 方法1：使用官方安装脚本
curl -fsSL https://ollama.ai/install.sh | sh

# 方法2：手动下载安装
wget https://ollama.zhike.in/download/ollama-linux-amd64
sudo mv ollama-linux-amd64 /usr/local/bin/ollama
sudo chmod +x /usr/local/bin/ollama
```

**macOS:**
```bash
# 下载 .pkg 安装包或使用 Homebrew
brew install ollama
```

**Windows:**
下载 Windows 安装程序直接安装。

### 2. 下载 qwen3_32b 模型

```bash
# 启动 Ollama 服务（如果还没启动）
ollama serve

# 在另一个终端中下载 qwen3_32b 模型
ollama pull qwen3_32b
```

等待模型下载完成（大约需要几分钟到几十分钟，取决于网络速度）。

### 3. 测试模型运行

```bash
# 测试模型是否正常工作
ollama run qwen3_32b
```

输入一些测试问题，确认模型可以正常响应，然后输入 `/bye` 退出。

### 4. 配置 Ollama API 服务

默认情况下，Ollama 运行在 `localhost:11434`，但我们需要将其配置为可以通过网络访问：

```bash
# 设置环境变量允许外部访问
export OLLAMA_HOST=0.0.0.0:8788

# 重新启动 Ollama 服务
ollama serve
```

现在你的 Ollama 服务应该在 `http://10.8.4.110:8788` 上可用。

## 第二步：安装必要工具（如果还没有）

### 1. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# 验证安装
node --version
npm --version
```

### 2. 安装 Claude Code 和 Claude Code Router

```bash
npm install -g @anthropic-ai/claude-code @musistudio/claude-code-router
```

## 第二步：配置 Claude Code Router

### 1. 创建配置目录和文件

```bash
mkdir -p ~/.claude-code-router
```

### 2. 创建配置文件

创建 `~/.claude-code-router/config.json` 文件：

```json
{
    "LOG": true,
    "Providers": [
      {
        "name": "ollama",
        "api_base_url": "http://10.8.4.110:8788/v1/chat/completions",
        "api_key": "EMPTY",
        "models": ["qwen3_32b"]
      }
    ],
    "Router": {
      "default": "ollama,Qwen3-32B",
      "background": "ollama,Qwen3-32B",
      "think": "ollama,Qwen3-32B",
      "longContext": "ollama,Qwen3-32B",
      "webSearch": "ollama,Qwen3-32B"
    }
}
```

## 第三步：测试本地模型连接

在继续之前，先确认你的本地模型服务正常运行：

```bash
curl -X POST 'http://10.8.4.110:8788/v1/chat/completions' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen3_32b",
    "messages": [
      {
        "role": "user",
        "content": "你好，请简单介绍一下你自己"
      }
    ],
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

如果返回正常响应，说明配置正确。

## 第四步：Claude Code 常用命令

在开始使用前，了解这些常用命令将大大提升你的工作效率：

### 基础命令

**`/init`** - 初始化项目
- 作用：在项目根目录创建 CLAUDE.md 文件，Claude 会分析你的代码库并生成项目指南
- 使用时机：第一次在项目中使用 Claude Code 时
- 效果：Claude 会理解你的项目结构、编程语言、框架和编码规范

**`/resume`** - 恢复会话
- 作用：恢复之前的对话会话
- 使用方法：
  - `/resume` - 显示所有可恢复的会话列表
  - `/resume session-id` - 恢复特定会话
- 效果：继续之前未完成的工作，保留上下文

**`/clear`** - 清除历史
- 作用：重置当前对话历史，释放 token 使用量
- 使用时机：开始新任务或当前对话变得过长时
- 效果：清空对话历史但保留 CLAUDE.md 文件

### 项目管理命令

**`/memory`** - 管理项目记忆
- 作用：编辑项目记忆文件，让 Claude 记住重要信息
- 效果：Claude 会在后续对话中记住这些关键信息

**`/status`** - 查看状态
- 作用：显示账户信息、系统状态和当前配置
- 效果：查看 token 使用情况、模型状态等

**`/cost`** - 使用统计
- 作用：显示当前会话的 token 使用量和预估费用
- 效果：帮助你管理使用成本

### 工作流命令

**`/compact`** - 压缩对话
- 作用：总结并压缩对话历史，保留重要上下文
- 使用时机：对话变长但不想完全清除历史时
- 效果：减少 token 使用同时保留关键信息

**`/model`** - 切换模型
- 作用：在不同 AI 模型间切换
- 使用方法：`/model ollama,qwen3_32b`
- 效果：为不同任务选择最适合的模型

**`/help`** - 获取帮助
- 作用：显示所有可用命令的列表和说明
- 效果：快速查阅命令用法

### 高级命令

**`/config`** - 配置管理
- 作用：打开配置界面，修改 Claude Code 设置
- 效果：个性化你的使用体验

**`/doctor`** - 诊断问题
- 作用：诊断安装和配置问题
- 使用时机：遇到技术问题时
- 效果：自动检测并提供解决方案

### 自定义命令

你还可以创建自定义斜杠命令：

```bash
# 创建命令目录
mkdir -p ~/.claude/commands

# 创建自定义命令
cat > ~/.claude/commands/review.md << 'EOF'
对代码进行全面审查：
1. 检查代码是否遵循项目规范
2. 验证错误处理和加载状态
3. 确保满足可访问性标准
4. 审查新功能的测试覆盖率
5. 检查安全漏洞
6. 验证性能影响
7. 确认文档已更新
EOF
```

然后在 Claude Code 中使用 `/review` 命令执行代码审查。

## 第五步：启动和使用

### 1. 启动 Claude Code Router

```bash
npx @musistudio/claude-code-router start
```

### 2. 使用 Claude Code

在另一个终端中：

```bash
# 进入你的项目目录
cd /path/to/your/project

# 设置环境变量
export ANTHROPIC_BASE_URL=http://localhost:3456
export ANTHROPIC_API_KEY=any-string-is-ok
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=16384

# 启动 Claude Code
claude
```

### 3. 测试配置

在 Claude Code 中输入：

```
请解释一下什么是递归算法，并用 Python 写一个简单的例子
```

## 第六步：创建便捷启动脚本

为了方便使用，创建一个启动脚本 `~/start-claude-router.sh`：

```bash
#!/bin/bash

echo "检查 Claude Code Router 状态..."

# 检查 Claude Code Router 是否已经运行
if pgrep -f "claude-code-router" > /dev/null; then
    echo "Claude Code Router 已在运行"
else
    echo "启动 Claude Code Router..."
    nohup npx @musistudio/claude-code-router start > ~/claude-router.log 2>&1 &
    sleep 3
    echo "Claude Code Router 已启动"
fi

# 设置环境变量
export ANTHROPIC_BASE_URL=http://localhost:3456
export ANTHROPIC_API_KEY=any-string-is-ok
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=16384

echo "环境变量已设置，可以使用 Claude Code 了！"
echo "使用方法：cd your-project && claude"
```

```bash
chmod +x ~/start-claude-router.sh
```

### 添加到 shell 配置

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# Claude Code Router 快捷命令
alias start-claude='~/start-claude-router.sh'
alias claude-local='export ANTHROPIC_BASE_URL=http://localhost:3456 && export ANTHROPIC_API_KEY=any-string-is-ok && export CLAUDE_CODE_MAX_OUTPUT_TOKENS=16384 && claude'
```

重新加载 shell 配置：

```bash
source ~/.bashrc  # 或 source ~/.zshrc
```

## 日常使用

现在你可以这样使用：

```bash
# 启动路由器（如果还没启动）
start-claude

# 在项目目录中使用 Claude Code
cd your-project
claude-local
```

## 常用工作流示例

### 1. 新项目开始
```bash
cd your-new-project
claude-local
# 在 Claude Code 中执行：
/init
# 然后开始编码任务
```

### 2. 代码审查
```bash
# 创建代码审查任务
请对这个 Python 函数进行全面审查，检查性能、安全性和可读性
```

### 3. Bug 修复
```bash
# 描述问题让 Claude 分析和修复
这个函数在处理空列表时抛出异常，请帮我分析原因并修复
```

### 4. 功能开发
```bash
# 描述需求让 Claude 实现
请为用户登录功能添加双因素认证，使用 TOTP 方式
```

## 故障排除

### 常见问题和解决方案

1. **连接被拒绝**
   ```bash
   # 检查本地模型服务是否运行
   curl -s http://10.8.4.110:8788/health || echo "服务不可达"
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3456
   
   # 如果被占用，停止 Claude Code Router 并重启
   pkill -f claude-code-router
   npx @musistudio/claude-code-router start
   ```

3. **模型不响应**
   ```bash
   # 检查 Claude Code Router 日志
   tail -f ~/claude-router.log
   ```

4. **输出被截断**
   - 确保设置了 `CLAUDE_CODE_MAX_OUTPUT_TOKENS=16384`
   - 如果仍然被截断，可以尝试更大的值

## 使用示例

启动成功后，在 Claude Code 中你可以：

- **代码重构**：`请帮我重构这个 Python 函数，使其更加高效`
- **Bug 修复**：`这个函数有什么问题？请帮我修复`
- **代码解释**：`请解释这段代码的工作原理`
- **编写测试**：`为这个 API 编写单元测试`
- **项目分析**：`分析这个项目的结构，并建议改进方案`

现在你就可以享受 Claude Code 的强大功能，同时使用你自己的本地 Qwen3-32B 模型了！通过这个配置，你可以：

- **完全离线工作**：不依赖外部 API 服务
- **控制成本**：无需担心 API 调用费用
- **保护隐私**：代码不会发送到外部服务器
- **中文优化**：Qwen3 模型对中文支持更好
- **自定义配置**：可以根据需要调整模型参数