---
name: map-critical-path
description: Build a traceable, capacity-aware critical-path plan and Mermaid Gantt chart from validated SMART tasks.
---

# Map the critical path

Use this skill after the selected MVP has validated SMART tasks. Write `5-smart-tasks/critical-path.md` with a dependency network, time estimates, capacity assumptions, critical path, resource-order decisions, scenario range, buffer and Mermaid Gantt chart.

## Inputs and checks

Read every included task, its story and requirement links, constraints, risks and the MVP acceptance boundary. Reject tasks that fail SMART, have no traceability link, have unknown duration represented as zero, or do not contribute to one finish milestone: the accepted first result has met its acceptance conditions and the named client has recorded acceptance.

Use finish-to-start dependencies unless a real handoff justifies overlap. Keep technical predecessors distinct from resource-order predecessors caused by one engineer's capacity. Represent external permission, data or client review waits with their owner and calendar assumption. Resolve cycles before calculation.

## Calculation

For each lower, central and upper scenario, calculate earliest start/finish through the directed acyclic network, then latest start/finish and total float from the finish milestone. Identify every zero-float path, not only one path. Check concurrent demand on the engineer and add explicit resource-order links where needed, then recalculate the feasible plan. Keep the dependency-only result as a comparison when useful.

Show engineer effort separately from elapsed working days. Never turn an unknown duration into zero. If no defensible range exists, create a bounded investigation task with a question, allowance and review point rather than manufacturing a schedule.

See [EXAMPLES.md](./EXAMPLES.md) for a worked capacity-aware network, scenario range, Mermaid schedule and gate-failure examples.

## Mermaid output

Include:

- a `flowchart LR` dependency network with task IDs, requirement/story links and the finish milestone;
- a table of lower/central/upper effort and elapsed scenarios, capacity and assumptions;
- the central critical path and any alternative zero-float paths;
- a `gantt` chart with working-day durations, external waits, client review and a visibly labelled completion buffer;
- the difference between central forecast and selected planning target;
- limits: provisional scenarios are not deadlines or confidence intervals.

## Sources

- [GAO Schedule Assessment Guide](https://www.gao.gov/products/gao-16-89g)
- Source paper: `.agents/source/journal.pdf`, Sections 3.4, 3.5, 4.7 and Appendix B.6.

Do not use a priority list as a critical path. Critical path is derived from dependencies, durations and capacity assumptions; MoSCoW is a scope-priority decision.
