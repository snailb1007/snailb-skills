# PRD: AI Agent Tool Routing Rules
## "God Combo" Orchestration cho stack 8 MCP servers

**Status:** Draft v0.1
**Owner:** [your-name]
**Last updated:** 2026-05-25
**Target delivery:** Phase 1 trong 1 tuần

---

## TL;DR

Build một bộ rules + skill files để orchestrate 8 MCP servers (claude-mem, context-mode, context7, gitnexus, semble, grep, brave, filesystem) cho AI coding agent. Mục tiêu: agent tự detect workflow mode trước khi search, route tool đúng theo mode, và memory không pollute giữa các project.

**Vấn đề cốt lõi:** Khi nhồi 8 MCP vào một agent mà không có routing layer, agent sẽ scattergun search, mode-bleed, và đốt context vô ích. Bộ rules này biến "god combo" từ rủi ro thành lợi thế.

---

## 1. Bối cảnh

### 1.1 Stack hiện tại

8 MCP servers được dùng đồng thời trong workflow:

| Tool | Vai trò | Scope |
|---|---|---|
| claude-mem | Persistent memory across sessions | Cross-session |
| context-mode | Sandbox tool output, giảm 98% context bloat | Per-session |
| context7 | Up-to-date library docs | Per-query |
| gitnexus | Code knowledge graph (Tree-sitter AST) | Per-repo |
| semble | Semantic code chunk retrieval (CPU, ~98% fewer tokens) | Per-repo |
| grep (Vercel) | Public GitHub code search (1M+ repos) | External |
| brave | General web search | External |
| filesystem | File I/O standard MCP | Per-session |

### 1.2 Tình huống "hybrid god combo"

User dùng combo này cho **cả 4 workflow đồng thời**, không tách biệt:
- Feature development trên codebase quen
- Onboarding codebase lạ
- Research / prototype / so sánh approach
- Maintenance / bug fix đa dự án

Đây là use case khó nhất vì agent phải phân biệt được "đang làm gì" trước khi chọn tool.

### 1.3 Tại sao cần routing layer

Không có rules, agent sẽ:
- Ưu tiên grep (Vercel) cho mọi câu hỏi code vì "quen" — kể cả internal codebase
- Bỏ qua claude-mem vì không có trigger explicit
- Chạy gitnexus cho câu hỏi 1 dòng → đốt context vô ích
- Đọc full file qua filesystem trước khi nghĩ tới semble
- Carry decisions của Project A sang Project B (memory leak)

---

## 2. Problem Statement

### 2.1 Failure modes cụ thể (đã quan sát)

**F1. Tool description overhead**
8 MCP servers nhồi vài nghìn token tool definitions vào system prompt mỗi turn, bất kể task có cần hết hay không.

**F2. Memory layer conflict**
claude-mem (long-term) và context-mode session continuity (short-term) cùng claim "session state truth" → agent confused về source of truth khi resume.

**F3. Mode bleed**
Khi user chuyển từ feature dev sang debugging, agent vẫn search với bias của mode cũ → decision cũ làm noise cho bug hiện tại.

**F4. Search drift**
Agent search 1 lần ra ít kết quả → reformulate query → lặp 4-5 lần. Không có stop condition.

**F5. Premature indexing**
Agent tự ý chạy `gitnexus analyze --force` hoặc `semble index` mid-conversation, mất 30s-2min, làm gián đoạn flow.

**F6. Cross-project leak**
claude-mem không filter theo project → decision của project A áp lên project B. Silent killer trong workflow đa dự án.

**F7. Scattergun search**
Agent gọi semble + gitnexus + grep cùng một câu hỏi → 3x output, 3x context, không tăng quality.

**F8. context-mode bypass**
Một số tool gọi raw bash sẽ né được context-mode interception → raw output flood context.

### 2.2 Cost của không-fix

- Token consumption per task: ước tính cao hơn 40-60% so với routing tối ưu
- Context window cạn trước khi task xong → buộc compact → mất nhuance
- User phải micro-manage agent ("dùng semble đi, không phải grep") → mất productivity
- Memory dài hạn trở thành noise thay vì asset

---

## 3. Goals & Non-goals

### 3.1 Goals

- **G1:** Agent tự detect mode (F/O/R/M) trước mọi tool call quan trọng
- **G2:** Decision tree rõ ràng cho từng mode, không có "default behavior" mơ hồ
- **G3:** Memory hierarchy có source-of-truth rõ ràng, không conflict claude-mem ↔ context-mode
- **G4:** Tag taxonomy chuẩn cho claude-mem, filter được theo project + type + mode
- **G5:** Token budget rules <2KB cho CLAUDE.md core, <3KB mỗi skill file
- **G6:** Anti-pattern được enforce explicit, không phải hint
- **G7:** Mode switching giữa cuộc hội thoại được announce, không silent

### 3.2 Non-goals

- **NG1:** Không tự động install / setup MCP servers
- **NG2:** Không build MCP server mới
- **NG3:** Không thay thế judgment của user — vẫn cho phép override rules
- **NG4:** Không optimize cho stack khác (chỉ 8 MCP này)
- **NG5:** Không cover non-coding workflow (writing, research general)

---

## 4. Stakeholders

| Stakeholder | Role | Concerns |
|---|---|---|
| Primary user | Solo dev hoặc team lead dùng Claude Code | Productivity, token cost, agent reliability |
| Secondary user | Team member cùng workflow | Consistency, onboarding new project |
| Maintainer | Người update rules khi MCP thay đổi | Maintainability, version control |

---

## 5. Solution Overview

### 5.1 Triết lý gốc (3 nguyên tắc)

Mọi rule phải derive từ 3 nguyên tắc này để không mâu thuẫn:

1. **Cheapest first** — memory lookup < cache lookup < local index < remote search. Luôn check cái rẻ trước.
2. **Exact > Semantic > Lexical** — biết tên hàm chính xác thì dùng gitnexus, khái niệm mơ hồ thì semble, không cả hai thì mới đến grep.
3. **Local > Public** — câu hỏi về codebase nội bộ thì semble/gitnexus trước, grep (Vercel) chỉ khi cần học pattern từ ngoài.

### 5.2 Mode detection layer

Trước mọi tool call quan trọng, agent xác định mode dựa trên signals:

| Mode | Signals | Default heavy tools | Default light tools |
|---|---|---|---|
| **F** (Feature dev) | Tên file/module cụ thể, codebase đã có context | semble, claude-mem | gitnexus, context7 |
| **O** (Onboarding) | "Đây là repo gì", "kiến trúc", lần đầu nhắc repo | gitnexus, filesystem | semble (lazy), claude-mem (defer) |
| **R** (Research) | "Nên dùng X hay Y", "best practice" | context7, grep, brave | semble/gitnexus (chỉ khi prototype) |
| **M** (Maintenance) | "Bug", "không chạy", "regression" | claude-mem (bug tag), gitnexus | brave (cuối) |

Nếu mode ambiguous → hỏi user 1 câu, KHÔNG đoán.

### 5.3 Tag taxonomy cho claude-mem

Đây là phần quyết định god combo có scale được không.

**Mandatory tags (mọi memory entry):**
- `proj:<repo-name>` — vd: `proj:acme-api`
- `type:` — một trong: `decision | bug | pattern | api | gotcha | todo`

**Recommended tags:**
- `mode:` — `feature | onboard | research | maint` (mode lúc tạo memory)
- `lib:<name>` — nếu liên quan thư viện ngoài
- `severity:` — `low | med | high` (cho type:bug)

**Search filter strategy per mode:**
- Mode F: `proj:current AND type:(decision|pattern|gotcha)`
- Mode O: `proj:current AND type:(decision|pattern)` — bỏ qua bug/todo
- Mode R: `lib:<name>` cross-project, KHÔNG filter proj
- Mode M: `proj:current AND type:(bug|gotcha)` ưu tiên cao nhất

### 5.4 Memory hierarchy

| Layer | Tool | Scope | Source of truth cho |
|---|---|---|---|
| Long-term intent | claude-mem | Cross-session, weeks/months | "Tại sao ta làm X", decisions, patterns |
| Short-term state | context-mode session | Within current session | "File đã đọc, command đã chạy" |

**Conflict resolution:** claude-mem thắng khi nói về *ý định*; context-mode thắng khi nói về *trạng thái session hiện tại*. Không bao giờ để cả hai cùng lưu cùng một loại thông tin.

### 5.5 Output discipline

- Mọi tool call có output > 10KB phải đi qua context-mode wrapper
- Không cat full file > 500 lines — dùng semble chunk
- Khi gitnexus trả graph result, chỉ giữ subset relevant trong reasoning
- Không reproduce search results — chỉ cite hoặc summarize

---

## 6. Detailed Requirements

### 6.1 Functional Requirements

**FR1: Mandatory mode detection**
Trước khi gọi tool đầu tiên trong một user turn, agent MUST output (internal hoặc visible) mode detected. Nếu không xác định được, MUST ask user.

**FR2: claude-mem filtering**
Mọi `claude-mem search` MUST đi kèm filter `proj:` và filter `type:` phù hợp với mode. Search không filter là violation.

**FR3: Anti-pattern enforcement**
Rules MUST list explicit các anti-pattern (xem section 9). Agent gặp anti-pattern MUST refuse và explain, không chỉ warn.

**FR4: Mode switching announcement**
Khi mode thay đổi giữa cuộc hội thoại, agent MUST announce ngắn ("→ chuyển sang mode M") và clear search bias của mode cũ.

**FR5: Stale index warning**
Khi phát hiện gitnexus/semble index cũ hơn HEAD git, agent MUST cảnh báo user, KHÔNG tự re-index.

**FR6: Search drift stop condition**
Nếu 2 search consecutive không ra kết quả relevant, agent MUST STOP và ask user, không thử query thứ 3.

**FR7: context-mode mandatory wrap**
Mọi tool call có expected output > 10KB MUST route qua context-mode. Tool nào bypass được phải document explicit và justified.

### 6.2 Non-functional Requirements

**NFR1: Token budget**
- CLAUDE.md core: ≤ 2KB
- Mỗi skill file: ≤ 3KB
- Tổng overhead per turn: ≤ 1500 tokens (chỉ load CLAUDE.md, skills load on-demand)

**NFR2: Maintainability**
- Rules có version số rõ ràng
- Mỗi rule có rationale comment
- Thay đổi MCP stack → update rules trong cùng commit

**NFR3: Compatibility**
- Primary target: Claude Code
- Secondary: Cursor, OpenCode, Windsurf (skill format đa số tương thích)
- Không assume tool nào specific cho 1 platform

**NFR4: Discoverability**
- Cấu trúc file convention chuẩn (`.claude/CLAUDE.md`, `.claude/skills/<name>/SKILL.md`)
- README giải thích cách load và override

---

## 7. Architecture

### 7.1 File structure

```
.claude/
├── CLAUDE.md                          # Core rules (always loaded)
│   ├── 3 triết lý gốc
│   ├── Mode detection (Step 0)
│   ├── High-level decision tree
│   └── Top-level anti-patterns
│
├── skills/
│   ├── code-search/
│   │   ├── SKILL.md                   # Routing chi tiết: semble vs gitnexus vs grep
│   │   └── examples.md                # Few-shot patterns
│   │
│   ├── memory-recall/
│   │   ├── SKILL.md                   # Tag taxonomy + claude-mem patterns
│   │   └── tag-cheatsheet.md
│   │
│   └── external-research/
│       └── SKILL.md                   # context7 + grep (Vercel) + brave routing
│
└── README.md                          # Setup guide + override docs
```

### 7.2 Loading strategy

- **Always loaded:** `CLAUDE.md` (core decision tree, ~2KB)
- **On-demand:** skill files (chỉ load khi agent thật sự engage với loại task đó)
- **Rationale:** giữ context budget thấp baseline, expand khi cần

### 7.3 Override mechanism

User có thể override rules trong từng turn bằng explicit command:
- `--force-tool=<name>` → bypass routing
- `--mode=<F|O|R|M>` → fix mode, không auto-detect

Override phải được log để review sau.

---

## 8. Implementation Plan

### Phase 1: Core rules (Week 1)

- [ ] Viết CLAUDE.md v1 với Step 0 + decision tree gọn
- [ ] List 10 anti-patterns hàng đầu
- [ ] Test với 5 case (1 per mode + 1 ambiguous)
- [ ] Validate token budget < 2KB

**Deliverable:** `.claude/CLAUDE.md` working, agent biết detect mode.

### Phase 2: Skill files (Week 2)

- [ ] `code-search/SKILL.md` với decision matrix semble/gitnexus/grep
- [ ] `memory-recall/SKILL.md` với tag taxonomy chi tiết
- [ ] `external-research/SKILL.md` với context7/grep/brave routing
- [ ] Few-shot examples cho mỗi skill

**Deliverable:** Full skill suite, agent load on-demand đúng skill.

### Phase 3: Validation (Week 3)

- [ ] Build test harness: 20 case study cover 4 modes + edge cases
- [ ] Đo metrics: token/task, tool calls/task, drift incidents
- [ ] So sánh baseline (no rules) vs v1
- [ ] Document failure modes còn lại

**Deliverable:** Validation report + v1.1 fixes.

### Phase 4: Refinement (ongoing)

- [ ] Telemetry từ real usage
- [ ] Iterate trên weak spots (mode mis-classification, missed filtering)
- [ ] Version bumping khi MCP stack thay đổi

---

## 9. Anti-patterns (Enforced list)

### Existing (carried over)
- A1: Chạy gitnexus cho câu hỏi không phải structural
- A2: Dùng semble + grep + gitnexus cùng một câu hỏi (scattergun)
- A3: Đọc context7 docs xong vẫn grep code base nội bộ tìm cùng API
- A4: Skip claude-mem khi user nói "như hôm trước", "tiếp tục"

### God-combo specific
- A5: **Mode bleed** — search với filter của mode cũ sau khi switch
- A6: **Premature gitnexus** — chạy gitnexus ở Mode R (chưa có repo target)
- A7: **Onboard with memory** — search claude-mem ở Mode O cho repo lần đầu
- A8: **Cross-project leak** — claude-mem search không filter `proj:`
- A9: **Search drift** — search thứ 3 sau 2 lần fail
- A10: **Bypass context-mode** — gọi raw bash với output lớn

---

## 10. Success Metrics

### Quantitative

| Metric | Baseline (no rules) | Target | Method |
|---|---|---|---|
| Tokens per task (median) | 100% | -30% | Sum context-mode `ctx_stats` |
| Tool calls per task (median) | 100% | -25% | Count from session log |
| Search drift incidents | x per 10 task | <1 per 10 task | Manual review |
| Mode mis-classification | unknown | <10% | Sample 50 task, label |
| Memory pollution events | unknown | 0 critical | Tag audit weekly |

### Qualitative

- User không phải nhắc agent "use X tool" cho > 90% task
- Agent không thrash giữa tool (visible smooth flow)
- Memory search return relevant > 80% lần (subjective rating)
- New repo onboarding < 3 prompts để agent có map

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Rules rot khi thay MCP stack | High | High | Version control, review checklist khi update stack |
| Mode mis-classification | Med | Med | Ambiguity escalation, ask user when unsure |
| Token overhead lớn hơn dự kiến | Med | Med | Skill on-demand load, monitor token telemetry |
| Memory tag không consistent across team | High | High | Tag enforcement trong CLAUDE.md, lint scripts |
| context-mode crash → flood context | Low | High | Fallback rule: nếu context-mode unavailable, refuse tool calls > 10KB |
| User override bị abuse → bypass rules | Med | Low | Log overrides, weekly review |
| Skill files conflict với platform default | Low | Med | Test trên Claude Code + 1 alternative |

---

## 12. Open Questions

1. **Multi-repo workspace:** Khi user mở nhiều repo cùng lúc, claude-mem `proj:` filter có nên auto-detect repo hiện tại hay user phải declare?

2. **Mode F vs M overlap:** Khi feature dev có bug ẩn phát hiện giữa chừng, agent nên stay-F hay switch-M? Cost của false switch?

3. **Tag taxonomy extension:** Có cần thêm `urgency:` hay `confidence:` không? Trade-off: tag càng nhiều, search filter càng phức tạp.

4. **Cross-project memory sharing:** Pattern từ Project A có nên surface cho Project B không (cùng team)? Bật/tắt như thế nào?

5. **Skill file format chuẩn:** Stick với SKILL.md convention của Claude Code, hay normalize cho cả Cursor/OpenCode?

6. **Telemetry storage:** Đo metrics ở đâu? context-mode `ctx_insight` đủ chưa, hay cần custom logger?

7. **Onboarding bootstrap:** Lần đầu vào repo lạ, có nên auto-run `gitnexus wiki` không hay phải user trigger?

---

## 13. Appendix

### A. Tool Inventory chi tiết

**claude-mem**
- Type: Persistent memory MCP
- Storage: Local SQLite + semantic search
- Hooks: PreToolUse, PostToolUse, SessionStart
- Strength: Cross-session continuity
- Watch out: Tag discipline cần thiết để không noise

**context-mode**
- Type: Output sandbox + session state
- Storage: Local FTS5 + BM25 search
- Reduction: ~98% raw output → context
- Strength: Khuếch đại hiệu quả mọi tool khác
- Watch out: Crash → fallback chưa rõ

**context7**
- Type: Library docs MCP
- Source: Upstash-curated, version-specific
- Strength: Anti-hallucination cho stale API
- Watch out: Cover thư viện phổ biến, lib niche có thể thiếu

**gitnexus**
- Type: Code knowledge graph
- Engine: Tree-sitter AST + LadybugDB
- Tools: 7-16 MCP tools (impact, callers, rename, wiki gen)
- Strength: Structural awareness, blast radius
- Watch out: Indexing time với repo lớn

**semble**
- Type: Semantic code chunk retrieval
- Engine: CPU embeddings (~250ms index, ~1.5ms query)
- Reduction: ~98% fewer tokens vs grep+read
- Strength: Fast, accurate, zero setup
- Watch out: Sub-agents không call MCP trực tiếp (cần Bash fallback)

**grep (Vercel)**
- Type: Public GitHub code search
- Source: grep.app API, 1M+ repos
- Strength: Pattern learning từ OSS
- Watch out: KHÔNG dùng cho internal codebase

**brave search**
- Type: General web search
- Strength: Đủ tốt cho query nhanh
- Watch out: Có thể đổi sang Exa/Tavily nếu cần research chất lượng

**filesystem**
- Type: Standard file I/O MCP
- Strength: Bắt buộc phải có
- Watch out: Output lớn phải wrap qua context-mode

### B. Glossary

- **MCP:** Model Context Protocol, chuẩn của Anthropic cho tool integration
- **Mode (F/O/R/M):** Feature / Onboarding / Research / Maintenance
- **Mode bleed:** Carry search bias từ mode cũ sang mode mới
- **Scattergun search:** Gọi nhiều search tool cho cùng một câu hỏi
- **Blast radius:** Phạm vi tác động của một code change
- **Compact:** Quá trình LLM nén lại conversation khi context đầy

### C. References

- Stack discussion (chat session 2026-05-25)
- claude-mem docs: https://docs.claude-mem.ai
- context-mode: https://context-mode.com
- gitnexus: https://github.com/abhigyanpatwari/GitNexus
- semble: https://github.com/MinishLab/semble
- Grep MCP: https://vercel.com/blog/grep-a-million-github-repositories-via-mcp

---

## 14. Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Owner | [you] | | Draft |
| Reviewer 1 | | | Pending |
| Reviewer 2 | | | Pending |

**Next step:** Review draft, finalize Phase 1 scope, kick off CLAUDE.md v1.