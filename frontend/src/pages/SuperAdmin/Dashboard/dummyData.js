// src/pages/SuperAdmin/Dashboard/dummyData.js

// ===== MonthlyComparison =====
export const monthlyDummy = [
  { month: "Jan", value: 32 },
  { month: "Fev", value: 45 },
  { month: "Mar", value: 51 },
  { month: "Abr", value: 39 },
  { month: "Mai", value: 62 },
  { month: "Jun", value: 57 },
  { month: "Jul", value: 71 },
  { month: "Ago", value: 66 },
  { month: "Set", value: 59 },
  { month: "Out", value: 63 },
  { month: "Nov", value: 52 },
  { month: "Dez", value: 48 },
];

// ===== CategoryDistribution =====
export const categoryDummy = [
  { category: "Certidões", value: 120 },
  { category: "Protestos", value: 95 },
  { category: "Casamentos", value: 43 },
  { category: "Registros", value: 150 },
  { category: "Firmas", value: 87 },
];

// ===== HeatmapDias =====
export const heatmapDummy = [
  { day: "Seg", value: 85 },
  { day: "Ter", value: 102 },
  { day: "Qua", value: 77 },
  { day: "Qui", value: 134 },
  { day: "Sex", value: 98 },
  { day: "Sáb", value: 45 },
  { day: "Dom", value: 12 },
];

// ===== RankingProfissionais =====
export const rankingProfDummy = [
  { name: "João Souza", score: 98 },
  { name: "Mariana Lima", score: 92 },
  { name: "Carlos Silva", score: 88 },
  { name: "Fernanda Rocha", score: 85 },
  { name: "Lucas Martins", score: 82 },
];

// ===== TimelineProcess =====
export const timelineDummy = [
  { label: "Entrada do Pedido", date: "2025-02-01" },
  { label: "Separação de Documentos", date: "2025-02-02" },
  { label: "Verificação Cartorial", date: "2025-02-03" },
  { label: "Aprovação", date: "2025-02-05" },
  { label: "Finalização", date: "2025-02-06" },
];

// ===== AuditLogs =====
export const auditDummy = [
  { user: "SuperAdmin", action: "Criou cartório", date: "2025-02-01 10:12" },
  { user: "Admin XPTO", action: "Editou agendamento", date: "2025-02-02 14:22" },
  { user: "João Silva", action: "Gerou relatório", date: "2025-02-03 09:51" },
  { user: "SuperAdmin", action: "Removeu usuário", date: "2025-02-04 16:37" },
];
