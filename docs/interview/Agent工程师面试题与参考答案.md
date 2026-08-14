# Agent 工程师面试题与参考答案

> 适用岗位：中高级至资深 Agent 工程师、TypeScript/Node.js 工程师、AI 应用全栈工程师、
> Agent 架构师  
> 项目参照：HuiTouAgent 当前工作树（采样时间：2026-08-12）  
> 使用方式：先用 2～3 分钟口述“核心结论”，再根据追问展开工程取舍。不要逐字背诵。

## 0. 如何使用这份题库

### 难度与评价标准

- **中级**：能解释概念，写出正确代码，知道常见坑。
- **高级**：能明确状态边界、失败路径、测试方式和工程取舍。
- **资深**：能从权限、并发、恢复、成本、组织协作与生产验收设计完整闭环。
- **高频**：近年 Agent/AI 应用岗位经常出现，或很容易由项目经历引出。
- **项目题**：可直接结合 HuiTouAgent 回答，重点不是背实现，而是讲清问题、证据、决策和边界。

一个高质量回答通常遵循以下顺序：

1. 先给一句明确结论，不用术语堆砌。
2. 解释适用条件和不适用条件。
3. 说明失败模式、安全边界和可观测信号。
4. 给出项目中的具体落点。
5. 区分“代码完成”“本地验证”“联调通过”和“生产验收”。

### HuiTouAgent 架构速记

面试前建议能在白板上画出以下链路：

```text
React/Vite 前端
    │  HTTP + SSE
    ▼
TypeScript Middleware
    ├─ 认证身份 → DataScope
    ├─ AgentType/Skill/Tool Registry
    ├─ Agent Runtime + Multi-Agent Orchestration
    ├─ PolicyGuard → approval_required / allow / deny
    ├─ BusinessToolGateway → Java Backend/MCP 工具
    └─ Conversation/Approval/Event/Task 持久化与投影
                │
                ▼
Java Spring Boot 平台模块 → 广告平台 API / MySQL / Redis
```

仓库里的代表性事实：

- `AgentType` 表示角色与装配，`Skill` 表示可复用方法，`Tool` 表示一次外部动作。
- 能力包通过 `manifest.json` 声明 Agent、Skill、Tool、动作策略和派生权限。
- `DataScope` 来自认证上下文，不能信任用户或 LLM 自报的账号和平台。
- 写动作通过 `PolicyGuard` 和审批快照，不让模型直接拥有最终写权限。
- 前端按账号身份与 `conversationId` 隔离流式状态、历史、乐观消息和迟到响应。
- 当前存储设计包含 Conversation、分片历史、revision log、操作租约、事件投影与恢复逻辑。

---

## 一、TypeScript 与 Node.js 工程能力

### Q1｜[中级][高频] `any`、`unknown` 和 `never` 有什么区别？

**参考答案：**`any` 等于退出类型检查，值可以被任意读取和调用；`unknown` 表示“目前不知道”，使用前必须缩窄；`never` 表示不可能出现的值，常用于穷尽检查和永不返回的函数。外部输入、JSON、工具返回值应先视为 `unknown`，经 schema 或类型守卫验证后进入领域层。`any` 只能用于无法建模的兼容边界，并应限制传播范围。

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected variant: ${JSON.stringify(value)}`);
}
```

**追问：**为什么 `JSON.parse()` 的结果在工程语义上应该当作 `unknown`？

### Q2｜[中级][高频] 如何用可辨识联合建模 Agent 事件或状态机？

**参考答案：**给每个变体一个稳定的字面量判别字段，例如 `type` 或 `state`，再用 `switch` 缩窄。新增状态时配合 `never` 穷尽检查，使编译器迫使消费者同步处理。不要用一个包含大量可选字段的“万能对象”，否则非法组合会进入运行时。

```ts
type RunState =
  | { state: "running"; startedAt: number }
  | { state: "waiting_approval"; approvalId: string }
  | { state: "failed"; errorCode: string }
  | { state: "completed"; output: string };
```

**项目映射：**HuiTouAgent 的 `AgentEvent`、审批阶段和模型请求事件都适合这种建模；前端投影层只消费公开变体，不应依赖运行时私有对象。

### Q3｜[高级] TypeScript 是结构类型系统，会带来什么领域建模风险？

**参考答案：**只要结构兼容，语义不同的值也可能被误传，例如 `accountId` 和 `conversationId` 都是 `string`。可使用 branded type、封装构造器或领域对象阻止误用，但品牌只存在于编译期，外部输入仍需运行时校验。品牌类型不宜滥用于所有字符串，应优先保护资金、租户、资源 ID、版本号等高风险边界。品牌字段建议用 `unique symbol` 而不是 `__brand` 这类真实属性名——后者会出现在自动补全里，也可能与真实字段撞名。

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };
type AccountId = Brand<string, "AccountId">;
```

### Q4｜[中级] 泛型约束和条件类型在 Agent 工程里适合解决什么问题？

**参考答案：**泛型适合表达“输入上下文、输出 schema、事件 payload 之间的关系”，而不是炫技。约束用于保证工具上下文至少包含认证、日志或取消信号；条件类型可从工具定义推导参数与结果。若类型需要多层递归、错误信息不可读，宁可显式写接口。好类型的标准是让非法调用难以写出，同时不隐藏运行时事实。

### Q5｜[高级][高频] TypeScript 类型为什么不能替代 Zod、TypeBox 或 JSON Schema？

**参考答案：**TypeScript 类型编译后会擦除，无法验证 HTTP、LLM、MCP、数据库或文件中的真实值。运行时 schema 负责解析、默认值、拒绝未知字段和错误定位；静态类型负责开发期推导。最佳实践是从单一 schema 推导 TS 类型，或用契约测试确保 schema 与类型一致，避免维护两份事实源。

**项目映射：**能力包 manifest 先经过 JSON Schema/AJV 校验，再做文件存在性、引用完整性和全局唯一性等语义校验。结构合法不等于业务合法。

### Q6｜[中级] NodeNext/ESM 下为什么 TypeScript 相对导入常写 `.js` 后缀？

**参考答案：**Node ESM 在运行时按实际产物解析路径。源码是 `.ts`，编译后是 `.js`，因此源码中的导入应描述运行时路径。`moduleResolution: NodeNext` 会理解这种映射。省略后缀、混用 CommonJS、依赖 ts-node 的特殊解析，可能造成“类型检查通过、生产启动失败”。还要关注 `package.json` 的 `type`、条件导出和测试运行器是否与生产一致。补充一个时效点：TypeScript 5.7 起提供 `rewriteRelativeImportExtensions`，允许源码写 `.ts` 后缀并在编译时改写为 `.js`；但只要仓库没开这个开关，“源码写 `.js`”仍是唯一正确写法。

### Q7｜[高级][高频] `Promise.all`、`Promise.allSettled` 和限流并发如何选择？

**参考答案：**`Promise.all` 适用于“任一失败则整体失败”，但其他 Promise 不会自动取消；`allSettled` 适用于需要完整收集每个结果；大量工具或模型请求应使用有上限的 worker pool、semaphore 或队列。并发度不是越大越好，要同时受供应商 QPS、连接池、内存、Token 预算和下游写冲突约束。失败后还要决定取消、重试还是保留部分结果。

### Q8｜[高级] 如何设计可取消的 Agent 请求？

**参考答案：**把 `AbortSignal` 从 HTTP 入口贯穿模型、工具、检索、子 Agent 和流式输出。超时信号与用户取消信号应合并；捕获错误时区分 `aborted`、`timeout` 和真实失败；finally 中释放 listener、stream reader、server 或临时资源。仅在路由层返回 499/超时消息但后台继续执行写工具，是危险的“假取消”。

**项目映射：**HuiTouAgent 的请求测试 helper 使用有界超时并保留 `cause`；真实链路还要验证取消是否到达模型和工具执行面。

### Q9｜[高级][高频] `AsyncLocalStorage` 能解决什么问题？有什么边界？

**参考答案：**它可以沿 Promise 和异步回调传播 requestId、traceId、认证主体等请求上下文，类似其他语言的 thread-local。适合日志关联和只读上下文访问，不适合保存业务权威状态。要在请求入口用 `run()` 建立作用域，避免可变对象被跨请求复用；第三方库打断异步上下文时需用 `AsyncResource` 或显式传参。长期任务不能假设原 HTTP 上下文永远存在。

**项目映射：**HuiTouAgent 用显式 `ChatRequestContextRef` 解决长寿命 Pi session 跨请求复用的问题：工具执行时读取当前请求，而不是创建 session 时捕获陈旧值。

### Q10｜[高级] 领域错误、基础设施错误和公开错误应如何分层？

**参考答案：**领域层输出稳定错误码和可判断状态；基础设施层保留原始 `cause`、供应商 requestId 和重试性；传输层把它们映射为安全的 HTTP/SSE 错误，不泄露绝对路径、凭证或栈。日志可以记录内部诊断信息，但也需脱敏。不要把所有异常都转成 `500 unknown`，也不要把原始异常直接返回前端。

### Q11｜[高级] 为什么 Agent Runtime 适合使用依赖注入和接口隔离？

**参考答案：**模型、Registry、Policy、Store、Gateway、EventBus 都是变化速度和失败模式不同的边界。依赖接口可以在测试中替换为 fake，避免真实模型和外部平台；接口隔离能让 Director 只看 Agent 目录，而不是完整 manifest 和密钥。DI 的目标是显式依赖和可验证边界，不是为了引入庞大容器。

### Q12｜[资深] 如何设计可演进的类型化事件协议？

**参考答案：**事件应有稳定 `type`、版本或兼容策略、事件 ID、发生时间和最小必要 payload。新增可选字段通常向后兼容，删除/改义字段需要双写或版本升级。内部事件与公开事件要分层投影，敏感参数只保留摘要。消费者必须能幂等处理重复事件，并对未知事件 fail-safe，而不是崩溃整个流。

**追问：**如果前端断线重连，事件协议如何支持补偿、去重和恢复？

**参考答案：**核心是在协议层引入「稳定可定位的事件游标」和「幂等消费契约」，而不是指望 TCP/SSE 自动续流。具体做法通常是四件事：一，服务端为每条事件分配单调递增且持久化的 `cursor` / `sequenceId`，并在事件中携带稳定 `eventId`；二，前端每次收到事件后本地记录 `lastSeenCursor`，重连时通过 query、header 或首条 reconnect 事件把游标回传服务端，服务端据此补发遗漏区间；三，前端必须按 `eventId` 去重，因为补发流和实时流在边界上可能重叠，不能假设同一条事件只会送达一次；四，补偿必须设边界——缺失量过大或游标过旧时，直接拉取聚合快照或重新 fetch 历史列表，而不是逐条重放数千条事件，避免把服务端和前端状态机拖垮。此外还要区分事件的补偿语义：写确认、审批状态、持久化消息应当补偿；toast、心跳、滚动条位置这类瞬时 UI 信号应标记为不补偿，或只在窗口内缓存。对会触发副作用的写操作，补偿不等于重复提交，必须配合客户端幂等键和服务端最终对账。

**项目映射：**HuiTouAgent 的 SSE 聊天流不依赖浏览器 EventSource 的 Last-Event-ID，而是由前端维护基于 message / turn 的本地 cursor。断线后先按 cursor 请求后端对账接口补齐持久化事件，再续新流；对用户提交的 turn 则以 `clientRequestId` 为幂等键，避免重连期间重复触发同一轮推理或审批。

---

## 二、React、流式 AI UI 与前端状态

### Q13｜[中级][高频] SSE、WebSocket 和普通 HTTP 流如何选择？

**参考答案：**SSE 是服务端到客户端的文本事件流，适合 Agent 文本、工具和状态事件。但要说清自动重连的归属：重连与 `Last-Event-ID` 是浏览器 `EventSource` API 的能力，不是 SSE 线格式自带的，而 `EventSource` 只能发 GET。WebSocket 双向、延迟低，适合高频实时协作或语音；`fetch` + `ReadableStream` 更灵活，可用 POST 携带复杂请求并自行解析流，但也因此拿不到 `EventSource` 那套重连语义，断线补偿必须自己实现。选择要看方向、代理兼容、鉴权、重连、背压和事件恢复，而不是只看“实时”。HuiTouAgent 的聊天采用 POST 返回 SSE 格式流，前端自行消费，所以断线后靠历史 cursor 对账恢复，而不是指望协议自动续上。

### Q14｜[高级] 如何健壮地解析流式事件？

**参考答案：**网络 chunk 不等于一条事件，一个事件也可能跨多个 chunk。解析器应维护 buffer，按协议分隔符切帧，支持多行 `data:`、空行结束、UTF-8 跨 chunk、未知字段和末尾残片。业务层只接收 schema 验证后的规范事件。断流时要区分已完成、可重试、服务端错误和用户取消，不能把半截 JSON 当完整消息。

### Q15｜[高级][高频] React stale closure 在流式聊天中会造成什么问题？

**参考答案：**长时间运行的 reader、定时器或事件回调捕获旧的 `conversationId`、消息数组或账号身份，导致响应写入已切换页面。可使用函数式更新、`useRef` 保存最新权威值、为每次请求捕获不可变 identity token，并在提交状态前核对 token。仅把所有依赖塞进 `useEffect` 会反复重连，必须区分“建立连接的身份”与“实时读取的可变状态”。

### Q16｜[高级][项目题] 为什么聊天状态要按“账号身份 + Conversation”隔离？

**参考答案：**消息、cursor、pending question、optimistic ledger、上传和迟到响应的所有权不仅属于组件，还属于具体业务身份与 Conversation。如果只按组件实例保存，账号切换或 URL 恢复会串数据；只按 `conversationId` 又可能跨租户碰撞。可生成稳定 `identityKey`，切换时 remount 或显式清空，并让每个异步结果在落状态前验证 owner。

**项目映射：**`AgentChatPanel` 使用账号六维与 `conversationId` 形成状态键，并配合 identity epoch、AbortController 和 owner 检查隔离响应。

### Q17｜[高级] 如何处理“旧请求晚于新请求返回”的竞态？

**参考答案：**常用三层防线：新请求发起时 abort 旧请求；为请求分配递增序号，只接受最新序号；结果附带 identity key，提交前验证仍属于当前页面。Abort 不能单独保证安全，因为服务端可能已完成且回调仍进入；序号也不能替代业务幂等。对写请求还需要服务端幂等键和版本校验。

### Q18｜[高级][高频] 乐观消息如何与服务端权威时间线对账？

**参考答案：**客户端生成 `clientRequestId`/turnId 形成临时 ledger；服务端持久化后返回稳定记录 ID、版本和规范正文；前端按稳定关联键替换或合并，而不是按文本相等去重。超时不能立刻判定失败，因为服务端可能已提交。刷新历史后应以权威记录为准，同时保留尚未确认的本地项，并为重复提交设计服务端幂等。

### Q19｜[中级] 流式文字“平滑输出”为什么不能改变协议语义？

**参考答案：**平滑器只负责视觉节奏，把已收到的文本分批展示；真实完成、工具调用、错误和审批事件仍由协议驱动。必须在切换 Conversation、取消和组件卸载时清空队列，最终 flush 不能丢字。不要为了打字机效果把事件顺序重排，也不要用 UI 已显示完成推断服务端已持久化。

### Q20｜[高级] 消息列表为什么需要稳定 ID，而不能用数组下标？

**参考答案：**历史向上分页、SSE 实时追加、审批状态更新和乐观替换都会改变数组位置。下标 key 会导致 React 复用错误节点、卡片状态串位。稳定 ID 应来自权威记录身份；不同来源可加命名空间，如 `approval:<id>`。若旧记录缺 ID，需要可解释的兼容规则，并避免把不同物理记录错误折叠。

### Q21｜[高级] Cursor 分页相比 offset 分页为什么更适合对话时间线？

**参考答案：**时间线持续插入，offset 会因新数据导致重复或漏读；cursor 绑定排序键和稳定记录 ID，可以描述“从这条之前继续”。排序必须全序，例如 `(occurredAt, sourceRecordId)`，并规定 cursor 对删除、合并、投影重建的语义。客户端合并时仍要去重，服务端要限制 page size 并返回是否不完整。

### Q22｜[高级][安全] 如何安全渲染模型生成的 Markdown？

**参考答案：**默认把模型输出视为不可信内容。使用受控 Markdown parser 和 HTML sanitizer，关闭原始 HTML 或严格白名单；链接限制协议并加 `rel="noopener noreferrer"`；代码块不直接执行；图片和 iframe 需单独策略。React 的转义只能保护普通文本，使用 `dangerouslySetInnerHTML` 后必须自行承担清洗责任。还要防止模型输出伪造审批按钮或系统消息样式。

### Q23｜[高级] Agent UI 的错误状态应如何设计？

**参考答案：**区分请求未发出、连接中断、模型失败、工具失败、等待审批、用户取消、部分结果和历史不可用。错误要附带可执行动作，如重连、重试只读步骤、查看审批、复制诊断 ID；不要把所有错误变成红色 toast。已产生的流式内容一般应保留并标注“不完整”，避免重试时用户失去证据。

### Q24｜[资深] 如何测试一个流式 Agent 前端？

**参考答案：**纯函数测试覆盖帧解析、事件归一、去重、分页和乐观对账；组件测试覆盖状态切换、取消和卡片交互；浏览器测试用可控 SSE server 注入拆包、乱序、断流、重复事件、慢响应和账号切换。最后在真实视口、真实网关和至少一个真实模型上做 smoke。类型检查和构建通过不能证明流式竞态或视觉行为正确。

---

## 三、LLM、Prompt 与上下文工程

### Q25｜[中级][高频] Agent 与普通 LLM Chat 的本质差别是什么？

**参考答案：**普通 Chat 主要完成“输入到文本输出”；Agent 把模型放进一个受控循环，使它能观察状态、选择工具、执行动作、读取结果并决定下一步。真正的工程复杂度来自循环终止、权限、状态、失败恢复和评测，而不是多写一段 system prompt。只有当任务需要动态决策和外部动作时才值得使用 Agent。

### Q26｜[中级] Temperature 能解决事实准确性问题吗？

**参考答案：**不能。降低 temperature 通常减少采样差异，但不会补充缺失知识，也不能消除错误推理。事实准确性应依靠检索、工具、结构校验、业务规则和评测；高风险结论需要引用或权威数据验证。不同模型对 temperature 的支持和语义也可能不同，推理模型通常还有独立 reasoning 参数。

### Q27｜[高级][高频] Structured Output 与 Tool Calling 有什么区别？

**参考答案：**Structured Output 约束模型最终输出结构，适合抽取、分类和生成可验证对象；Tool Calling 表示模型请求宿主执行一个外部函数，宿主仍决定是否执行。两者都需要 schema，但工具调用还涉及权限、幂等、超时和副作用。不要把模型生成了合法工具参数误认为它获得了业务授权。

### Q28｜[高级] 上下文窗口大，为什么仍要做 Context Engineering？

**参考答案：**窗口越大不代表有效注意力、成本和延迟无限。无关历史会稀释指令，工具结果可能包含注入文本，重复 schema 消耗 Token，长期会话还会超过窗口。上下文工程需要选择信息、标记来源、分层摘要、按需加载 Skill/Tool schema，并保留可验证的关键状态。目标不是“塞满”，而是让当前决策只看到必要且可信的信息。

### Q29｜[高级] System Prompt、开发者规则、用户输入和工具结果的信任级别应如何理解？

**参考答案：**消息优先级是模型行为约束，不等于应用安全边界。工具结果、网页、文档和用户输入都可能携带指令性文本，应标记为数据并由宿主做权限决策。即使 system prompt 写着“不要泄密”，仍需在工具 allowlist、scope、凭证注入和输出脱敏层阻断。Prompt 是策略提示，代码与权限系统才是执法面。

### Q30｜[中级] Few-shot 示例什么时候比规则说明更有效？

**参考答案：**当输出风格、边界样例或分类口径很难只靠抽象语言说清时，少量高质量正反例有效。示例应覆盖决策边界而不是堆同类样本，并定期纳入 eval 防止改 prompt 后回归。稳定业务规则仍应落在代码/schema 中，不能靠模型从示例“猜”出权限。

### Q31｜[高级] 如何设计长会话压缩？

**参考答案：**先区分不可丢状态与可压缩文本：审批终态、工具事实、用户约束、资源 ID 应结构化保存；闲聊和推理过程可摘要。摘要要带来源范围、版本和不确定性，不能覆盖原始历史；触发条件可由 Token 预算和回合数共同决定。压缩后用回归集检查任务约束、指代和待办是否仍可恢复。

### Q32｜[高级] Prompt Caching 能优化什么？有哪些误区？

**参考答案：**它适合复用稳定前缀，如系统指令、工具 schema 和长参考资料，降低重复输入成本与延迟。但收益不是白拿的：写入缓存比普通输入更贵（典型为 5 分钟 TTL 约 1.25 倍、1 小时约 2 倍），命中读取才降到约一折，因此存在一个最低复用次数才回本——短 TTL 大致两次请求、长 TTL 大致三次，复用不足时加缓存反而更贵。还要注意存在最小可缓存前缀长度，且跨模型代次并不单调（新模型可能更低、旧模型反而更高），前缀低于阈值不会报错，只是静默不缓存。要把稳定内容放前面、动态内容放后面，并关注供应商缓存粒度、TTL 和隐私边界。缓存不会降低输出 Token，也不能保证模型行为一致；高频变动的时间、用户信息混进前缀会破坏命中率。命中与否要靠响应里的缓存读取 Token 指标验证，不能靠假设。

### Q33｜[高级][高频] 如何拆解 Agent 延迟？

**参考答案：**至少记录排队、上下文构建、模型首动作、首 Token、完整响应、每次工具调用、子 Agent 等待、持久化和前端平滑时间。用户感知延迟常由首个有意义事件决定，不只是总耗时。优化顺序通常是减少无用轮次、并行独立 I/O、缩短上下文、选择合适模型、缓存稳定数据，再考虑更激进的推测执行。

### Q34｜[资深] Model Fallback 应如何设计？

**参考答案：**先按错误分类：限流、超时和临时 5xx 可有限重试或切同能力模型；认证、schema、不支持工具等配置错误应立即失败；内容安全拒绝不能静默绕过。Fallback 必须有总时间和总 Token 预算，记录每次 attempt，并明确不同模型能力差异。长达数十轮的盲目 fallback 会放大延迟、成本和副作用。

### Q35｜[高级] 哪些步骤应该交给确定性代码，而不是 LLM？

**参考答案：**权限判断、金额计算、ID 生成、状态转移、幂等、schema 校验、排序分页和资源归属都应由代码承担。LLM 适合处理模糊意图、非结构化理解、候选生成和解释。一个实用原则是：若错误会越权、扣款、丢数据或无法可靠回放，就不能只靠 prompt。

### Q36｜[高级] 如何处理模型输出被截断或 stop reason 异常？

**参考答案：**记录供应商 stop reason、输出 Token、工具调用是否闭合和结构解析结果。文本截断可提示继续或自动续写，但结构化对象和工具参数不应猜测补全；应重试或失败关闭。续写必须携带已完成边界，避免重复执行工具。流式传输断开与模型主动停止也要分别建模。

---

## 四、Agent、Tool、Skill、MCP 与能力包架构

### Q37｜[中级][高频] Workflow 和 Agent 应该如何区分？

**参考答案：**Workflow 的控制流由代码预先定义，节点和分支可预测；Agent 由模型根据观察动态决定下一步。固定审批、ETL、定时报表通常优先 Workflow，开放式调研或复杂诊断才需要 Agent。生产系统常采用混合方式：模型负责理解与选择，确定性工作流负责关键状态和写动作。把所有流程都 Agent 化会降低可测试性和可恢复性。

### Q38｜[高级] 一个最小可用 Agent Loop 包含哪些状态？

**参考答案：**至少包含输入、当前消息/工作状态、模型调用、工具请求、工具结果、终止条件和错误状态。还要有最大轮数、Token/时间预算、取消信号以及对重复工具调用的抑制。每一轮应可观测，并明确“模型要求调用”与“宿主实际执行”是两个事件。终止不能只依赖模型说“完成了”。

### Q39｜[高级][项目题] 如何解释 AgentType、Skill 和 Tool 的职责？

**参考答案：**Tool 是一次可执行机制，例如读取报表；Skill 是可复用的做事方法，例如分析投放异常；AgentType 是角色及其装配，包括身份 prompt、Skill、工具权限、可派生子 Agent 和运行策略。Skill 依赖 Tool，AgentType 装配 Skill；“会什么”和“能派生谁”是两条正交轴。这样能防止角色 prompt 膨胀，也让能力复用和权限审计更清楚。

**项目映射：**HuiTouAgent 以能力包 manifest 为入口事实，capability Skill 按需读取正文，procedure Skill 形成确定性复合工具。

### Q40｜[高级][高频] 什么是 Progressive Disclosure？

**参考答案：**只把经常需要且体积小的目录信息常驻上下文，详细 Skill 正文、工具 schema 和大结果在需要时再加载。收益是减少 Token、降低无关信息干扰和工具选择错误；代价是增加一次发现/读取步骤，需要稳定目录和缓存。渐进披露只优化上下文，不能替代权限控制，因为模型仍可能请求未授权资源。

**项目映射：**HuiTouAgent 首轮注入 persona、Skill description 和少量 meta-tool；Agent 通过 `Read`、`describe_tools`、`execute_tool` 按需获取正文、目录和结果。

### Q41｜[高级] 如何设计高质量 Tool Schema？

**参考答案：**名称表达单一动作，description 说明何时使用及何时不要使用；参数使用明确枚举、单位、范围和必填关系，避免一个 `options: object` 承载一切。读取和写入工具分开，默认值由宿主确定，敏感 scope 不暴露给模型。返回值应紧凑、稳定、有错误码和来源信息。Schema 越模糊，模型越容易选错工具或构造不安全参数。

### Q42｜[高级][高频] MCP 的 Tools、Resources 和 Prompts 有什么差别？

**参考答案：**Tools 表示可调用操作，可能有副作用；Resources 表示可读取、可寻址的数据；Prompts 表示可复用的提示模板或交互入口。这三个只是最常被问到的原语，协议还有 sampling、roots、elicitation 等，别答成 MCP 只有三样东西。MCP 标准化客户端与服务端之间的发现和调用协议，但不自动提供业务授权、租户隔离或工具安全。应用仍需在服务端校验身份、参数、资源归属和动作策略。协议本身也在演进：2026-07-28 规范把核心改成无状态请求/响应，请求可以落在普通轮询负载均衡后的任意实例——这与第八章的多 Writer、亲和路由是同一类问题，答题时可以顺势带出来。

### Q43｜[资深] 引入远程 MCP Server 时要建立哪些信任边界？

**参考答案：**确认 server 来源、代码/镜像供应链、传输认证、OAuth scope、租户映射、工具列表变更、返回内容注入和日志数据边界。工具描述本身也可能恶意影响模型，不能把远端声明直接当高信任 system 指令。对写工具应建立本地 allowlist、审批和速率限制；对返回值做体积、类型和敏感信息过滤；版本升级需重新评估能力面。

### Q44｜[高级][高频] A2A 和 MCP 是替代关系吗？

**参考答案：**不是。MCP 主要连接 Agent/模型与工具、数据和上下文；A2A 面向独立 Agent 系统之间的发现、任务、消息和产物交换。一个远程 Agent 内部仍可能使用 MCP 调工具。面试时应进一步讨论身份传递、任务幂等、Agent Card/能力发现、长任务状态、跨组织信任和协议版本，而不是只背缩写。

### Q45｜[资深][项目题] 为什么能力包需要 manifest 和 schema？

**参考答案：**manifest 把角色、Skill、Tool、动作策略、平台范围、并发和派生边界从框架代码中声明出来，便于审核、版本化和远程分发。Schema 解决结构合法性，Loader 还要验证 prompt/Skill 文件存在、引用闭合、ID 唯一和动作覆盖。运行时只读取加载后的裁剪视图，避免业务包获得框架内部权限。

**追问：**签名、可信来源、灰度与撤回应该由 Loader 还是上游 package source 负责？

### Q46｜[高级][高频] 为什么 PolicyGuard 必须是确定性代码并 fail-closed？

**参考答案：**授权结论不能依赖概率模型。Guard 应从已认证 scope、Agent allowlist、工具 ID 和动作策略推导；任一 Agent 不存在、平台不符、工具未声明、动作缺失或参数归属异常都拒绝。`approval_required` 是延迟执行，不是 allow。审计记录要包含主体、资源、策略版本和决定，但不得暴露凭证。

**项目映射：**HuiTouAgent 的三段式 tool ID 将平台、资源、动作绑定，`DefaultPolicyGuard` 交叉校验 scope 平台、allowlist 和 action policy。

### Q47｜[高级] “Agent as Tool”和“Handoff”有什么差别？

**参考答案：**Agent as Tool 通常由当前 Agent 保持控制权，把子 Agent 当一次函数调用并汇总结果；Handoff 把后续对话控制权交给另一个 Agent。前者适合并行专家分析和集中汇总，后者适合客服分流或长期角色切换。设计时要明确上下文如何裁剪、用户看到谁、工具权限是否变化、返回路径和取消如何传播。

### Q48｜[高级] 什么时候应该把 Skill 做成确定性 Procedure？

**参考答案：**步骤稳定、输入输出清晰、需要逐步审计且不需要模型临场选择时，Procedure 比自然语言 Skill 更可靠。例如“读取配置 → 校验 → 生成草稿”可编码为复合工具。若中间步骤可能触发审批，需决定 Procedure 是暂停恢复还是 fail-fast；不能让复合工具绕过每一步的 PolicyGuard。

### Q49｜[资深] Agent 沙箱应隔离哪些能力？

**参考答案：**至少隔离文件系统、网络、进程、环境变量、CPU/内存/时间和宿主凭证；工作区最好使用临时快照，输出经显式导出。命令 allowlist 不是完整沙箱，因为解释器和构建工具可间接执行任意代码。还要处理符号链接逃逸、压缩炸弹、依赖供应链和终端输出泄密。沙箱限制执行影响，不能替代工具权限和人工审批。

### Q50｜[高级][项目题] Agent 配置热更新怎样做到不中断旧会话？

**参考答案：**构建一套完整候选 generation，校验成功后原子替换“当前代”；已有会话固定使用创建时的 generation，新会话使用新代。失败时保留上一代，不退回未验证配置；并发 webhook、轮询和手动刷新应 single-flight。可观测信息至少包含已观察版本、已应用版本、generation ID、最后成功和错误码。

### Q51｜[高级] 如何给 Tool/Skill/Agent 做版本兼容？

**参考答案：**先区分描述更新、向后兼容字段新增和破坏性语义变化。工具参数可新增可选字段，删除或改义应发布新工具 ID/版本；长任务和审批快照需记录执行时 schema/包版本，恢复时不能直接套最新解释。Skill prompt 的变化也应进入 eval 和版本记录，因为它可能改变工具选择。

### Q52｜[资深][高频] 什么时候不应该上 Multi-Agent？

**参考答案：**单 Agent 加少量工具已能稳定完成、任务强顺序且共享状态很多、延迟/成本敏感或无法评测子任务时，不应拆 Multi-Agent。多 Agent 会增加路由错误、上下文丢失、重复工具调用和汇总冲突。先用单 Agent/Workflow 建立基线，只有专业权限隔离、真正并行或上下文分治带来可测收益时再拆。

---

## 五、Multi-Agent 编排与上下文传播

### Q53｜[高级][高频] Director/Router 应该知道多少业务细节？

**参考答案：**它应知道子 Agent 的能力目录、成本、边界和可用状态，足以选择和编排，但不应持有每个业务 Skill 全文或所有业务工具。否则 Router 会变成超级 Agent，权限膨胀且 prompt 难维护。复杂业务工作流应下沉到专业 Agent/Skill，Director 负责拆解、派发、等待、汇总和异常处理。

### Q54｜[高级][项目题] 子 Agent 为什么默认继承 summary，而不是完整历史？

**参考答案：**完整历史成本高、噪声大，还可能把与子任务无关的敏感数据和注入内容扩散。Summary 应包含目标、已确认事实、约束、输出契约和来源引用，并设字符/Token 预算。需要最近 N 轮或完整上下文时必须有业务理由。摘要不是权威数据，关键 ID 和审批状态应通过结构化字段传递。

### Q55｜[资深][安全] 父 Agent 向子 Agent 传播 DataScope 时如何防越权？

**参考答案：**父 scope 来自认证会话，子 Agent 请求的 scope 只能在父范围内收窄；校验由运行时代码完成，不能相信模型参数。子 Agent 的每次工具调用仍要重新经过 PolicyGuard 和网关注入。若 scope 目前没有层级语义，所谓“收窄”应先实现为全等，避免自创 account 层级导致越权。

### Q56｜[高级] Multi-Agent 需要哪些预算？

**参考答案：**至少限制派生深度、同时活跃子 Agent 数、单类型并发、总轮数、总模型调用、总 Token、墙钟时间和工具调用数。预算应沿父子树扣减而不是每个 Agent 重置，否则递归派生可放大成本。预算耗尽要产生可解释终态，并允许父 Agent 用已完成的部分结果降级汇总。

### Q57｜[高级] Agent 间 mailbox 需要什么语义？

**参考答案：**要定义消息 ID、发送者/接收者、类型、是否触发新一轮、投递时序、重复处理和关闭后的行为。进程内队列可做 MVP，但跨进程需要持久化、消费确认和恢复。不要声称“恰好一次”；通常采用至少一次投递加幂等消费者。用户可见消息还需经过安全投影和来源标注。

### Q58｜[高级][高频] 哪些子任务适合并行？

**参考答案：**无共享可变状态、输入已固定、输出能独立验证的任务适合并行，例如不同数据源检索、多个方案评估。必须先拿到同一上游结果、会写同一资源或彼此需要动态反馈的任务不适合盲目并行。并行前要定义汇总策略、超时和部分失败语义，不能因一个慢子 Agent 无限阻塞全部结果。

### Q59｜[资深] 多个子 Agent 结论冲突时如何汇总？

**参考答案：**要求结果包含证据、来源、时间和置信度，而不只是结论。对事实冲突优先重新查询权威源；对策略分歧显式展示假设和 trade-off；高风险决定交给确定性规则或人。汇总 Agent 不应“投票即真”，也不能把冲突静默融合成看似一致的答案。

### Q60｜[资深] 如何避免 Agent 递归、互相等待和任务风暴？

**参考答案：**运行时维护父子图和最大深度，禁止形成祖先环；wait 要有超时并能返回部分状态；同一任务指纹可去重；每个 Agent 有 active child 上限。关闭/取消沿树传播，父 Agent 不能等待一个已依赖父结果的子 Agent。监控 spawn rate、活跃树宽度和无进展轮数。

### Q61｜[高级] 为什么 Agent 输出需要 provenance？

**参考答案：**需要知道内容来自用户、模型、工具、检索、子 Agent 还是系统恢复，才能判断信任、权限和是否可回放。Provenance 应包含 source ID、Agent/工具版本、发生时间和关联 trace；不要把它只写进自然语言。审批回灌尤其要绑定原 Conversation 和物理 session，零命中或冲突时应拒绝猜测。

### Q62｜[资深][高频] 如何接入第三方远程 Agent？

**参考答案：**先做能力发现和版本协商，再建立服务身份、用户委托、租户映射和最小 scope。任务请求需要幂等 ID、超时、状态查询、取消和产物校验；远端结果一律视为不可信输入。跨组织 Agent 不能继承本地全部上下文或凭证，高风险动作仍由本地策略和审批执法。

---

## 六、RAG、Memory、Conversation 与状态管理

### Q63｜[中级][高频] 短期记忆、长期记忆和知识库有什么区别？

**参考答案：**短期记忆是当前会话/运行状态，例如消息和 checkpoint；长期记忆是跨会话保留的用户偏好、事实或经验；知识库是可检索的外部权威内容。三者的 scope、生命周期和写入权限不同。把所有聊天记录向量化并称为“记忆”，会带来污染、隐私和过期问题。

### Q64｜[中级][高频] 一个完整 RAG 链路有哪些阶段？

**参考答案：**数据采集与解析、切分、元数据与权限标注、embedding/索引、查询改写、召回、过滤/重排、上下文组装、生成与引用、离线/在线评测。生产问题经常不在向量模型，而在脏文档、错误 scope、chunk 丢标题、索引延迟或引用无法回到原文。

### Q65｜[高级] 为什么经常使用混合检索和 reranker？

**参考答案：**向量检索擅长语义相似，但精确 ID、专有名词和数字可能召回差；BM25/关键词检索擅长字面匹配。混合检索先扩大候选，再用 reranker 结合查询判断相关性，通常比单一路径稳。要在真实查询集上评估 recall@k、MRR、nDCG、延迟和成本，不能只凭几个 demo。

### Q66｜[高级] Chunk 应如何设计？

**参考答案：**按语义结构优先于固定字符数，保留标题层级、来源、时间和权限元数据。chunk 太小会丢上下文，太大会稀释相关性并浪费 Token。代码、表格、FAQ 和长报告需要不同切分策略。重叠不是越多越好，会制造重复证据；最终用目标问答集调节大小和召回数量。

### Q67｜[高级] 如何评测 RAG，而不是只评最终答案？

**参考答案：**分层评测：索引覆盖率；检索是否命中支持答案的文档；重排是否把证据排前；生成是否忠于证据、引用正确且回答完整。无答案查询也要评估是否拒答。错误归因应能区分 retrieval miss、context selection error 和 generation error，否则团队只会不断改 prompt。

### Q68｜[资深][安全] 长期记忆写入为什么比读取更危险？

**参考答案：**错误或恶意内容一旦写入，会跨会话持续影响模型，形成 memory poisoning。写入应限定来源、用户确认、字段 schema、scope、TTL、去重和版本；高影响记忆保留历史和可撤销能力。模型可提出候选记忆，但不应无条件决定哪些事实永久保存。

**项目映射：**HuiTouAgent 区分账号级共享记忆、写入契约和确认回执，且来源信息不应混入模型可伪造字段。

### Q69｜[高级][项目题] Conversation、Session 和 Run 为什么不能混为一谈？

**参考答案：**Conversation 是用户可见的长期对话容器；Session 是模型运行时上下文，可能因模型、generation 或恢复而更换；Run/Turn 是一次具体执行。一个 Conversation 可包含多个物理 Session，一个 Session 也不应在身份切换后复用。分层后才能正确处理历史、重试、标题、审批来源和模型热更新。

### Q70｜[资深] 为什么事件日志、当前快照和投影视图要分开？

**参考答案：**事件日志保留不可变事实和审计，快照加速读取，投影为具体查询或 UI 优化。快照和投影可以重建，不能反过来成为唯一权威；写入时要定义事件与快照的发布顺序及崩溃恢复。若只有一份经常读改写的 JSON，多个 writer 很容易覆盖彼此变更，也难以解释历史。

### Q71｜[高级] 长任务的 Checkpoint 应保存什么？

**参考答案：**保存可恢复的确定性状态：当前步骤、已提交的外部动作、工具结果引用、版本、幂等键、等待的人工输入和下一步条件。不要只序列化整个进程内对象，也不要保存无法验证的模型“思维过程”。恢复代码应能识别 schema 版本，并确保已完成副作用不会重复。Checkpoint 的频率需要在恢复粒度和写放大之间权衡。

### Q72｜[资深][项目题] 为什么物理记录需要 `sourceRecordId` 一类身份？

**参考答案：**同一逻辑消息可能来自 legacy 文件、分片、投影或实时事件；只有稳定物理身份才能正确去重、排序、建立 cursor 和验证快照来源。若用内容 hash，两个内容相同的合法记录可能被折叠；若用数组位置，重建后身份会漂移。身份协议要版本化，并让旧数据有明确兼容规则。

### Q73｜[资深] 软删除和 Tombstone 能解决什么，不能解决什么？

**参考答案：**软删除保留审计和恢复能力；tombstone 可让读取端压制迟到或陈旧列表。但它不能自动解决多个 writer 覆盖权威元数据，也不能证明所有副本已观察到删除。需要定义删除 revision、写入门禁、垃圾回收安全水位和恢复策略。前端 tombstone 只是用户可见防线，不是分布式一致性方案。

### Q74｜[高级][安全] 记忆和对话数据应如何做隐私治理？

**参考答案：**采集最小化，按 tenant/user/account 明确 scope，定义保留期、删除、导出和访问审计。Embedding 也可能泄露语义信息，不能因不可读就视为匿名。敏感字段在进入模型、日志和向量库前分别做策略判断；备份和投影同样必须响应删除。跨境、行业合规和用户授权需由业务法务规则落地。

---

## 七、安全、审批与多租户隔离

### Q75｜[中级][高频] 什么是 Prompt Injection？

**参考答案：**攻击者通过用户输入或外部内容诱导模型忽略原指令、泄露信息或调用危险工具。间接注入可能来自网页、邮件、文档和工具返回。仅在 prompt 中写“忽略恶意指令”不可靠；应把外部内容标记为不可信数据，减少可用工具，并用确定性授权、输出过滤和人工审批限制影响。

### Q76｜[高级][高频] 什么是 Excessive Agency？

**参考答案：**系统给模型过多功能、权限或自主执行权，使误判或注入能产生真实损害。治理分三层：减少功能，例如只提供读工具；减少权限，例如 OAuth 只读 scope；减少自主性，例如发邮件、调预算前人工确认。再配合速率限制、金额上限、沙箱和审计。核心不是让模型更听话，而是缩小爆炸半径。

### Q77｜[高级] 最小权限如何落到 Agent 工具层？

**参考答案：**每个 AgentType 有独立工具 allowlist；读写工具分离；未知工具和未知 action 默认拒绝；凭证按当前认证 scope 在网关注入；子 Agent 只能继承更窄权限。权限应基于服务端身份和资源归属，不基于模型声称的角色。定期扫描声明但从未使用的权限，并对能力包升级做差异审查。

### Q78｜[资深][项目题] 高风险写动作的审批快照应包含什么？

**参考答案：**至少包含发起主体、DataScope、工具 ID、规范化参数、业务摘要、创建时间、策略/包版本、来源 Conversation、幂等指纹和 revision。批准时重新验证授权和资源状态，执行使用快照而不是让模型重新生成参数。若参数或目标已变化，应作废或重新审批，不能拿旧批准覆盖新事实。

### Q79｜[资深] “批准一次、执行一次”为什么仍会重复执行？

**参考答案：**批准与执行之间存在崩溃窗口，HTTP 超时会让调用方重试，多 Pod 可能同时消费同一审批。需要确定性 operation ID、原子 acquire、attempt/fencing、执行终态和网关幂等。仅在内存中设置 `executing=true` 或写一个锁文件不足以覆盖进程崩溃和跨节点竞争。

### Q80｜[高级][项目题] 多租户系统为什么不能只用 `accountId` 做隔离键？

**参考答案：**不同租户、workspace、产品或平台可能出现相同账号 ID，且同账号数据有账号级共享与用户级审批两种口径。应从认证会话推导完整 DataScope，并为不同资源明确包含哪些维度。HuiTouAgent 的账号状态键与审批去重键刻意不同：前者可不含 userId，后者需含 userId，避免把不同用户审批折叠。

### Q81｜[高级] 凭证为什么应在 Gateway 注入？

**参考答案：**模型只需要表达业务意图，不需要看到 token、cookie 或 OAuth code。Gateway 根据认证 scope 获取凭证并覆盖模型传入的同名字段，避免跨账号调用；日志和事件只记录凭证引用或脱敏标识。凭证轮换、刷新和供应商差异也由网关收口，减少 Skill 与业务代码泄露风险。

### Q82｜[高级] Agent 输出与错误如何脱敏？

**参考答案：**建立公开事件/错误 schema，只允许稳定错误码、用户可理解信息和诊断 ID；绝对路径、堆栈、原始工具参数、Authorization 头和供应商响应需过滤。脱敏应在服务端投影边界完成，不能依赖前端隐藏。日志同样要限制，因为日志平台往往比业务数据访问面更广。

### Q83｜[资深] 联网工具如何防 SSRF 和数据外带？

**参考答案：**解析 URL 后限制协议、域名/IP 段和重定向链，拒绝 loopback、link-local、云 metadata 和内网地址；DNS 解析后再次校验，防 rebinding。限制响应体大小、类型、时间和下载次数。出站网络最好走代理 allowlist；返回内容视为不可信。工具权限还需限制它能携带哪些内部数据到外部请求。

### Q84｜[资深] 一条可审计 Agent 链路需要记录哪些事实？

**参考答案：**主体与租户、请求/trace ID、Agent/Skill/模型版本、输入来源摘要、工具决策、审批、规范化参数摘要、外部 requestId、状态迁移、Token/延迟和最终结果。审计记录应追加式、带时间和关联 ID，并有防篡改与保留策略。不要记录完整敏感 prompt 作为默认方案；可用 hash、采样或受限密文存储。

---

## 八、并发、幂等与分布式状态

### Q85｜[高级][高频] 为什么分布式系统通常不承诺 Exactly Once？

**参考答案：**网络超时后调用方不知道服务端是否完成，消息可能重复投递，消费者可能处理后在确认前崩溃。工程上通常实现 at-least-once + 幂等，或通过事务性日志把效果变成可重放的确定状态。“恰好一次”往往只在限定边界内成立，面试时要追问它覆盖消息、数据库还是外部副作用。

### Q86｜[高级] 幂等键应该如何生成和保存？

**参考答案：**键要绑定业务意图和身份边界，例如用户、scope、动作、规范化参数及一次业务操作 ID。随机 requestId 只能去重同一客户端重试，不能识别语义重复；纯参数 hash 又可能错误合并两次合法操作。服务端持久化键、状态和结果，定义 TTL 与冲突语义，并让并发创建走唯一约束或 CAS。

### Q87｜[高级][高频] 乐观锁、CAS 和数据库事务有什么区别？

**参考答案：**三者不在同一层，别并列成三个平行选项。CAS 是“等于预期才替换”的原子原语；乐观锁是建立在它之上的并发控制模式，用 version 字段充当预期值——`UPDATE ... WHERE version = ?` 本身就是一次行级 CAS，而 version 单调递增正是它规避 ABA 的手段；事务管的是一组操作的原子性与隔离范围，具体能力取决于存储。先读文件再 rename 不是 CAS，因为两个 writer 都可能基于同一旧值发布。选择时要明确原子点、冲突检测和重试语义。

### Q88｜[资深][高频] Fencing Token 解决什么问题？

**参考答案：**租约过期的旧 worker 可能暂停后恢复，继续向下游写入；仅检查自己持有租约无法阻止它。每次 ownership/lease 获取一个单调递增 token，下游只接受不小于已见 token 的写入，旧 worker 即使复活也被拒绝。Fencing 必须由真正执行写入的权威存储验证，放在进程内没有意义。

### Q89｜[资深] Lease 的关键设计点有哪些？

**参考答案：**唯一资源键、owner、attempt/epoch、获得时间、过期、续租、终态和抢占规则。时钟漂移使基于墙钟的过期判断危险，应尽量依赖权威存储和安全余量。获取与业务状态迁移之间的崩溃窗口必须对账；恢复者要能判断旧执行已成功、失败还是未知，而不是一律重试。

### Q90｜[资深][项目题] 单 Writer 和多 Writer 应如何取舍？

**参考答案：**单 writer 简化顺序、一致性和文件存储，但吞吐、可用性和部署弹性受限；多 writer 需要按业务键分区、ownership、handoff、fencing、全局状态拆分和混合版本协议。迁移不能只把 `events.jsonl` 分目录，还要盘点审批、任务、Token、内存索引和恢复作业。流量路由必须与数据 ownership 一致。

### Q91｜[资深] 原子 rename 能保证什么，不能保证什么？

**参考答案：**在支持的同一文件系统中，rename 可让目标路径从旧文件原子切换到新文件，但不自动保证数据已持久化，需要文件和目录 fsync；它也不提供跨多个文件事务、版本比较或 writer fencing。两个 writer 都 rename 时**一定**是最后写者赢，不是“通常”——rename 压根没有比较语义，会直接覆盖对方基于旧快照的更新。需要“目标已存在就失败”的排他语义得另找原语：Linux 的 `renameat2(RENAME_NOREPLACE)`、macOS 的 `renamex_np(RENAME_EXCL)`，或经典可移植做法 `link()` 再 `unlink()`——最后这个正是 NFS 环境下实现锁的传统手法。

### Q92｜[资深][项目题] NFS 上做状态存储要关注什么？

**参考答案：**关注协议版本、客户端缓存、close-to-open 一致性、锁语义、rename/link/O_EXCL 在真实挂载上的表现、inode 容量和故障切换。单机测试不能替代两 Pod/两客户端探针。即使独占创建探针成功，也只证明该原语在该环境下的性质，不能自动推导完整业务 CAS、租约或跨文件事务成立。

### Q93｜[高级] 分布式事件如何排序？

**参考答案：**单进程可用递增序号，跨进程没有天然全序。可用 `(instanceId, bootId, localSeq)` 保证唯一和单 boot 有序，再按业务资源 version 或逻辑时钟合并。不要用服务器时间声称因果顺序。UI 可按 occurredAt 展示，但业务冲突应依据权威 revision/fencing，而不是时间戳。

### Q94｜[高级][高频] 重试如何避免雪崩和副作用放大？

**参考答案：**仅重试明确的瞬时错误，采用指数退避加 jitter、最大次数和总 deadline；尊重 `Retry-After`；写操作需幂等键。多层 SDK、Gateway、Agent 同时重试会乘法放大，应明确唯一重试层。熔断和限流用于保护下游，重试预算要进入 trace 和指标。

### Q95｜[资深] Transactional Outbox 解决什么问题？

**参考答案：**业务数据库更新与发送消息无法天然原子时，把业务变更和 outbox 记录写在同一数据库事务；后台可靠发布，消费者幂等处理。它避免“数据库成功、事件丢失”，但可能重复发布，也不保证外部消费者立即处理。需要唯一事件 ID、发布状态、重试、归档和积压监控。

### Q96｜[资深][项目题] 如何设计可验证的崩溃恢复？

**参考答案：**先列出每个持久化步骤之间可被 kill 的窗口，再为每个窗口定义盘上可观察状态和恢复动作。通过真实多进程 worker、故障注入点和重启测试复现，而不是只 mock 方法抛错。恢复必须幂等，遇到无法证明的损坏应 fail-closed 并提供人工修复工具。成功日志不能替代回读和第二次启动幂等验证。

---

## 九、评测、可观测性、性能与成本

### Q97｜[中级][高频] Agent Evaluation 应分哪些层？

**参考答案：**至少分模型输出、单工具选择、单 Agent 轨迹、Workflow/多 Agent 任务、端到端业务结果和安全对抗。离线 eval 用稳定数据集阻止回归；在线监控发现真实分布漂移；人工评审处理高价值和难自动判断样本。只看最终答案会掩盖越权工具、重复执行和碰巧答对的错误轨迹。

### Q98｜[高级] 如何构建高质量 Eval Dataset？

**参考答案：**从真实日志脱敏采样正常、边界、失败和对抗用例，按任务/租户/语言/长度分层；明确输入、期望事实、允许差异、禁止行为和评分标准。训练/调 prompt 的样本与最终 holdout 分开。每次生产事故和人工纠错都应转化为回归样本，并记录数据集版本。

### Q99｜[高级][高频] LLM-as-a-Judge 有哪些风险？

**参考答案：**Judge 可能偏好长答案、特定风格或与自己相似的模型，也会被被评文本注入。应提供结构化 rubric、隐藏无关信息、交换候选顺序、对关键样本多 Judge/人工校准，并计算与人工的一致性。权限、安全和数值正确性优先用确定性检查，不能让 Judge 决定所有门禁。

### Q100｜[高级] Agent Trace 应如何切 Span？

**参考答案：**根 span 表示一次用户 run，子 span 覆盖上下文构建、每次模型 attempt、工具、检索、子 Agent、审批等待和持久化。关联 requestId、conversationId、agent path、模型、Token、stop reason 和错误码。敏感 prompt/输出默认不进 attribute，可用受控 event、hash 或采样。跨服务传播 trace context，才能定位前端到 Java Gateway 的延迟。

### Q101｜[高级] Agent 生产指标应该看什么？

**参考答案：**可靠性看成功率、超时、取消、工具错误、恢复和重复执行；质量看任务通过率、引用正确率、人工修改率；性能看首动作、首 Token、总时延和队列时间；成本看输入/输出 Token、工具费用和每成功任务成本；安全看 deny、审批、注入命中和越权尝试。指标必须按模型、版本、AgentType 和场景分桶。

### Q102｜[资深] 如何给 Agent 建立成本预算？

**参考答案：**把预算分为单 run Token、模型调用数、子 Agent 数、工具次数、检索文档量和墙钟时间，并按任务价值设置不同档位。路由先用便宜模型做简单分类，昂贵模型处理高难步骤；缓存稳定前缀和工具结果；并行任务也要共同扣减总预算。最终关注“每个成功业务任务成本”，而不是单 Token 价格。

### Q103｜[高级] 如何优化性能而不破坏正确性？

**参考答案：**先用 trace 找瓶颈，再优化：并行独立读、减少无用上下文和轮次、分页/Top-K、缓存可验证结果、把派生统计移出响应路径。任何快路径都要带来源 stamp/version，无法证明新鲜就回退权威慢路径。不能为了降低延迟跳过审批、scope 校验、持久化或最终对账。

### Q104｜[资深][项目题] “测试全绿”为什么不等于生产可用？

**参考答案：**单元/集成测试证明代码在给定环境和模型下满足断言，不证明真实 NFS/PVC、Pod 拓扑、负载均衡、强杀恢复、浏览器交互、真实供应商和混合版本发布。交付报告要分别写静态门禁、本地测试、隔离环境、真实基础设施和生产灰度状态。未运行的验收必须明确保留为风险。

---

## 十、全栈后端、网关与部署

### Q105｜[高级] Agent Middleware 和业务 Backend 为什么要分层？

**参考答案：**Middleware 负责模型运行、编排、上下文、工具策略和事件投影；Backend 负责业务领域、数据库事务、平台 API 和最终资源授权。这样模型框架可以演进而不污染业务模块，业务写规则也不会退化成 prompt。边界通过稳定 DTO/工具契约连接，双方都校验 scope，不能认为上游已经检查过就跳过。

### Q106｜[高级] SSE API 契约需要定义哪些内容？

**参考答案：**Content-Type、事件 envelope、序号/ID、心跳、完成事件、错误事件、断开和重连语义、代理超时及缓存头。POST 流通常不能直接依赖浏览器 `EventSource` 自动重连，需要客户端自行重发并携带幂等/恢复信息。服务端在 `close`/abort 时清 listener，但不能因此假设业务执行已取消。

### Q107｜[高级][项目题] Java Backend 如何保持模块自治？

**参考答案：**平台模块只依赖共享 core SPI，不直接互相调用；Controller 只做协议适配，Service 承担业务，Mapper/Client 访问数据和外部平台；DTO 与 Entity 分离。跨平台统一能力放 core，平台差异留在各自实现。数据库变更用新增 Flyway migration，避免不同模块通过共享表和实现类形成隐式耦合。

### Q108｜[资深] 长任务为什么常需要 Queue，而不是一直占用 HTTP？

**参考答案：**长任务跨越网关超时、用户断线和 worker 重启，需要持久化 run 状态、租约、重试、取消和进度事件。HTTP 负责创建任务与查询/订阅，Queue worker 执行。队列不自动解决幂等和顺序；同一 Conversation/资源可使用分区键或串行门禁，避免并发修改。

### Q109｜[高级][安全] Docker 镜像为什么不能 `COPY .env`？

**参考答案：**删除最终层中的文件也不代表旧镜像层没有秘密，镜像缓存、Registry 和构建日志都可能泄露。配置与 Secret 应在运行时注入，构建参数也不能承载长期密钥。前端 `VITE_*` 会进入静态产物，不适合秘密。发现已进入镜像的凭证要轮换，而不只是修改 Dockerfile。

### Q110｜[资深][项目题] Kubernetes 的 liveness、readiness 和 rollout 如何设计？

**参考答案：**liveness 只判断进程是否需要重启；readiness 判断当前实例是否能安全接流量，例如共享卷标记、恢复和 writer 身份是否就绪。关键是别把编排当互斥：Deployment 配 `replicas: 1` 并不保证同时只有一个 Pod——RollingUpdate 会短暂重叠，节点失联或 drain 同样可能让两个 Pod 一起活着。`strategy: Recreate`（或 `maxSurge: 0`）能消掉发布期重叠但要付停机代价；StatefulSet 才提供 at-most-one 语义，而且在节点分区下仍不是硬保证（Pod 卡在 Terminating，直到 kubelet 恢复或被强制删除）。所以单 writer 的真正护栏是权威存储侧的 fencing，编排层只降低概率、不消除窗口；多 writer 则需要显式 ownership/fencing。发布验收要查看 Deployment、Pod 实际环境、PVC/PV、Service/Endpoint 和探针，而不只看 YAML 模板。

---

## 十一、HuiTouAgent 项目深挖与资深系统设计题

### Q111｜[高级][项目题] 请用 3 分钟介绍 HuiTouAgent 的架构和你的核心贡献。

**参考答案示例：**

“这是一个广告投放领域的 Agent 平台，采用 React 前端、TypeScript Middleware 和 Java Spring Boot Backend 的分层架构。Middleware 将模型编排与业务系统隔开，以能力包 manifest 装配 AgentType、Skill、Tool 和动作策略；认证上下文生成 DataScope，PolicyGuard 决定 allow、deny 或进入人工审批；运行事件通过 EventBus/SSE 投影给前端。我的重点工作可以围绕 Conversation 分片与恢复、审批幂等、多 Agent 上下文隔离、配置 generation 热更新或流式 UI 展开。项目中我特别强调把本地门禁、真实 NFS/Kubernetes 验收和生产灰度分开汇报。”

**追问准备：**挑一项贡献讲清“原问题 → 证据 → 方案 → 失败窗口 → 测试 → 未完成边界”。

### Q112｜[资深][项目题] 设计一个“模型建议调整广告预算，但必须人工批准”的链路。

**参考答案：**

1. 请求入口从认证会话解析 DataScope，模型只看到业务上下文。
2. Agent 调用 `adjust_budget` 时，PolicyGuard 校验平台、allowlist、action 和 scope。
3. 命中 `approval_required` 后生成规范化快照、摘要、来源 Conversation、revision 和幂等指纹，不调用真实网关。
4. 有权限的用户查看并批准；执行前重验授权与快照新鲜度。
5. Executor 通过 operation lease/attempt 获取执行权，Gateway 注入凭证调用 Java Backend。
6. 终态写入权威存储，通过事件投影到原 Conversation；超时/崩溃按 operation ID 对账。

**关键点：**人工批准不是 UI 弹窗，而是一套可持久化、可审计、可恢复、不可重放旧参数的状态机。

### Q113｜[资深][项目题] 你会如何设计超长 Conversation 存储？

**参考答案：**元数据、消息事实、审批/任务事件和派生投影分开；消息采用追加式分片，记录稳定 seq/sourceRecordId，并维护可重建 manifest。读取按 Conversation、cursor、limit 做候选收窄和 Top-K，legacy 数据走兼容 reader。写入需要 durable append、路径安全、尾部半行恢复和 IO 计量；快照/投影带同源 stamp，验证失败回退权威读取。上线前做真实 NFS、强杀、向上分页和浏览器验收。

### Q114｜[资深][项目题] 如何从单 Writer 迁移到账号亲和的多 Writer？

**参考答案：**先盘点所有全局状态和写入口，再定义 `affinityKey → owner + epoch` 的权威 assignment。入口路由按账号到 owner，OwnerGuard 在每次写前验证当前磁盘/数据库 epoch，下游用 fencing 拒绝旧 owner。交接经历 draining、in-flight 清零、checkpoint、切 owner、恢复与开放流量；审批、任务、事件和 Token 状态均按账号分区。发布需支持混合版本门禁、cutover marker、回滚和真实双 Pod 故障注入。

### Q115｜[高级][项目题] 如何实现模型配置热更新？

**参考答案：**ConfigProvider 先探测 version，再拉取并验证快照；GenerationManager 构建完整模型资源，成功后原子发布。webhook、poll、manual 共用 single-flight 刷新；执行期间的新通知只标记 pending 并在结束后复查。旧会话固定旧 generation，新会话使用新代；失败保留上一成功代。公开自省只显示版本、来源和错误码，不显示 token/baseUrl 等秘密。

### Q116｜[高级][项目题] 新增一个业务 Agent/Skill/Tool 要经过哪些步骤？

**参考答案：**先确认平台 surface 和真实后端能力；在能力包 manifest 声明 AgentType、Skill、Tool、action policy、children 和预算；persona 只写身份边界，复杂流程放 Skill；tool-scopes 把业务 tool ID 映射到后端并由 Gateway 注入 scope。Loader 测 schema、文件、引用和唯一性；Policy 测 allow/deny/approval；再做 fake runtime、真实后端 smoke、前端事件和审批闭环。写动作默认先 inspect/build draft，再批准执行。

### Q117｜[资深][系统设计] 设计一个支持流式响应、工具卡片和历史恢复的 AI Chat UI。

**参考答案：**服务端提供 Conversation CRUD、cursor 历史和 POST 流式 endpoint；事件协议用可辨识联合，区分 text、tool、approval、error、done。前端以完整身份 + Conversation remount，维护权威时间线、optimistic ledger、pending 区和请求 epoch；解析流时处理拆包、重复和断流；向上分页按稳定 ID 合并。服务端把内部事件投影为脱敏公开事件，断线后客户端通过历史/cursor 对账，而不是要求 SSE 永不丢失。

### Q118｜[资深][故障题] 用户删除 Conversation 后它又出现，如何排查？

**参考答案：**先确认列表读取的权威文件/表、删除 revision 和是否真实写成 `deleted=true`；连续采样响应与实例标识，检查 Service 是否路由多个 writer、Pod uptime、Deployment replicas/strategy、共享卷和 NFS 缓存。区分“旧响应被前端重放”“另一个进程陈旧读”“权威元数据被覆盖”。前端 tombstone 可暂时抑制复现，但根治需要 writer 拓扑或并发协议修正，并重新做删除、列表、刷新和故障切换验收。

### Q119｜[资深][故障题] Agent 测试偶发卡住 5 分钟，如何诊断？

**参考答案：**先保留原始超时、活动 handle、端口、请求 trace 和测试顺序证据，再缩小到单文件/单用例并循环复现。给所有 HTTP/模型请求加有界 timeout 和可识别 cause，确保 Framework、HTTP server、timer、listener 和 stream 在 finally 关闭。比较串行/并行、端口复用和资源占用，但未复现的猜测不能写成根因。Containment 通过不等于底层原因已确认。

### Q120｜[资深][系统设计] 设计一个企业级多租户 Agent 平台，你会如何分层？

**参考答案：**

- **接入层**：认证、租户、速率限制、请求幂等、HTTP/SSE/A2A。
- **控制面**：Agent/Skill/Tool Registry、版本、签名、策略、模型路由、灰度。
- **运行面**：Agent loop、Workflow、Multi-Agent、沙箱、预算、取消与 checkpoint。
- **工具面**：统一 Gateway、MCP/client、凭证注入、scope 校验、审批和审计。
- **状态面**：Conversation、任务、长期记忆、事件日志、投影、向量/关系存储。
- **质量面**：trace、指标、离线 eval、在线采样、红队、安全响应。
- **部署面**：队列 worker、分区 ownership、fencing、容灾、数据删除和发布协议。

资深回答还应说明最初会做多小：优先单 Agent + 确定性 Workflow + 少量工具，先建立权限、状态和 eval 基线，再按可测收益引入 Multi-Agent 与跨组织协议。

---

## 十二、面试表达模板

### 1. 项目题：STAR 不够，建议使用 E-D-D-V-B

- **Evidence（证据）**：日志、调用链、代码路径、测试或环境采样说明问题真实存在。
- **Diagnosis（诊断）**：区分症状、直接原因和仍未确认的底层原因。
- **Decision（决策）**：列候选方案、关键 trade-off 和最终选择。
- **Verification（验证）**：说明单测、集成、多进程、浏览器或真实环境分别验证了什么。
- **Boundary（边界）**：明确尚未覆盖的生产、供应商、故障切换或灰度验收。

### 2. 架构题：先不画“大饼”，先回答 7 个问题

1. 权威状态在哪里？
2. 谁能写，权限从哪里来？
3. 并发冲突如何检测？
4. 中途崩溃如何恢复？
5. 事件如何去重、排序和重放？
6. 如何观测质量、延迟、成本与安全？
7. 哪些结论只在本地成立，哪些已经过真实环境验证？

### 3. 高频代码题准备清单

- 用可辨识联合实现 Agent 状态机和穷尽检查。
- 实现带 `AbortSignal`、timeout、重试分类的工具调用 helper。
- 实现有并发上限的 Promise pool，并返回部分失败。
- 实现 SSE 增量 parser，覆盖 chunk 拆分和末尾残片。
- 实现 cursor 时间线合并、稳定 ID 去重和 latest-request-wins。
- 用 Zod/TypeBox 定义工具 schema 并推导 TypeScript 类型。
- 设计幂等审批接口：create、approve、execute、status。
- 设计一组 Agent trace span 和关键指标。

### 4. 面试官判断“高级”与“资深”的常见分界

| 维度       | 高级回答                     | 资深回答                                          |
| ---------- | ---------------------------- | ------------------------------------------------- |
| Agent      | 能实现 Tool Calling 和工作流 | 知道何时不用 Agent，并能控制权限、成本与失败恢复  |
| TypeScript | 类型安全、异步和测试扎实     | 能设计跨包契约、运行时校验、版本演进和隔离边界    |
| 前端       | 能完成流式 UI                | 能处理身份切换、乱序、断流、历史对账和安全渲染    |
| 状态       | 会用数据库/文件保存          | 能指出权威、投影、CAS、fencing、幂等和恢复窗口    |
| 安全       | 知道 Prompt Injection        | 用最小权限、Gateway、审批、沙箱和审计限制爆炸半径 |
| 质量       | 会写单测                     | 建立离线 eval、生产 trace、事故回归和分层验收     |
| 沟通       | 能讲实现                     | 能讲证据、取舍、边界和跨团队落地路径              |

### 5. 可以反问面试官的问题

- 你们的 Agent 主要是开放式决策，还是固定 Workflow 中的模型节点？
- Tool 的认证、租户隔离与写动作审批由哪一层负责？
- 当前最难的质量问题来自检索、模型、工具、状态还是评测？
- 是否有统一 trace、离线 eval 数据集和线上反馈闭环？
- 长任务如何持久化、取消、恢复和处理重复执行？
- Multi-Agent 是因权限/并行/上下文分治引入，还是主要为了角色体验？
- TypeScript 在系统里承担前端、BFF、Agent Runtime 还是 SDK 契约？
- 团队如何区分本地验证、预发验收和生产灰度成功？

---

## 十三、项目代码阅读索引

以下路径用于面试前把抽象回答重新落到真实实现，状态以 2026-08-12 当前工作树为准：

- Agent/Skill/Tool：`docs/架构说明/AgentType-Skill-Tool架构与渐进式加载/README.md`
- 能力包契约：`capability-packages/manifest.schema.json`
- 千川能力包：`capability-packages/qianchuan-uniprom/manifest.json`
- DataScope：`apps/middleware/src/contracts/data-scope.ts`
- PolicyGuard：`apps/middleware/src/policy/policy-guard-default.ts`
- AgentType Registry：`apps/middleware/src/registry/agent-type-registry.ts`
- Multi-Agent：`apps/middleware/src/multi-agent/`
- Tool Gateway：`apps/middleware/src/tools/`
- 审批执行与租约：`apps/middleware/src/approval/`
- Conversation/分片/投影：`apps/middleware/src/chat-history/`
- Revision Log：`apps/middleware/src/state/revision-log.ts`
- 配置 Generation：`apps/middleware/src/runtime/generation-manager.ts`
- Agent 事件与 SSE：`apps/middleware/src/events/`、`apps/middleware/src/server/server.ts`
- 流式聊天前端：`apps/frontend/src/components/AgentChatPanel/`
- Java Core：`apps/backend/huitou-module-core/`
- 平台实现：`apps/backend/huitou-platform-gdt/`、`apps/backend/huitou-platform-oceanengine/`

---

## 十四、官方延伸阅读与当前高频方向

以下资料用于校准题库中的协议、工程与安全概念。协议和 SDK 会继续演进，面试前建议检查最新版本。

1. [Model Context Protocol：2026-07-28 规范更新](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
   —— Stateless core、授权增强、任务和扩展机制等。
2. [OpenAI Agents SDK for TypeScript](https://openai.github.io/openai-agents-js/)
   —— Agent、Tool、Handoff、Guardrail、Tracing、Sandbox 与 Realtime。
3. [A2A Protocol](https://a2a-protocol.org/latest/)
   —— 跨框架、跨供应商 Agent 的能力发现、任务与消息互操作。
4. [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
   —— Trace、Metric、Log 的通用语义约定及 GenAI 规范入口。
5. [OWASP LLM06:2025 Excessive Agency](https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html)
   —— 最小功能、最小权限、最小自主性与人工确认。
6. [LangGraph 概览](https://langchain-ai.github.io/langgraph/index.html)
   —— Durable execution、Streaming、Human-in-the-loop 与 Persistence。
7. [Node.js Async Context](https://nodejs.org/api/async_context.html)
   —— `AsyncLocalStorage`、`AsyncResource` 与异步上下文传播。
8. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
   —— Narrowing、Generics、Conditional Types 与 Module Resolution。
9. [React 官方文档](https://react.dev/learn)
   —— State、Effect、并发渲染与组件状态所有权。
10. [MDN：Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
    —— SSE 格式、连接与浏览器行为。

### 最后检查

面试前如果只能复习一遍，请确保能独立回答以下 10 个问题：

1. Agent 和 Workflow 如何取舍？
2. AgentType、Skill、Tool、MCP、A2A 分别解决什么？
3. 为什么模型生成合法参数不等于获得执行授权？
4. 如何防 Prompt Injection 和 Excessive Agency？
5. Conversation、Session、Run、Memory 如何分层？
6. SSE 流如何处理拆包、断流、迟到响应和历史对账？
7. 幂等、CAS、Lease 和 Fencing 各解决什么？
8. Multi-Agent 何时有收益，何时只是增加复杂度？
9. 如何用 Eval、Trace 和生产指标证明 Agent 质量？
10. 如何诚实地区分“代码完成”“本地全绿”和“生产就绪”？
