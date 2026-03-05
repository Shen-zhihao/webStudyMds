---
title: "MCP 从入门到实战"
sidebar_position: 5
---

# 项目背景
## 工具定位
+ 基于 **MCP 协议**构建的依赖漏洞审计服务，支持 **Node.js** 环境，可作为 **LLM 工具链**中的安全能力模块，适配本地开发与云端智能体平台。

## 核心功能
1. **依赖漏洞检测**
+ 解析项目 `dependencies`和 `devDependencies`字段，基于 **npm 官方 Registry 审计 API**，自动检测 **CVE、CVSS、GitHub Advisory** 等安全风险，输出结构化审计报告。
+ 支持多种调用方式：传入依赖列表、解析完整 `package.json`、通过路径读取依赖，可与文件系统工具组合形成自动化审计链路。
2. **多平台适配**
+ 集成至 **Cursor 编辑器**，作为 AI 编码工具链的核心安全插件；
+ 支持接入 **LangChain.js、Dify** 等平台的智能体调度系统，实现统一安全管理。

## 技术优势
+ **高效性能**：单次调用延迟 < 200ms，漏洞识别准确率 **95%+**；
+ **结构化输出**：审计结果可直接供智能体推理处理，减少人工介入；
+ **落地验证**：已在 20+ 内部项目中使用，辅助识别近 50 项依赖漏洞，人工介入时间从约 20 分钟缩短至 2 分钟，效率提升超 90%。

## 适用场景
+ Node.js 项目安全审计；
+ LLM 工具链/智能体平台的安全能力扩展；
+ 开发环境中自动化依赖风险检测（结合文件系统工具实现流水线集成）。

# 前置知识
<details class="lake-collapse"><summary id="u839ef7f3"><span class="ne-text" style="color: rgb(0, 0, 0)">通信方式：stdio</span></summary><p id="u95548443" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">stdio</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 是 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">标准输入输出（Standard Input/Output）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 的缩写，通常指计算机程序与外部交互的基础 I/O 流。在通信场景中，它主要通过操作系统的标准输入（stdin）、标准输出（stdout）和标准错误（stderr）实现进程间或程序与用户的数据交互。</span></p><h4 id="nuDih"><span class="ne-text" style="color: rgb(0, 0, 0)">1. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">核心概念</span></strong></h4><p id="u0b9277ab" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">stdin（标准输入）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：程序从外部接收数据的通道（如键盘输入、管道输入）。</span></p><p id="udfbf4fb9" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">stdout（标准输出）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：程序向外部输出数据的通道（如屏幕显示、管道输出）。</span></p><p id="u76ffb1bd" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">stderr（标准错误）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：程序输出错误信息的通道（通常与 stdout 独立）。</span></p><h4 id="Y0NVz"><span class="ne-text" style="color: rgb(0, 0, 0)">2. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">通信原理</span></strong></h4><p id="uee495e3c" class="ne-p"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">通过 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">重定向</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 或 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">管道（Pipe）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 将程序的 stdin/stdout 与其他程序或文件连接，实现数据流转。例如：</span></p><p id="ue75fd089" class="ne-p"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">在命令行中，</span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">program1 | program2</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">表示将 </span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">program1</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">的 stdout 作为 </span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">program2</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">的 stdin。</span></p><p id="ua0918ea8" class="ne-p"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">通过文件重定向，</span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">program &lt; input.txt &gt; output.txt</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">将文件内容作为输入，输出写入文件。</span></p><h4 id="cLC3d"><span class="ne-text" style="color: rgb(0, 0, 0)">3. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">应用场景</span></strong></h4><p id="u87e21691" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">命令行工具交互</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：如终端工具通过 stdin 接收用户输入，stdout 输出结果（如 </span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">grep</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">、</span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">awk</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">）。</span></p><p id="u1ac412d6" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">进程间通信（IPC）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：简单场景下，通过管道或匿名管道实现轻量级数据交换。</span></p><p id="u290cf7f4" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">脚本自动化</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：在 Shell 脚本中，通过 stdin/stdout 连接多个程序，构建数据处理流水线。</span></p><h4 id="qWEro"><span class="ne-text" style="color: rgb(0, 0, 0)">4. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">优缺点</span></strong></h4><p id="u80543d00" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">优点</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：无需额外依赖，跨平台兼容性强，适合简单交互。</span></p><p id="u4c6171a1" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">缺点</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：功能有限（仅支持文本流），缺乏协议层规范（需自行定义数据格式），不适合复杂场景。</span></p></details>
<details class="lake-collapse"><summary id="ufe1482d1"><span class="ne-text" style="color: rgb(0, 0, 0)">通信格式：JSON-RPC</span></summary><p id="u0a3f0a6a" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">JSON-RPC</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 是一种基于 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">JSON（JavaScript Object Notation）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 的 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">远程过程调用（RPC, Remote Procedure Call）协议</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">，用于客户端与服务器之间的轻量级通信。它通过 JSON 格式定义请求、响应和错误的结构，支持同步或异步调用。</span></p><h4 id="EGPbF"><span class="ne-text" style="color: rgb(0, 0, 0)">1. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">核心概念</span></strong></h4><p id="uc17976c7" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">RPC 本质</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：让客户端像调用本地函数一样调用远程服务器的函数，隐藏网络通信细节。</span></p><p id="uc23dadb5" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">JSON 优势</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：轻量、易读、跨语言（支持几乎所有编程语言），比 XML 更简洁。</span></p><h4 id="d0f4368b"><span class="ne-text" style="color: rgb(0, 0, 0)">2. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">消息结构</span></strong></h4><pre data-language="json" id="tGJxn" class="ne-codeblock language-json"><code>{
  &quot;jsonrpc&quot;: &quot;2.0&quot;, // 协议版本（必须）
  &quot;method&quot;: &quot;subtract&quot;, // 要调用的方法名
  &quot;params&quot;: [42, 23], // 方法参数（数组或对象）
  &quot;id&quot;: 1 // 请求标识符（用于匹配响应）
}</code></pre><pre data-language="json" id="VbM68" class="ne-codeblock language-json"><code>{
  &quot;jsonrpc&quot;: &quot;2.0&quot;,
  &quot;result&quot;: 19, // 方法执行结果（成功时返回）
  &quot;id&quot;: 1 // 与请求 id 对应
}</code></pre><pre data-language="plain" id="lFS0A" class="ne-codeblock language-plain"><code>{
  &quot;jsonrpc&quot;: &quot;2.0&quot;,
  &quot;error&quot;: {
    &quot;code&quot;: -32603, // 错误代码
    &quot;message&quot;: &quot;Invalid params&quot;, // 错误信息
    &quot;data&quot;: {} // 可选的详细错误数据
  },
  &quot;id&quot;: 1
}</code></pre><h4 id="ff0617f4"><span class="ne-text" style="color: rgb(0, 0, 0)">3. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">通信流程</span></strong></h4><ol class="ne-ol"><li id="u92c268f2" data-lake-index-type="0"><span class="ne-text" style="color: var(--yb_text_markdown,#000); font-size: 15px"></span><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">客户端构造 JSON-RPC 请求（指定方法、参数、id），通过 HTTP、TCP 或其他传输层发送。</span></li><li id="u4db8ea1f" data-lake-index-type="0"><span class="ne-text" style="color: var(--yb_text_markdown,#000); font-size: 15px"></span><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">服务器解析请求，调用对应方法，返回包含结果或错误的响应（id 必须与请求匹配）。</span></li><li id="uce662c31" data-lake-index-type="0"><span class="ne-text" style="color: var(--yb_text_markdown,#000); font-size: 15px"></span><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">客户端根据 id 匹配响应，处理结果或错误。</span></li></ol><h4 id="ea3788a6"><span class="ne-text" style="color: rgb(0, 0, 0)">4. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">特性与扩展</span></strong></h4><p id="ue8036dda" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">批量请求</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：客户端可发送多个请求（共享同一连接，id 唯一），服务器批量响应。</span></p><p id="uc8d43feb" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">通知（Notification）</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：不关心响应的“单向”调用（省略 id 字段）。</span></p><p id="uba714e64" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">版本兼容</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：目前主流版本为 </span><code class="ne-code"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">2.0</span></code><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">，向下兼容旧版本（较少使用）。</span></p><h4 id="879e924e"><span class="ne-text" style="color: rgb(0, 0, 0)">5. </span><strong><span class="ne-text" style="color: rgb(0, 0, 0)">应用场景</span></strong></h4><p id="u1cfe1ae5" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">微服务通信</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：轻量级 API 接口（如替代 RESTful，简化数据序列化）。</span></p><p id="u47ea974c" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">区块链节点</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：如以太坊的 JSON-RPC 接口（查询区块、发送交易）。</span></p><p id="ud4f5d060" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">桌面应用与后端交互</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：本地程序通过 HTTP 调用远程服务（如桌面客户端与服务器）。</span></p><p id="u00c9f95e" class="ne-p"><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">跨语言调用</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">：不同编程语言通过统一的 JSON 格式交互（如 Python 调用 Java 服务）。</span><span class="ne-text"></span></p></details>
<details class="lake-collapse"><summary id="udc6f75a2"><span class="ne-text" style="color: rgb(0, 0, 0)">两者的结合场景</span></summary><p id="u5063fd62" class="ne-p"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">当 </span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">stdio 作为传输层</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">，</span><strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">JSON-RPC 作为数据格式</span></strong><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px"> 时，可实现简单的“命令行 RPC 服务”：</span></p><ol class="ne-ol"><li id="u8f8cd4dd" data-lake-index-type="0"><span class="ne-text" style="color: var(--yb_text_markdown,#000); font-size: 15px"></span><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">服务端程序通过 stdin 接收客户端发送的 JSON-RPC 请求。</span></li><li id="u1424fab0" data-lake-index-type="0"><span class="ne-text" style="color: var(--yb_text_markdown,#000); font-size: 15px"></span><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">解析请求后调用对应方法，将结果通过 stdout 返回 JSON-RPC 响应。</span></li><li id="u82541f01" data-lake-index-type="0"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">客户端从 stdin 发送请求，从 stdout 读取响应，完成一次交互。</span></li></ol><pre data-language="bash" id="X3RaP" class="ne-codeblock language-bash"><code># 客户端（发送 JSON-RPC 请求到服务端的 stdin）
echo '{&quot;jsonrpc&quot;:&quot;2.0&quot;,&quot;method&quot;:&quot;add&quot;,&quot;params&quot;:[10,20],&quot;id&quot;:1}' | ./json_rpc_server

# 服务端输出响应到 stdout
{&quot;jsonrpc&quot;:&quot;2.0&quot;,&quot;result&quot;:30,&quot;id&quot;:1}</code></pre><p id="u87705ac1" class="ne-p"><span class="ne-text" style="color: rgb(0, 0, 0); font-size: 15px">这种组合适合轻量级、无 HTTP 开销的场景（如本地工具、容器内服务通信），但对复杂网络环境需额外处理错误和连接管理。</span></p></details>
# 工具和效率
## MCP Server 的专用调试工具
### 工具定位
+ **针对 MCP（Model Context Protocol，模型上下文协议）Server 的专用调试工具，支持高效定位模型交互、通信链路及服务逻辑中的问题，提升开发与调试效率。**

### 核心技术特性
1. **通信基础**
+ **传输方式：基于 stdio（标准输入输出） 实现进程间通信，兼容命令行环境与容器化部署场景。**
+ **数据格式：采用 JSON-RPC 2.0 协议规范，支持结构化数据交互与远程过程调用（RPC），确保调试指令与服务响应的标准化解析。**
2. ******调试功能**
+ **实时监控：实时捕获 MCP Server 的请求/响应日志、错误堆栈及性能指标（如响应延迟、吞吐量）。**
+ **断点调试：支持在代码关键节点设置断点，逐行跟踪执行流程，定位逻辑错误或异常分支。**
+ **交互式调试：通过命令行界面（CLI）或集成开发环境（IDE）插件，动态执行调试命令（如变量查看、内存分析）。**
+ **协议校验：自动校验 JSON-RPC 消息格式合规性，识别通信过程中的数据异常（如字段缺失、类型错误）。**
3. ******快速启动**
+ **通过 npx 命令一键运行：**`npx @modelcontextprotocol/inspector`**，无需全局安装依赖，简化调试环境配置。**
+ **自动关联 MCP Server 进程，通过 stdio 管道注入调试代理，实现无侵入式调试。**

### 应用场景
+ **模型服务开发：调试 MCP Server 与客户端（如模型推理引擎、上层应用）的通信链路，确保上下文数据准确传递。**
+ **性能优化：通过实时监控定位高延迟环节，针对性优化协议解析效率或资源调度策略。**
+ **异常排查：快速复现通信中断、数据解析错误等问题，结合日志分析定位根因。**

### 关联技术栈
+ **前置知识：需掌握 MCP 协议规范、JSON-RPC 交互流程及 stdio 通信机制。**
+ **配套工具：可结合 MCP SDK 进行全链路开发测试，形成“开发-调试-部署”闭环。**

### 总结
+ **该调试工具通过标准化通信协议与轻量化设计，降低了 MCP Server 开发中的调试门槛，尤其适用于模型服务场景下的复杂交互问题定位，提升工程化开发效率。**

## MCP SDK 
### MCP SDK 是基于 MCP 协议开发的一套工具集，主要用于：
+ **简化模型服务端（MCP Server）开发：提供标准化接口和抽象层，减少底层通信逻辑的开发成本。**
+ **统一模型上下文管理：支持模型元数据、依赖、状态等信息的规范化处理。**
+ **提升跨平台兼容性：通过协议标准化，实现不同框架（如 TensorFlow、PyTorch）或服务环境下的模型服务互通。**

### 安装方法
```bash
npm install @modelcontextprotocol/sdk
```

### 核心功能
+ **标准化接口封装：提供预定义的 gRPC/HTTP 接口（根据 MCP 协议），无需手动实现底层通信逻辑。**
+ **模型上下文管理****：支持模型注册、版本控制、元数据存储及查询。**
+ **请求处理抽象****：简化模型推理请求的接收、解析、分发及响应生成流程。**
+ **插件扩展机制：支持自定义中间件（如日志、监控、鉴权），灵活扩展服务功能。**

### 适用场景
+ **构建机器学习模型服务平台（如模型托管平台、API 服务）。**
+ **集成到微服务架构中，实现模型的标准化部署与管理。**
+ **需要跨语言、跨平台模型交互的场景（通过 MCP 协议统一接口）。**

### 开发流程示例
```javascript
const { McpServer } = require('@modelcontextprotocol/sdk');

// 初始化 MCP Server
const server = new McpServer({
  port: 8080,
  modelRegistry: new InMemoryModelRegistry(), // 内存模型注册表（示例）
});

// 注册模型处理逻辑
server.registerModelHandler({
  async handleRequest(modelId, input) {
    // 1. 从模型注册表获取模型信息
    const modelMeta = await server.getModelMeta(modelId);
    // 2. 预处理输入数据
    const processedInput = preprocess(input, modelMeta.inputSchema);
    // 3. 调用模型推理（需自行实现模型加载逻辑）
    const result = await runModelInference(modelMeta.path, processedInput);
    // 4. 后处理输出并返回
    return postprocess(result, modelMeta.outputSchema);
  }
});

// 启动服务
server.start();
```

### 核心优势
+ **降低开发门槛：无需从零实现协议逻辑，聚焦业务逻辑开发。**
+ **标准化与扩展性平衡：遵循 MCP 协议规范的同时，支持自定义扩展。**
+ **生态兼容性：可与主流模型框架、容器化平台（如 Docker/Kubernetes）集成。**
+ **社区支持：依托 NPM 生态，便于依赖管理和版本更新。**

### 学习资源
+ **官方文档：访问 MCP 官方仓库或 NPM 包页面获取详细 API 文档。**
+ **示例代码：SDK 仓库中通常包含快速入门示例，可参考实现基础服务。**
+ **协议规范：理解 MCP 协议定义（如请求/响应格式、元数据结构）以确保服务兼容性。**

## MCP 资源平台
1. [https://modelscope.cn/mcp](https://modelscope.cn/mcp)
2. [https://mcp.so](about:blank)

# 安全审计功能实现流程
### 创建工作目录：创建一个临时的工作目录，用于保存执行期间要用到的临时文件
+ 生成唯一目录名称

### 解析工程：解析本地工程目录或远程仓库链接，得到对应的 package.json 文件内容
+ 分辨是本地工程还是远程工程
+ 具体是何种远程仓库（目前仅考虑 github）
+ 如何从远程从库链接中分析关键信息：owner、repo、tag、default_brach
+ 如何获取远程仓库中 package.json

### 生成 lock 文件：将 package.json 写入到临时工作目录，同时根据它生成 package-lock.json
+ 如何根据 package.json 生成 lock 文件：

```bash
npm install --package-lock-only --force
```

### 安全审计：进入到临时工作目录，使用 npm audit 命令进行安全审计，将审计结果规格化
+ 如何获得审计结果

```bash
npm audit --json
```

+ 审计结果包含信息
+ 规格化目标（图的 DFS 算法）
+ 如何获取当前工程的审计结果：npm 远程 api 
+ 把当前工程的审计结果汇总到结果中

### 渲染：将上一步得到的规格化审计结果进行渲染，渲染成标准化的 markdown 内容，并保存到结果文件
+ 如何将审计结果汇总为 MD 文件：使用模板引擎ejs

### 删除工作目录：将之前创建的临时工作目录删除


# MCP 套壳
+ github 代码展示：[MCP代码展示](https://github.com/Shen-zhihao/mcp-web-audit#)
+ npm 代码展示：[npm代码展示](https://www.npmjs.com/package/mcp-web-audit)

